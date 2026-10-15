import { useState } from 'react'
import { Crown, Lock, Mail, Phone, Trash2, Pencil, CalendarPlus, TriangleAlert } from 'lucide-react'
import { useClock, useStore } from '../store/useStore'
import { Button, Field, Input, Modal, SectionTitle, Textarea, Toggle, useTwoStep } from './ui'
import { formatDateShort, initials, maskEmail, maskPhone, roundQuarter, todayStr } from '../lib/utils'
import { tableLabel } from '../lib/layout'
import type { Customer, Reservation } from '../types'

export const visitsOf = (c: Customer, reservations: Reservation[]) =>
  c.priorVisits + reservations.filter((r) => r.customerId === c.id && (r.status === 'completed' || r.status === 'seated')).length

const RES_LABEL: Record<Reservation['status'], string> = {
  pending: 'À confirmer',
  confirmed: 'Confirmée',
  seated: 'Installée',
  completed: 'Venue',
  cancelled: 'Annulée',
  noshow: 'Absente',
}

export function CustomerDetail({ customerId, compact }: { customerId: string; compact?: boolean }) {
  const c = useStore((s) => s.customers.find((x) => x.id === customerId))
  const reservations = useStore((s) => s.reservations)
  const layout = useStore((s) => s.layout)
  const role = useStore((s) => s.settings.role)
  const now = useClock((s) => s.now)
  const a = useStore.getState()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Customer | null>(null)
  const confirmDel = useTwoStep()

  if (!c) return <p className="text-sm text-muted">Fiche introuvable.</p>
  const isManager = role === 'manager'
  const history = reservations
    .filter((r) => r.customerId === c.id)
    .sort((x, y) => (y.date + y.time).localeCompare(x.date + x.time))
  const visits = visitsOf(c, reservations)
  const noShows = history.filter((r) => r.status === 'noshow').length

  const startEdit = () => {
    setForm({ ...c })
    setEditing(true)
  }
  const save = () => {
    if (!form || !form.name.trim()) return
    a.saveCustomer(form)
    setEditing(false)
    a.notify('Fiche client enregistrée')
  }

  if (editing && form) {
    return (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nom">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Téléphone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Visites antérieures">
            <Input type="number" min={0} value={form.priorVisits} onChange={(e) => setForm({ ...form, priorVisits: Math.max(0, Number(e.target.value) || 0) })} />
          </Field>
        </div>
        <Field label="Préférences">
          <Textarea value={form.preferences} onChange={(e) => setForm({ ...form, preferences: e.target.value })} />
        </Field>
        <Field label="Allergies / contraintes alimentaires" hint="À renseigner uniquement avec l’accord du client.">
          <Input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
        </Field>
        {isManager && (
          <Field label="Notes internes (responsables uniquement)">
            <Textarea value={form.internalNotes} onChange={(e) => setForm({ ...form, internalNotes: e.target.value })} />
          </Field>
        )}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <Toggle label="Client VIP" checked={form.vip} onChange={(v) => setForm({ ...form, vip: v })} /> Client VIP
          </label>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={save}>
              Enregistrer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-dark">{initials(c.name)}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-base font-semibold">
            {c.name}
            {c.vip && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-st-reserved/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#A8701F]">
                <Crown size={10} /> VIP
              </span>
            )}
            {!c.vip && visits >= 5 && <span className="rounded-full bg-st-available/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#2F7A55]">Régulier</span>}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
            {c.phone && (
              <span className="flex items-center gap-1">
                <Phone size={12} /> {isManager ? c.phone : maskPhone(c.phone)}
              </span>
            )}
            {c.email && (
              <span className="flex items-center gap-1">
                <Mail size={12} /> {isManager ? c.email : maskEmail(c.email)}
              </span>
            )}
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={startEdit}>
          <Pencil size={13} /> Modifier
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          ['Visites', visits],
          ['Réservations', history.length],
          ['Absences', noShows],
        ].map(([l, v]) => (
          <div key={l} className="rounded-xl bg-[#FAF8F4] px-3 py-2">
            <div className="text-[11px] text-muted">{l}</div>
            <div className="text-lg font-semibold tabular-nums">{v}</div>
          </div>
        ))}
      </div>

      {c.allergies && (
        <div className="flex items-start gap-2 rounded-xl bg-[#FDF3E3] px-3 py-2.5 text-[13px] text-[#8A5A14]">
          <TriangleAlert size={15} className="mt-0.5 shrink-0" />
          <span>
            <b>Allergies / contraintes :</b> {c.allergies}
          </span>
        </div>
      )}

      <section>
        <SectionTitle>Préférences</SectionTitle>
        <p className="text-[13px]">{c.preferences || <span className="text-muted">Aucune préférence renseignée.</span>}</p>
      </section>

      <section>
        <SectionTitle>Notes internes</SectionTitle>
        {isManager ? (
          <p className="text-[13px]">{c.internalNotes || <span className="text-muted">Aucune note.</span>}</p>
        ) : (
          <p className="flex items-center gap-1.5 text-[13px] text-muted">
            <Lock size={13} /> Réservées aux responsables.
          </p>
        )}
      </section>

      <section>
        <SectionTitle
          action={
            <button
              className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              onClick={() => a.openReservationForm({ customerId: c.id, date: todayStr(new Date(now)), time: roundQuarter(now, 60), partySize: 2 })}
            >
              <CalendarPlus size={13} /> Réserver
            </button>
          }
        >
          Historique
        </SectionTitle>
        {history.length ? (
          <ul className={compact ? 'max-h-48 space-y-1 overflow-y-auto' : 'space-y-1'}>
            {history.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[13px] hover:bg-black/[0.02]">
                <span>
                  <span className="capitalize">{formatDateShort(r.date)}</span> · {r.time} · {r.partySize} pers.
                  {r.tableId && <span className="text-muted"> · {tableLabel(layout.find((t) => t.id === r.tableId)?.number)}</span>}
                </span>
                <span className="text-xs text-muted">{RES_LABEL[r.status]}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-muted">Aucune réservation enregistrée.</p>
        )}
      </section>

      {isManager && (
        <button
          className="flex items-center gap-1.5 text-xs text-muted hover:text-accent"
          onClick={() => confirmDel.run(c.id, () => a.deleteCustomer(c.id))}
        >
          <Trash2 size={13} />
          {confirmDel.armed === c.id ? `Cliquer à nouveau pour supprimer définitivement la fiche de ${c.name}` : 'Supprimer la fiche (droit à l’effacement)'}
        </button>
      )}
    </div>
  )
}

/** Fiche client ouverte depuis une table ou une réservation, hors de la page Clients. */
export function CustomerModal() {
  const id = useStore((s) => s.selectedCustomerId)
  const view = useStore((s) => s.view)
  const close = () => useStore.getState().selectCustomer(null)
  const open = !!id && view !== 'customers'
  return (
    <Modal open={open} onClose={close} title="Fiche client">
      {id && <CustomerDetail customerId={id} compact />}
    </Modal>
  )
}
