import { lazy, Suspense, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarPlus, Clock3, Activity, Users } from 'lucide-react'
import { useClock, useStore } from '../store/useStore'
import { TablePanel } from '../components/TablePanel'
import { CameraControlsBar, NavHint, StatusLegend } from '../components/SceneOverlay'
import { Button, Dot, SectionTitle } from '../components/ui'
import { useCustomerName, useIsMobile, useLiveStats } from '../lib/hooks'
import { OPEN_RES, resStart, STATUS_META, effectiveStatus } from '../lib/service'
import { tableLabel } from '../lib/layout'
import { cn, formatDuration, roundQuarter, toHHMM, todayStr } from '../lib/utils'
import { FallbackPlan, hasWebGL } from '../components/FallbackPlan'

const Scene = lazy(() => import('../scene/Scene'))

export function SceneHost({ mode }: { mode: 'service' | 'editor' }) {
  const webgl = useMemo(hasWebGL, [])
  if (!webgl) return <FallbackPlan mode={mode} />
  return (
    <Suspense
      fallback={
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
          <span className="animate-pulse">Construction de la salle 3D…</span>
        </div>
      }
    >
      <Scene mode={mode} />
    </Suspense>
  )
}

export function Workspace({ variant }: { variant: 'overview' | 'plan' }) {
  const selected = useStore((s) => s.selectedTableId)
  const selectTable = useStore((s) => s.selectTable)
  const mobile = useIsMobile()
  const reduced = useStore((s) => s.settings.reducedMotion)

  const side = selected ? (
    <TablePanel key={selected} tableId={selected} onClose={() => selectTable(null, false)} />
  ) : variant === 'overview' ? (
    <OverviewSide />
  ) : null

  return (
    <div className="flex min-h-0 flex-1">
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <SceneHost mode="service" />
        <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2">
          <StatusLegend className="pointer-events-auto" />
          {variant === 'plan' && !selected && <UpcomingFloating />}
        </div>
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 max-lg:bottom-[76px]">
          <NavHint />
          <CameraControlsBar className="pointer-events-auto ml-auto" />
        </div>
      </div>

      {!mobile && side && <div className="w-[360px] shrink-0 border-l border-line/70 bg-[#FCFBF9]">{side}</div>}

      {mobile && (
        <AnimatePresence>
          {selected && (
            <motion.div
              className="fixed inset-x-0 bottom-0 z-40 max-h-[72vh] overflow-hidden rounded-t-2xl bg-[#FCFBF9] shadow-float"
              initial={{ y: reduced ? 0 : '100%' }}
              animate={{ y: 0 }}
              exit={{ y: reduced ? 0 : '100%' }}
              transition={{ duration: reduced ? 0 : 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line" />
              <div className="max-h-[calc(72vh-12px)] overflow-y-auto">{side}</div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

function useUpcoming(limit = 6) {
  const reservations = useStore((s) => s.reservations)
  const now = useClock((s) => s.now)
  return useMemo(() => {
    const today = todayStr(new Date(now))
    return reservations
      .filter((r) => r.date === today && OPEN_RES.includes(r.status) && resStart(r) + r.duration * 60000 > now)
      .sort((a, b) => resStart(a) - resStart(b))
      .slice(0, limit)
  }, [reservations, now, limit])
}

function UpcomingFloating() {
  const upcoming = useUpcoming(4)
  const name = useCustomerName()
  const layout = useStore((s) => s.layout)
  const a = useStore.getState()
  if (!upcoming.length) return null
  return (
    <div className="pointer-events-auto hidden w-64 rounded-xl bg-white/95 p-3 shadow-float ring-1 ring-black/5 backdrop-blur md:block">
      <SectionTitle>Prochaines arrivées</SectionTitle>
      <ul className="space-y-0.5">
        {upcoming.map((r) => (
          <li key={r.id}>
            <button
              className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left text-[13px] hover:bg-black/[0.03]"
              onClick={() => (r.tableId ? a.selectTable(r.tableId) : a.openReservationForm(r))}
            >
              <span className="w-10 font-semibold tabular-nums">{r.time}</span>
              <span className="min-w-0 flex-1 truncate">{name(r.customerId)}</span>
              <span className="text-xs text-muted">{r.tableId ? `T${String(layout.find((t) => t.id === r.tableId)?.number).padStart(2, '0')}` : 'à placer'}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

const Metric = ({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon: typeof Clock3 }) => (
  <div className="rounded-xl bg-white p-3 shadow-card">
    <div className="flex items-center gap-1.5 text-[11px] text-muted">
      <Icon size={12} /> {label}
    </div>
    <div className="mt-0.5 text-xl font-semibold tabular-nums">{value}</div>
    {sub && <div className="text-[11px] text-muted">{sub}</div>}
  </div>
)

function OverviewSide() {
  const st = useLiveStats()
  const upcoming = useUpcoming(6)
  const name = useCustomerName()
  const layout = useStore((s) => s.layout)
  const tables = useStore((s) => s.tables)
  const reservations = useStore((s) => s.reservations)
  const staff = useStore((s) => s.staff)
  const events = useStore((s) => s.events)
  const windowMin = useStore((s) => s.settings.reservationWindowMin)
  const now = useClock((s) => s.now)
  const a = useStore.getState()

  const unplaced = reservations.filter((r) => r.date === todayStr(new Date(now)) && OPEN_RES.includes(r.status) && !r.tableId)

  const perWaiter = staff
    .filter((s) => s.active)
    .map((s) => {
      const mine = layout.filter((t) => t.kind === 'table' && tables[t.id]?.waiterId === s.id)
      const busy = mine.filter((t) => effectiveStatus(t.id, tables[t.id], reservations, now, windowMin) === 'occupied')
      return { s, tables: mine.length, busy: busy.length, covers: busy.reduce((acc, t) => acc + (tables[t.id]?.guests ?? 0), 0) }
    })

  return (
    <div className="flex h-full flex-col overflow-y-auto px-5 py-5">
      <div className="grid grid-cols-2 gap-2">
        <Metric icon={Activity} label="Taux d’occupation" value={`${st.occupancyTables} %`} sub={`${st.occupancySeats} % des places`} />
        <Metric icon={Clock3} label="Durée moyenne" value={st.avgDuration ? formatDuration(st.avgDuration) : '—'} sub={`${st.sessionsToday} tables terminées`} />
        <Metric icon={Users} label="Couverts attendus" value={String(st.coversExpected)} sub="réservations à venir" />
        <Metric icon={Activity} label="Rotations" value={st.rotations.toFixed(1)} sub="par table aujourd’hui" />
      </div>

      <section className="mt-6">
        <SectionTitle
          action={
            <Button size="sm" variant="ghost" onClick={() => a.openReservationForm({ date: todayStr(new Date(now)), time: roundQuarter(now, 30), partySize: 2 })}>
              <CalendarPlus size={13} /> Nouvelle
            </Button>
          }
        >
          Prochaines arrivées
        </SectionTitle>
        {upcoming.length ? (
          <ul className="space-y-1">
            {upcoming.map((r) => {
              const late = resStart(r) < now
              const t = layout.find((x) => x.id === r.tableId)
              return (
                <li key={r.id}>
                  <button
                    onClick={() => (r.tableId ? a.selectTable(r.tableId) : a.openReservationForm(r))}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white hover:shadow-card"
                  >
                    <span className={cn('w-11 text-sm font-semibold tabular-nums', late && 'text-accent')}>{r.time}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{name(r.customerId)}</span>
                      <span className="text-xs text-muted">
                        {r.partySize} pers. · {t ? tableLabel(t.number) : 'à placer'}
                        {r.status === 'pending' && ' · à confirmer'}
                        {late && ' · en retard'}
                      </span>
                    </span>
                    <Dot color={STATUS_META.reserved.color} />
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-[13px] text-muted">Aucune arrivée prévue pour le reste de la journée.</p>
        )}
        {unplaced.length > 0 && (
          <p className="mt-2 rounded-lg bg-[#FDF3E3] px-3 py-2 text-xs text-[#8A5A14]">
            {unplaced.length} réservation{unplaced.length > 1 ? 's' : ''} sans table — à placer depuis l’onglet Réservations.
          </p>
        )}
      </section>

      <section className="mt-6">
        <SectionTitle>Par serveur</SectionTitle>
        <ul className="space-y-1.5">
          {perWaiter.map(({ s, tables: n, busy, covers }) => (
            <li key={s.id} className="flex items-center gap-2 text-[13px]">
              <Dot color={s.color} />
              <span className="flex-1 font-medium">{s.name}</span>
              <span className="text-muted">
                {busy}/{n} tables · {covers} couv.
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <SectionTitle>Journal du service</SectionTitle>
        <ul className="space-y-2">
          {events.slice(0, 8).map((e) => (
            <li key={e.id} className="flex gap-2.5 text-xs">
              <span className="w-10 shrink-0 tabular-nums text-muted">{toHHMM(e.at)}</span>
              <button className="text-left text-ink/80 hover:text-ink disabled:cursor-default" disabled={!e.tableId} onClick={() => e.tableId && a.selectTable(e.tableId)}>
                {e.text}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
