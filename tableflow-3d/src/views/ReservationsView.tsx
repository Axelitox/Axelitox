import { useMemo, useState } from 'react'
import { CalendarPlus, ChevronLeft, ChevronRight, LogIn, Check, X, UserX, Pencil, Map as MapIcon, UserRound, Search } from 'lucide-react'
import { useClock, useStore } from '../store/useStore'
import { Button, Card, Empty, Input, Segmented, SectionTitle } from '../components/ui'
import { useCustomerName } from '../lib/hooks'
import { resStart, tablesOf } from '../lib/service'
import { tableLabel } from '../lib/layout'
import { addDays, cn, formatDateLong, roundQuarter, serviceOfTime, todayStr } from '../lib/utils'
import type { Reservation } from '../types'

const STATUS_STYLE: Record<Reservation['status'], { label: string; bg: string; fg: string }> = {
  pending: { label: 'À confirmer', bg: '#FDF3E3', fg: '#A8701F' },
  confirmed: { label: 'Confirmée', bg: '#FBEFDC', fg: '#9A6514' },
  seated: { label: 'Installée', bg: '#FBE9E7', fg: '#B5443C' },
  completed: { label: 'Terminée', bg: '#EEF0F1', fg: '#6D7C86' },
  cancelled: { label: 'Annulée', bg: '#F1F1F1', fg: '#9A9A9A' },
  noshow: { label: 'Absente', bg: '#F1F1F1', fg: '#7A7A7A' },
}

const BAR_COLOR: Record<Reservation['status'], string> = {
  pending: '#F2C98A',
  confirmed: '#E8A547',
  seated: '#D95E55',
  completed: '#B9C4CB',
  cancelled: '#DDDDDD',
  noshow: '#CFCFCF',
}

const H1 = 24

export function ReservationsView() {
  const reservations = useStore((s) => s.reservations)
  const layout = useStore((s) => s.layout)
  const tablesSvc = useStore((s) => s.tables)
  const selectedId = useStore((s) => s.selectedReservationId)
  const now = useClock((s) => s.now)
  const name = useCustomerName()
  const a = useStore.getState()
  const [date, setDate] = useState(todayStr(new Date(now)))
  const [service, setService] = useState<'all' | 'midi' | 'soir'>('all')
  const [showClosed, setShowClosed] = useState(true)
  const [q, setQ] = useState('')

  const tables = useMemo(() => tablesOf(layout), [layout])
  // plage horaire : 11h → minuit, élargie si des réservations commencent plus tôt
  const H0 = useMemo(
    () => Math.min(11, ...reservations.filter((r) => r.date === date).map((r) => Number(r.time.slice(0, 2)))),
    [reservations, date],
  )
  const dayRes = useMemo(
    () =>
      reservations
        .filter((r) => r.date === date)
        .filter((r) => service === 'all' || serviceOfTime(r.time) === service)
        .filter((r) => showClosed || !['cancelled', 'noshow', 'completed'].includes(r.status))
        .filter((r) => !q || name(r.customerId).toLowerCase().includes(q.toLowerCase()))
        .sort((x, y) => x.time.localeCompare(y.time)),
    [reservations, date, service, showClosed, q, name],
  )
  const selected = reservations.find((r) => r.id === selectedId)
  const active = dayRes.filter((r) => r.status !== 'cancelled' && r.status !== 'noshow')
  const covers = active.reduce((acc, r) => acc + r.partySize, 0)
  const isToday = date === todayStr(new Date(now))

  const newRes = (extra: Partial<Reservation> = {}) =>
    a.openReservationForm({ date, time: isToday ? roundQuarter(now, 30) : '12:30', partySize: 2, ...extra })

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 pb-24 lg:px-6 lg:pb-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => setDate(addDays(date, -1))} aria-label="Jour précédent">
            <ChevronLeft size={16} />
          </Button>
          <Input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="h-8 w-[150px]" />
          <Button size="sm" variant="ghost" onClick={() => setDate(addDays(date, 1))} aria-label="Jour suivant">
            <ChevronRight size={16} />
          </Button>
          {!isToday && (
            <Button size="sm" variant="outline" onClick={() => setDate(todayStr(new Date(now)))}>
              Aujourd’hui
            </Button>
          )}
        </div>
        <Segmented
          value={service}
          onChange={setService}
          options={[
            { value: 'all', label: 'Journée' },
            { value: 'midi', label: 'Midi' },
            { value: 'soir', label: 'Soir' },
          ]}
        />
        <label className="flex items-center gap-1.5 text-xs text-muted">
          <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} className="accent-[#D84A42]" />
          Afficher terminées / annulées
        </label>
        <div className="relative ml-auto">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input placeholder="Client…" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-40 pl-8" />
        </div>
        <Button variant="primary" size="sm" onClick={() => newRes()}>
          <CalendarPlus size={14} /> Nouvelle réservation
        </Button>
      </div>

      <div className="mb-3 flex items-baseline gap-3">
        <h2 className="text-lg font-semibold capitalize">{formatDateLong(new Date(resStart({ date, time: '12:00' } as Reservation)))}</h2>
        <span className="text-sm text-muted">
          {active.length} réservation{active.length > 1 ? 's' : ''} · {covers} couverts
        </span>
      </div>

      <div className="grid min-h-0 gap-4 xl:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          {selected && selected.date === date && <ReservationDetail r={selected} />}
          <Card className="p-2">
            {dayRes.length ? (
              <ul>
                {dayRes.map((r) => {
                  const t = layout.find((x) => x.id === r.tableId)
                  const s = STATUS_STYLE[r.status]
                  return (
                    <li key={r.id}>
                      <button
                        onClick={() => a.selectReservation(r.id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors',
                          selectedId === r.id ? 'bg-accent-soft' : 'hover:bg-black/[0.03]',
                        )}
                      >
                        <span className="w-11 text-sm font-semibold tabular-nums">{r.time}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium">{name(r.customerId)}</span>
                          <span className="text-xs text-muted">
                            {r.partySize} pers. · {t ? tableLabel(t.number) : <span className="text-[#A8701F]">sans table</span>}
                          </span>
                        </span>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: s.bg, color: s.fg }}>
                          {s.label}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <Empty>Aucune réservation pour ce filtre.</Empty>
            )}
          </Card>
        </div>

        <Card className="overflow-x-auto p-4">
          <SectionTitle>Planning des tables</SectionTitle>
          <div style={{ minWidth: (H1 - H0) * 58 + 80 }}>
            <div className="relative ml-20 flex h-6 text-[10px] text-muted">
              {Array.from({ length: H1 - H0 }).map((_, i) => (
                <div key={i} className="flex-1 border-l border-line/70 pl-1">
                  {H0 + i}h
                </div>
              ))}
            </div>
            <div className="relative">
              {isToday && <NowLine now={now} h0={H0} />}
              {tables.map((t) => {
                const rs = reservations.filter((r) => r.date === date && r.tableId === t.id && r.status !== 'cancelled')
                const blocked = tablesSvc[t.id]?.status === 'blocked'
                return (
                  <div key={t.id} className="flex h-9 items-center border-t border-line/50">
                    <div className="w-20 shrink-0 pr-2 text-xs">
                      <span className="font-medium">{tableLabel(t.number)}</span>
                      <span className="ml-1 text-muted">{t.capacity}p</span>
                    </div>
                    <div
                      className={cn('relative h-full flex-1 cursor-copy', blocked && 'bg-[repeating-linear-gradient(135deg,#f4f2ee_0,#f4f2ee_6px,#ece9e3_6px,#ece9e3_12px)]')}
                      title="Cliquer pour réserver ce créneau"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const min = ((e.clientX - rect.left) / rect.width) * (H1 - H0) * 60
                        const q15 = Math.floor(min / 15) * 15
                        const hh = H0 + Math.floor(q15 / 60)
                        newRes({ tableId: t.id, time: `${String(hh).padStart(2, '0')}:${String(q15 % 60).padStart(2, '0')}`, partySize: Math.min(t.capacity ?? 2, 2) })
                      }}
                    >
                      {Array.from({ length: H1 - H0 }).map((_, i) => (
                        <div key={i} className="absolute inset-y-0 border-l border-line/40" style={{ left: `${(i / (H1 - H0)) * 100}%` }} />
                      ))}
                      {rs.map((r) => {
                        const [h, m] = r.time.split(':').map(Number)
                        const start = (h - H0) * 60 + m
                        const left = (start / ((H1 - H0) * 60)) * 100
                        const width = (r.duration / ((H1 - H0) * 60)) * 100
                        if (left + width < 0 || left > 100) return null
                        return (
                          <button
                            key={r.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              a.selectReservation(r.id)
                            }}
                            className={cn(
                              'absolute inset-y-1 overflow-hidden whitespace-nowrap rounded-md px-1.5 text-left text-[10px] font-medium text-ink/90 transition-shadow hover:shadow-card',
                              selectedId === r.id && 'ring-2 ring-ink',
                              r.status === 'noshow' && 'line-through',
                            )}
                            style={{ left: `${Math.max(0, left)}%`, width: `${width}%`, background: BAR_COLOR[r.status] }}
                            title={`${r.time} · ${name(r.customerId)} · ${r.partySize} pers.`}
                          >
                            {r.time} {name(r.customerId).split(' ')[0]} · {r.partySize}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            Chaque réservation bloque la table uniquement sur son créneau (durée réglable). Cliquez sur une plage vide pour créer une réservation.
          </p>
        </Card>
      </div>
    </div>
  )
}

const NowLine = ({ now, h0: H0 }: { now: number; h0: number }) => {
  const d = new Date(now)
  const min = (d.getHours() - H0) * 60 + d.getMinutes()
  const pct = (min / ((H1 - H0) * 60)) * 100
  if (pct < 0 || pct > 100) return null
  return (
    <div className="pointer-events-none absolute inset-y-0 left-20 right-0 z-10">
      <div className="absolute inset-y-0 w-px bg-accent" style={{ left: `${pct}%` }}>
        <span className="absolute -top-1 -translate-x-1/2 rounded bg-accent px-1 text-[9px] font-semibold text-white">maintenant</span>
      </div>
    </div>
  )
}

function ReservationDetail({ r }: { r: Reservation }) {
  const c = useStore((s) => s.customers.find((x) => x.id === r.customerId))
  const t = useStore((s) => s.layout.find((x) => x.id === r.tableId))
  const tSvc = useStore((s) => (r.tableId ? s.tables[r.tableId] : undefined))
  const a = useStore.getState()
  const open = r.status === 'pending' || r.status === 'confirmed'
  const canCheckIn = open && t && tSvc?.status !== 'occupied' && tSvc?.status !== 'blocked'
  const s = STATUS_STYLE[r.status]

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-base font-semibold">{c?.name ?? 'Client supprimé'}</div>
          <div className="text-sm text-muted">
            {r.time} · {r.duration} min · {r.partySize} pers. · {t ? tableLabel(t.number) : 'sans table'}
          </div>
        </div>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: s.bg, color: s.fg }}>
          {s.label}
        </span>
      </div>
      {r.note && <p className="mt-2 rounded-lg bg-[#FAF8F4] px-3 py-2 text-[13px]">{r.note}</p>}
      {c?.allergies && <p className="mt-2 text-xs text-[#8A5A14]">Allergies : {c.allergies}</p>}
      {open && t && tSvc?.status === 'occupied' && (
        <p className="mt-2 text-xs text-accent">La table est encore occupée : libérez-la ou changez de table avant l’arrivée.</p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {canCheckIn && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              if (a.checkIn(r.id)) a.notify('Arrivée enregistrée — table occupée')
            }}
          >
            <LogIn size={13} /> Arrivée
          </Button>
        )}
        {r.status === 'pending' && (
          <Button size="sm" variant="outline" onClick={() => a.setReservationStatus(r.id, 'confirmed')}>
            <Check size={13} /> Confirmer
          </Button>
        )}
        {(open || r.status === 'seated') && (
          <Button size="sm" variant="outline" onClick={() => a.openReservationForm(r)}>
            <Pencil size={13} /> Modifier
          </Button>
        )}
        {t && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              a.setView('plan')
              a.selectTable(t.id)
            }}
          >
            <MapIcon size={13} /> Plan
          </Button>
        )}
        {c && (
          <Button size="sm" variant="outline" onClick={() => a.selectCustomer(c.id)}>
            <UserRound size={13} /> Client
          </Button>
        )}
        {open && (
          <>
            <Button size="sm" variant="danger" onClick={() => a.setReservationStatus(r.id, 'noshow')}>
              <UserX size={13} /> Absent
            </Button>
            <Button size="sm" variant="danger" onClick={() => a.setReservationStatus(r.id, 'cancelled')}>
              <X size={13} /> Annuler
            </Button>
          </>
        )}
        {(r.status === 'cancelled' || r.status === 'noshow') && (
          <Button size="sm" variant="outline" onClick={() => a.setReservationStatus(r.id, 'confirmed')}>
            Rétablir
          </Button>
        )}
      </div>
    </Card>
  )
}
