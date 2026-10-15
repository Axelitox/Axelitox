import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Minus,
  Plus,
  Clock,
  Users,
  UserRound,
  CalendarPlus,
  Sparkles,
  LogOut,
  LogIn,
  TriangleAlert,
  Crown,
  ChevronRight,
  Ban,
} from 'lucide-react'
import { useClock, useStore } from '../store/useStore'
import { useLife } from '../store/useLife'
import { effectiveStatus, holdingReservation, nextReservation, occupiedMinutes, STATUS_META, STATUS_ORDER } from '../lib/service'
import { tableLabel, zoneAt } from '../lib/layout'
import { cn, formatDuration, roundQuarter, toHHMM, todayStr, toTs } from '../lib/utils'
import { Button, Dot, IconButton, Select, SectionTitle } from './ui'
import type { TableStatus } from '../types'

export const Stepper = ({ value, onChange, min = 1, max = 20, label }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string }) => (
  <div className="inline-flex items-center rounded-lg border border-line bg-white" role="group" aria-label={label}>
    <button className="flex h-8 w-8 items-center justify-center text-muted hover:text-ink disabled:opacity-30" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Moins">
      <Minus size={14} />
    </button>
    <span className="w-7 text-center text-sm font-semibold tabular-nums">{value}</span>
    <button className="flex h-8 w-8 items-center justify-center text-muted hover:text-ink disabled:opacity-30" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Plus">
      <Plus size={14} />
    </button>
  </div>
)

const Row = ({ icon: Icon, label, children }: { icon: typeof Clock; label: string; children: React.ReactNode }) => (
  <div className="flex min-h-[36px] items-center justify-between gap-3 border-b border-line/60 py-1.5 last:border-0">
    <span className="flex items-center gap-2 text-[13px] text-muted">
      <Icon size={14} />
      {label}
    </span>
    <span className="text-right text-[13px] font-medium">{children}</span>
  </div>
)

export function TablePanel({ tableId, onClose }: { tableId: string; onClose: () => void }) {
  const item = useStore((s) => s.layout.find((l) => l.id === tableId))
  const layout = useStore((s) => s.layout)
  const svc = useStore((s) => s.tables[tableId])
  const reservations = useStore((s) => s.reservations)
  const customers = useStore((s) => s.customers)
  const staff = useStore((s) => s.staff)
  const events = useStore((s) => s.events)
  const settings = useStore((s) => s.settings)
  const a = useStore.getState()
  const now = useClock((s) => s.now)
  const reduced = settings.reducedMotion

  const status = effectiveStatus(tableId, svc, reservations, now, settings.reservationWindowMin)
  const holding = holdingReservation(tableId, reservations, now, settings.reservationWindowMin)
  const next = nextReservation(tableId, reservations, now)
  const [guests, setGuests] = useState<number>(() => holding?.partySize ?? Math.min(item?.capacity ?? 2, 2))
  const [walkInCustomer, setWalkInCustomer] = useState('')

  const customer = customers.find((c) => c.id === (svc?.customerId ?? holding?.customerId))
  const currentRes = reservations.find((r) => r.id === svc?.reservationId)
  const zone = item ? zoneAt(layout, item.x, item.z) : null
  const tableEvents = useMemo(() => events.filter((e) => e.tableId === tableId).slice(0, 4), [events, tableId])

  if (!item) return null
  const meta = STATUS_META[status]
  const cap = item.capacity ?? 2
  const nextName = next ? customers.find((c) => c.id === next.customerId)?.name ?? 'Client' : null

  const changeStatus = (s: TableStatus) => {
    if (s === status) return
    if (s === 'occupied') {
      if (holding) a.checkIn(holding.id)
      else a.seatTable(tableId, { guests })
    } else a.setTableStatus(tableId, s)
  }

  return (
    <motion.aside
      key={tableId}
      initial={{ opacity: 0, x: reduced ? 0 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: reduced ? 0 : 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex h-full flex-col overflow-hidden"
      aria-label={tableLabel(item.number)}
    >
      <div className="flex items-start justify-between gap-2 px-5 pb-3 pt-5">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted">{zone?.name ?? 'Salle'}</div>
          <h2 className="text-xl font-semibold tracking-tight">{tableLabel(item.number).toUpperCase()}</h2>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              key={status}
              className="tf-pop inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ background: `${meta.color}1F`, color: meta.color }}
            >
              <Dot color={meta.color} />
              {meta.label}
            </span>
            <span className="text-xs text-muted">
              {item.shape === 'round' ? 'Ronde' : item.shape === 'square' ? 'Carrée' : 'Rectangulaire'} · {cap} places
            </span>
          </div>
        </div>
        <IconButton label="Fermer le panneau" onClick={onClose}>
          <X size={16} />
        </IconButton>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-6">
        {customer?.allergies && (status === 'occupied' || status === 'reserved') && (
          <div className="flex items-start gap-2 rounded-xl bg-[#FDF3E3] px-3 py-2.5 text-[13px] text-[#8A5A14]">
            <TriangleAlert size={15} className="mt-0.5 shrink-0" />
            <span>
              <b>Allergie / contrainte :</b> {customer.allergies}
            </span>
          </div>
        )}

        {/* Action principale selon le statut */}
        <section>
          {status === 'occupied' && svc && (
            <div className="space-y-3">
              <div className="rounded-xl bg-[#FAF8F4] px-3.5 py-1">
                <Row icon={Users} label="Clients présents">
                  <Stepper label="Clients présents" value={svc.guests} max={cap + 4} onChange={(v) => a.setGuests(tableId, v)} />
                </Row>
                <Row icon={LogIn} label="Arrivée">
                  {svc.seatedAt ? toHHMM(svc.seatedAt) : '—'}
                </Row>
                <Row icon={Clock} label="Durée d’occupation">
                  <span className={cn(occupiedMinutes(svc, now) > 105 && 'text-accent')}>{formatDuration(occupiedMinutes(svc, now))}</span>
                </Row>
                <Row icon={UserRound} label="Réservation">
                  {currentRes ? `${customer?.name ?? 'Client'} · ${currentRes.time}` : 'Sans réservation'}
                </Row>
              </div>
              {svc.guests > cap && <p className="text-xs text-accent">Attention : {svc.guests} clients pour {cap} places.</p>}
              <Button variant="primary" className="w-full" onClick={() => a.releaseTable(tableId)}>
                <LogOut size={15} /> Libérer la table
              </Button>
            </div>
          )}

          {(status === 'available' || status === 'reserved') && (
            <div className="space-y-3 rounded-xl bg-[#FAF8F4] p-3.5">
              {holding ? (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[13px] font-medium">{customers.find((c) => c.id === holding.customerId)?.name}</div>
                    <div className="text-xs text-muted">
                      Attendu·e à {holding.time} · {holding.partySize} pers.
                    </div>
                  </div>
                  <Button variant="primary" onClick={() => a.checkIn(holding.id)}>
                    <LogIn size={15} /> Arrivée
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-muted">Installer des clients</span>
                    <Stepper label="Nombre de couverts" value={guests} max={cap + 4} onChange={setGuests} />
                  </div>
                  <Select value={walkInCustomer} onChange={(e) => setWalkInCustomer(e.target.value)} aria-label="Associer un client">
                    <option value="">Client de passage (sans fiche)</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                  <Button variant="primary" className="w-full" onClick={() => a.seatTable(tableId, { guests, customerId: walkInCustomer || null })}>
                    <LogIn size={15} /> Installer {guests} couvert{guests > 1 ? 's' : ''}
                  </Button>
                  {next && toTs(next.date, next.time) - now < 150 * 60000 && (
                    <p className="text-xs text-[#A8701F]">Réservée à {next.time} — durée disponible limitée.</p>
                  )}
                </>
              )}
            </div>
          )}

          {status === 'cleaning' && (
            <Button variant="primary" className="w-full" onClick={() => a.markClean(tableId)}>
              <Sparkles size={15} /> Marquer comme propre
            </Button>
          )}
          {status === 'blocked' && (
            <Button variant="primary" className="w-full" onClick={() => a.setTableStatus(tableId, 'available')}>
              Rendre disponible
            </Button>
          )}
        </section>

        {/* Statut */}
        <section>
          <SectionTitle>Changer le statut</SectionTitle>
          <div className="grid grid-cols-5 gap-1">
            {STATUS_ORDER.map((s) => {
              const m = STATUS_META[s]
              const active = s === status
              return (
                <button
                  key={s}
                  onClick={() => changeStatus(s)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium transition-all',
                    active ? 'bg-white shadow-card ring-1 ring-black/5' : 'text-muted hover:bg-black/[0.03]',
                  )}
                  aria-pressed={active}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color, boxShadow: active ? `0 0 0 3px ${m.color}33` : undefined }} />
                  {m.short}
                </button>
              )
            })}
          </div>
          {status === 'reserved' && holding && (
            <p className="mt-2 text-xs text-muted">Statut calculé depuis la réservation de {holding.time} (fenêtre de {settings.reservationWindowMin} min).</p>
          )}
        </section>

        {/* Serveur */}
        <section>
          <SectionTitle>Serveur affecté</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {staff
              .filter((s) => s.active)
              .map((s) => (
                <button
                  key={s.id}
                  onClick={() => a.assignWaiter(tableId, svc?.waiterId === s.id ? null : s.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors',
                    svc?.waiterId === s.id ? 'bg-ink text-white ring-ink' : 'bg-white text-ink ring-line hover:ring-ink/30',
                  )}
                >
                  <Dot color={s.color} />
                  {s.name}
                </button>
              ))}
          </div>
          <LiveActivity tableId={tableId} waiterId={svc?.waiterId ?? null} />
        </section>

        {/* Client */}
        {customer && (
          <section>
            <SectionTitle>Client</SectionTitle>
            <button
              onClick={() => a.selectCustomer(customer.id)}
              className="flex w-full items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-left ring-1 ring-line transition hover:ring-ink/20"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-dark">
                {customer.name
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-[13px] font-medium">
                  {customer.name} {customer.vip && <Crown size={12} className="text-st-reserved" />}
                </span>
                <span className="block truncate text-xs text-muted">{customer.preferences || 'Aucune préférence renseignée'}</span>
              </span>
              <ChevronRight size={16} className="text-muted" />
            </button>
          </section>
        )}

        {/* Prochaine réservation */}
        <section>
          <SectionTitle
            action={
              <button
                className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                onClick={() =>
                  a.openReservationForm({
                    tableId,
                    date: todayStr(new Date(now)),
                    time: roundQuarter(now, 30),
                    partySize: Math.min(cap, 2),
                  })
                }
              >
                <CalendarPlus size={13} /> Ajouter
              </button>
            }
          >
            Prochaine réservation
          </SectionTitle>
          {next ? (
            <button
              onClick={() => a.openReservationForm(next)}
              className="flex w-full items-center justify-between rounded-xl bg-white px-3 py-2.5 text-left ring-1 ring-line hover:ring-ink/20"
            >
              <span>
                <span className="block text-[13px] font-medium">{nextName}</span>
                <span className="text-xs text-muted">
                  {next.date !== todayStr(new Date(now)) ? `${next.date.slice(8)}/${next.date.slice(5, 7)} · ` : ''}
                  {next.time} · {next.partySize} pers. · {next.status === 'pending' ? 'à confirmer' : 'confirmée'}
                </span>
              </span>
              <span className="rounded-full bg-st-reserved/15 px-2 py-0.5 text-xs font-semibold text-[#A8701F]">{next.time}</span>
            </button>
          ) : (
            <p className="text-[13px] text-muted">Aucune réservation à venir sur cette table.</p>
          )}
        </section>

        {tableEvents.length > 0 && (
          <section>
            <SectionTitle>Historique récent</SectionTitle>
            <ul className="space-y-1.5">
              {tableEvents.map((e) => (
                <li key={e.id} className="flex gap-2 text-xs">
                  <span className="w-10 shrink-0 tabular-nums text-muted">{toHHMM(e.at)}</span>
                  <span className="text-ink/80">{e.text}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {status !== 'blocked' && status !== 'occupied' && (
          <button className="flex items-center gap-1.5 text-xs text-muted hover:text-accent" onClick={() => a.setTableStatus(tableId, 'blocked')}>
            <Ban size={13} /> Rendre la table indisponible
          </button>
        )}
      </div>
    </motion.aside>
  )
}

/** Activité en direct des serveurs animés liée à cette table (couche de vie). */
function LiveActivity({ tableId, waiterId }: { tableId: string; waiterId: string | null }) {
  const missions = useLife((s) => s.missions)
  const staff = useStore((s) => s.staff)
  const enabled = useStore((s) => s.settings.showCharacters)
  if (!enabled) return null
  const lines = staff
    .filter((s) => s.active && missions[s.id] && (s.id === waiterId || missions[s.id]?.tableId === tableId))
    .map((s) => ({ s, m: missions[s.id]!, here: missions[s.id]?.tableId === tableId }))
  if (!lines.length) return null
  return (
    <ul className="mt-2 space-y-1">
      {lines.map(({ s, m, here }) => (
        <li key={s.id} className="flex items-center gap-2 text-xs text-muted">
          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', here && 'animate-pulse')} style={{ background: s.color }} />
          <span>
            <span className="font-medium text-ink">{s.name}</span> · {m.text}
            {here && ' (cette table)'}
          </span>
        </li>
      ))}
    </ul>
  )
}
