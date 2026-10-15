import type { LayoutItem, Reservation, Session, TableService, TableStatus } from '../types'
import { effectiveStatus, sessionsOfDay, tablesOf } from './service'
import { minutesBetween, serviceOfTime, todayStr } from './utils'

export interface LiveStats {
  counts: Record<TableStatus, number>
  totalTables: number
  usableTables: number
  seats: number
  covers: number
  occupancyTables: number // %
  occupancySeats: number // %
  reservationsToday: number
  reservationsService: number
  coversExpected: number
  avgDuration: number | null // minutes, occupations terminées aujourd'hui
  rotations: number // occupations terminées + en cours / tables
  sessionsToday: number
}

export const computeStats = (
  layout: LayoutItem[],
  tables: Record<string, TableService>,
  reservations: Reservation[],
  sessions: Session[],
  now: number,
  windowMin: number,
  service: 'midi' | 'soir',
): LiveStats => {
  const ts = tablesOf(layout)
  const counts: Record<TableStatus, number> = { available: 0, reserved: 0, occupied: 0, cleaning: 0, blocked: 0 }
  let covers = 0
  let seats = 0
  for (const t of ts) {
    const st = effectiveStatus(t.id, tables[t.id], reservations, now, windowMin)
    counts[st]++
    if (st !== 'blocked') seats += t.capacity ?? 0
    if (st === 'occupied') covers += tables[t.id]?.guests ?? 0
  }
  const usable = ts.length - counts.blocked
  const today = todayStr(new Date(now))
  const resToday = reservations.filter((r) => r.date === today && r.status !== 'cancelled')
  const resService = resToday.filter((r) => serviceOfTime(r.time) === service)
  const daySessions = sessionsOfDay(sessions, today)
  const avg = daySessions.length
    ? Math.round(daySessions.reduce((a, s) => a + minutesBetween(s.start, s.end), 0) / daySessions.length)
    : null
  return {
    counts,
    totalTables: ts.length,
    usableTables: usable,
    seats,
    covers,
    occupancyTables: usable ? Math.round((counts.occupied / usable) * 100) : 0,
    occupancySeats: seats ? Math.round((covers / seats) * 100) : 0,
    reservationsToday: resToday.length,
    reservationsService: resService.length,
    coversExpected: resService.filter((r) => r.status === 'pending' || r.status === 'confirmed').reduce((a, r) => a + r.partySize, 0),
    avgDuration: avg,
    rotations: ts.length ? Math.round(((daySessions.length + counts.occupied) / ts.length) * 10) / 10 : 0,
    sessionsToday: daySessions.length,
  }
}
