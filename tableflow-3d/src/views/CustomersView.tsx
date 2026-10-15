import { useMemo, useState } from 'react'
import { Crown, Search, UserPlus, ShieldCheck } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Button, Card, Empty, Field, Input, Modal, Segmented } from '../components/ui'
import { CustomerDetail, visitsOf } from '../components/CustomerDetail'
import { cn, initials } from '../lib/utils'
import { useIsMobile } from '../lib/hooks'

export function CustomersView() {
  const customers = useStore((s) => s.customers)
  const reservations = useStore((s) => s.reservations)
  const selectedId = useStore((s) => s.selectedCustomerId)
  const role = useStore((s) => s.settings.role)
  const a = useStore.getState()
  const mobile = useIsMobile()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | 'vip' | 'regular' | 'allergies'>('all')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })

  const list = useMemo(
    () =>
      customers
        .map((c) => ({ c, visits: visitsOf(c, reservations) }))
        .filter(({ c }) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')))
        .filter(({ c, visits }) => (filter === 'vip' ? c.vip : filter === 'regular' ? visits >= 5 : filter === 'allergies' ? !!c.allergies : true))
        .sort((x, y) => x.c.name.localeCompare(y.c.name)),
    [customers, reservations, q, filter],
  )

  const create = () => {
    if (!form.name.trim()) return
    const id = a.saveCustomer({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() })
    a.selectCustomer(id)
    setForm({ name: '', phone: '', email: '' })
    setCreating(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 pb-24 lg:px-6 lg:pb-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input placeholder="Nom ou téléphone…" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-56 pl-8" />
        </div>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Tous' },
            { value: 'vip', label: 'VIP' },
            { value: 'regular', label: 'Réguliers' },
            { value: 'allergies', label: 'Allergies' },
          ]}
        />
        <span className="flex items-center gap-1 text-xs text-muted">
          <ShieldCheck size={13} /> Vue {role === 'manager' ? 'responsable' : 'serveur (coordonnées masquées)'}
        </span>
        <Button className="ml-auto" size="sm" variant="primary" onClick={() => setCreating(true)}>
          <UserPlus size={14} /> Nouveau client
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <Card className="p-2">
          {list.length ? (
            <ul>
              {list.map(({ c, visits }) => (
                <li key={c.id}>
                  <button
                    onClick={() => a.selectCustomer(c.id)}
                    className={cn('flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left', selectedId === c.id ? 'bg-accent-soft' : 'hover:bg-black/[0.03]')}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1EEE8] text-[11px] font-semibold">{initials(c.name)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1 truncate text-[13px] font-medium">
                        {c.name} {c.vip && <Crown size={11} className="shrink-0 text-st-reserved" />}
                      </span>
                      <span className="text-xs text-muted">
                        {visits} visite{visits > 1 ? 's' : ''}
                        {c.allergies && ' · allergie'}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Aucun client trouvé.</Empty>
          )}
        </Card>
        {!mobile && (
          <Card className="p-5">
            {selectedId ? <CustomerDetail key={selectedId} customerId={selectedId} /> : <Empty>Sélectionnez un client pour afficher sa fiche.</Empty>}
          </Card>
        )}
      </div>

      {mobile && (
        <Modal open={!!selectedId} onClose={() => a.selectCustomer(null)} title="Fiche client">
          {selectedId && <CustomerDetail key={selectedId} customerId={selectedId} compact />}
        </Modal>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Nouveau client">
        <div className="space-y-3">
          <Field label="Nom *">
            <Input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Téléphone">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
          </div>
          <p className="text-xs text-muted">Ne collectez que les informations utiles au service, avec l’accord du client.</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={create} disabled={!form.name.trim()}>
              Créer la fiche
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
