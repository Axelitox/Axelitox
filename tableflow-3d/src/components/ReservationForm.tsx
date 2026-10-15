import { useEffect, useMemo, useState } from 'react'
import { TriangleAlert, Wand2, CircleCheck } from 'lucide-react'
import { useClock, useStore } from '../store/useStore'
import { Button, Field, Input, Modal, Segmented, Select, Textarea } from './ui'
import { reservationConflicts, tablesOf } from '../lib/service'
import { tableLabel, zoneAt } from '../lib/layout'
import { roundQuarter, todayStr } from '../lib/utils'
import type { Reservation } from '../types'

export function ReservationForm() {
  const draft = useStore((s) => s.reservationDraft)
  const close = useStore((s) => s.closeReservationForm)
  return (
    <Modal open={!!draft} onClose={close} title={draft?.id ? 'Modifier la réservation' : 'Nouvelle réservation'} wide>
      {draft && <FormBody key={draft.id ?? 'new'} draft={draft} onDone={close} />}
    </Modal>
  )
}

function FormBody({ draft, onDone }: { draft: Partial<Reservation>; onDone: () => void }) {
  const layout = useStore((s) => s.layout)
  const reservations = useStore((s) => s.reservations)
  const customers = useStore((s) => s.customers)
  const defaultDuration = useStore((s) => s.settings.defaultDuration)
  const now = useClock((s) => s.now)
  const a = useStore.getState()

  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>(draft.customerId || customers.length ? 'existing' : 'new')
  const [customerId, setCustomerId] = useState(draft.customerId ?? '')
  const [search, setSearch] = useState('')
  const [newC, setNewC] = useState({ name: '', phone: '', email: '' })
  const [date, setDate] = useState(draft.date ?? todayStr(new Date(now)))
  const [time, setTime] = useState(draft.time ?? roundQuarter(now, 60))
  const [partySize, setPartySize] = useState(draft.partySize ?? 2)
  const [duration, setDuration] = useState(draft.duration ?? defaultDuration)
  const [tableId, setTableId] = useState<string>(draft.tableId ?? '')
  const [status, setStatus] = useState<'pending' | 'confirmed'>(draft.status === 'pending' ? 'pending' : 'confirmed')
  const [note, setNote] = useState(draft.note ?? '')
  const [error, setError] = useState<string | null>(null)

  const tables = useMemo(() => tablesOf(layout), [layout])
  const candidate = { id: draft.id ?? '__new', tableId: tableId || null, date, time, duration }
  const conflicts = reservationConflicts(candidate, reservations)
  const table = tables.find((t) => t.id === tableId)
  const tooSmall = table && (table.capacity ?? 0) < partySize

  const tableOptions = useMemo(
    () =>
      tables.map((t) => {
        const c = reservationConflicts({ ...candidate, tableId: t.id }, reservations)
        return { t, busy: c.length > 0, fits: (t.capacity ?? 0) >= partySize }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tables, reservations, date, time, duration, partySize, draft.id],
  )

  useEffect(() => setError(null), [tableId, date, time, duration, customerId])

  const suggest = () => {
    const best = tableOptions
      .filter((o) => !o.busy && o.fits && useStore.getState().tables[o.t.id]?.status !== 'blocked')
      .sort((x, y) => (x.t.capacity ?? 0) - (y.t.capacity ?? 0))[0]
    if (best) setTableId(best.t.id)
    else setError('Aucune table libre adaptée sur ce créneau.')
  }

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.replace(/\s/g, '').includes(search.replace(/\s/g, '')))

  const submit = () => {
    let cid = customerId
    if (customerMode === 'new') {
      if (!newC.name.trim()) return setError('Indiquez le nom du client.')
      cid = a.saveCustomer({ name: newC.name.trim(), phone: newC.phone.trim(), email: newC.email.trim() })
    }
    if (!cid) return setError('Sélectionnez un client.')
    if (!date || !time) return setError('Date et heure obligatoires.')
    if (conflicts.length) return setError('Conflit de réservation sur cette table.')
    const id = a.saveReservation({
      id: draft.id,
      customerId: cid,
      date,
      time,
      duration,
      partySize,
      tableId: tableId || null,
      status: draft.status === 'seated' ? 'seated' : status,
      note: note.trim(),
    })
    a.selectReservation(id)
    a.notify(draft.id ? 'Réservation mise à jour' : 'Réservation enregistrée')
    onDone()
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted">Client</span>
          <Segmented
            value={customerMode}
            onChange={setCustomerMode}
            options={[
              { value: 'existing', label: 'Fiche existante' },
              { value: 'new', label: 'Nouveau client' },
            ]}
          />
        </div>
        {customerMode === 'existing' ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <Input placeholder="Rechercher nom ou téléphone…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} aria-label="Client">
              <option value="">— Choisir —</option>
              {filtered.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.vip ? ' ★' : ''}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-3">
            <Input placeholder="Nom *" value={newC.name} onChange={(e) => setNewC({ ...newC, name: e.target.value })} />
            <Input placeholder="Téléphone" value={newC.phone} onChange={(e) => setNewC({ ...newC, phone: e.target.value })} />
            <Input placeholder="Email" type="email" value={newC.email} onChange={(e) => setNewC({ ...newC, email: e.target.value })} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Heure">
          <Input type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
        <Field label="Personnes">
          <Input type="number" min={1} max={30} value={partySize} onChange={(e) => setPartySize(Math.max(1, Number(e.target.value) || 1))} />
        </Field>
        <Field label="Durée">
          <Select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
            {[45, 60, 75, 90, 105, 120, 150, 180].map((d) => (
              <option key={d} value={d}>
                {d} min
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Table"
        hint={
          conflicts.length ? (
            <span className="flex items-center gap-1 text-accent">
              <TriangleAlert size={12} /> Conflit avec {conflicts.length} réservation(s) entre {conflicts.map((c) => c.time).join(', ')}.
            </span>
          ) : tooSmall ? (
            <span className="text-[#A8701F]">Capacité de la table ({table?.capacity}) inférieure au nombre de personnes.</span>
          ) : table ? (
            <span className="flex items-center gap-1 text-st-available">
              <CircleCheck size={12} /> Créneau libre {time}–{endTime(time, duration)}
            </span>
          ) : (
            'Sans table : la réservation reste à placer.'
          )
        }
      >
        <div className="flex gap-2">
          <Select value={tableId} onChange={(e) => setTableId(e.target.value)}>
            <option value="">À placer plus tard</option>
            {tableOptions.map(({ t, busy, fits }) => (
              <option key={t.id} value={t.id} disabled={busy}>
                {tableLabel(t.number)} · {t.capacity} pl. · {zoneAt(layout, t.x, t.z)?.name ?? 'Salle'}
                {busy ? ' — occupée sur ce créneau' : !fits ? ' — trop petite' : ''}
              </option>
            ))}
          </Select>
          <Button type="button" variant="outline" onClick={suggest} title="Proposer la plus petite table libre adaptée">
            <Wand2 size={14} /> <span className="hidden sm:inline">Suggérer</span>
          </Button>
        </div>
      </Field>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <Field label="Note">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Occasion, placement souhaité, contraintes…" />
        </Field>
        {draft.status !== 'seated' && (
          <Field label="Statut">
            <Segmented
              value={status}
              onChange={setStatus}
              options={[
                { value: 'confirmed', label: 'Confirmée' },
                { value: 'pending', label: 'À confirmer' },
              ]}
            />
          </Field>
        )}
      </div>

      {error && <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent-dark">{error}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onDone}>
          Annuler
        </Button>
        <Button variant="primary" onClick={submit} disabled={conflicts.length > 0}>
          Enregistrer
        </Button>
      </div>
    </div>
  )
}

const endTime = (time: string, duration: number) => {
  const [h, m] = time.split(':').map(Number)
  const t = h * 60 + m + duration
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}
