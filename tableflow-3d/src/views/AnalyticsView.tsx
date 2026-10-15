import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { useClock, useStore } from '../store/useStore'
import { Card, SectionTitle } from '../components/ui'
import { useLiveStats } from '../lib/hooks'
import { effectiveStatus, sessionsOfDay, tablesOf } from '../lib/service'
import { tableLabel, zoneAt } from '../lib/layout'
import { formatDuration, minutesBetween, toHHMM, todayStr } from '../lib/utils'

const Kpi = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <Card className="p-4">
    <div className="text-xs text-muted">{label}</div>
    <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{value}</div>
    {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
  </Card>
)

const H1 = 24

export function AnalyticsView() {
  const st = useLiveStats()
  const layout = useStore((s) => s.layout)
  const tables = useStore((s) => s.tables)
  const sessions = useStore((s) => s.sessions)
  const reservations = useStore((s) => s.reservations)
  const windowMin = useStore((s) => s.settings.reservationWindowMin)
  const now = useClock((s) => s.now)
  const today = todayStr(new Date(now))
  const [hover, setHover] = useState<number | null>(null)

  const daySessions = useMemo(() => sessionsOfDay(sessions, today), [sessions, today])

  // Couverts présents par heure (occupations terminées + en cours), calculés depuis les données de l'app.
  const hourly = useMemo(() => {
    const spans = [
      ...daySessions.map((s) => ({ start: s.start, end: s.end, guests: s.guests })),
      ...Object.values(tables)
        .filter((t) => t.status === 'occupied' && t.seatedAt)
        .map((t) => ({ start: t.seatedAt!, end: now, guests: t.guests })),
    ]
    const base = new Date(now)
    // 11h → minuit, élargi si des occupations ont commencé plus tôt
    const H0 = Math.min(11, ...spans.map((s) => new Date(s.start).getHours()))
    return Array.from({ length: H1 - H0 }).map((_, i) => {
      const hs = new Date(base.getFullYear(), base.getMonth(), base.getDate(), H0 + i).getTime()
      const he = hs + 3600000
      const covers = spans.filter((s) => s.start < he && s.end > hs).reduce((a, s) => a + s.guests, 0)
      return { hour: H0 + i, covers, future: hs > now }
    })
  }, [daySessions, tables, now])
  const maxCovers = Math.max(10, ...hourly.map((h) => h.covers))

  const zones = useMemo(() => {
    const map = new Map<string, { name: string; tables: number; occupied: number; covers: number; seats: number }>()
    for (const t of tablesOf(layout)) {
      const z = zoneAt(layout, t.x, t.z)?.name ?? 'Salle'
      const e = map.get(z) ?? { name: z, tables: 0, occupied: 0, covers: 0, seats: 0 }
      e.tables++
      e.seats += t.capacity ?? 0
      if (effectiveStatus(t.id, tables[t.id], reservations, now, windowMin) === 'occupied') {
        e.occupied++
        e.covers += tables[t.id]?.guests ?? 0
      }
      map.set(z, e)
    }
    return [...map.values()]
  }, [layout, tables, reservations, now, windowMin])

  const resToday = reservations.filter((r) => r.date === today)
  const noShows = resToday.filter((r) => r.status === 'noshow').length
  const decided = resToday.filter((r) => ['completed', 'seated', 'noshow'].includes(r.status)).length

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 pb-24 lg:px-6 lg:pb-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Statistiques du jour</h2>
        <span className="text-xs text-muted">Calculées en temps réel depuis les données de l’application</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Taux d’occupation" value={`${st.occupancyTables} %`} sub={`${st.counts.occupied} / ${st.usableTables} tables`} />
        <Kpi label="Places occupées" value={`${st.occupancySeats} %`} sub={`${st.covers} / ${st.seats} places`} />
        <Kpi label="Durée moyenne" value={st.avgDuration ? formatDuration(st.avgDuration) : '—'} sub={`${st.sessionsToday} occupations terminées`} />
        <Kpi label="Rotations" value={st.rotations.toFixed(1)} sub="occupations / table" />
        <Kpi label="Réservations" value={String(st.reservationsToday)} sub={`${st.coversExpected} couverts attendus`} />
        <Kpi label="Absences" value={decided ? `${Math.round((noShows / decided) * 100)} %` : '—'} sub={`${noShows} no-show aujourd’hui`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <SectionTitle>Couverts présents par heure</SectionTitle>
          <div className="relative mt-4 h-48" onMouseLeave={() => setHover(null)}>
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <div key={f} className="absolute inset-x-0 border-t border-line/60" style={{ bottom: `${f * 100}%` }}>
                <span className="absolute -top-2 right-full mr-1 text-[10px] tabular-nums text-muted">{Math.round(maxCovers * f)}</span>
              </div>
            ))}
            <div className="absolute inset-0 ml-1 flex items-end gap-[2px]">
              {hourly.map((h, i) => (
                <div key={h.hour} className="relative flex h-full flex-1 items-end justify-center" onMouseEnter={() => setHover(i)}>
                  <div
                    className="w-[60%] max-w-[28px] rounded-t transition-[height] duration-300"
                    style={{
                      height: `${(h.covers / maxCovers) * 100}%`,
                      background: h.future ? 'transparent' : hover === i ? '#BB3834' : '#D84A42',
                      minHeight: h.covers ? 2 : 0,
                    }}
                  />
                  {hover === i && (
                    <div className="absolute bottom-full mb-1 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] text-white shadow-float" style={{ bottom: `${(h.covers / maxCovers) * 100}%` }}>
                      {h.hour}h–{h.hour + 1}h · <b>{h.covers}</b> couverts{h.future ? ' (à venir)' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="ml-1 mt-1 flex gap-[2px] text-[10px] text-muted">
            {hourly.map((h) => (
              <span key={h.hour} className="flex-1 text-center">
                {h.hour % 2 ? '' : `${h.hour}h`}
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle>Occupation par zone (maintenant)</SectionTitle>
          <ul className="mt-3 space-y-3">
            {zones.map((z) => (
              <li key={z.name}>
                <div className="mb-1 flex justify-between text-[13px]">
                  <span className="font-medium">{z.name}</span>
                  <span className="tabular-nums text-muted">
                    {z.occupied}/{z.tables} tables · {z.covers}/{z.seats} places
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#EFECE6]">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${z.tables ? (z.occupied / z.tables) * 100 : 0}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-start gap-2 rounded-xl bg-[#FAF8F4] p-3 text-xs text-muted">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>
              <b className="text-ink">Chiffre d’affaires non affiché</b> — aucune caisse ni source de paiement n’est connectée à ce prototype. Aucun montant n’est estimé.
            </span>
          </div>
        </Card>
      </div>

      <Card className="mt-4 overflow-x-auto p-5">
        <SectionTitle>Occupations terminées aujourd’hui</SectionTitle>
        {daySessions.length ? (
          <table className="w-full min-w-[480px] text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2 font-medium">Table</th>
                <th className="font-medium">Arrivée</th>
                <th className="font-medium">Départ</th>
                <th className="font-medium">Durée</th>
                <th className="text-right font-medium">Couverts</th>
              </tr>
            </thead>
            <tbody>
              {[...daySessions]
                .sort((a, b) => b.end - a.end)
                .map((s) => (
                  <tr key={s.id} className="border-t border-line/60">
                    <td className="py-2 font-medium">{tableLabel(s.tableNumber)}</td>
                    <td className="tabular-nums">{toHHMM(s.start)}</td>
                    <td className="tabular-nums">{toHHMM(s.end)}</td>
                    <td className="tabular-nums">{formatDuration(minutesBetween(s.start, s.end))}</td>
                    <td className="text-right tabular-nums">{s.guests}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-muted">Aucune table libérée pour l’instant.</p>
        )}
      </Card>
    </div>
  )
}
