import type { LayoutItem, Reservation, Session, TableService, TableStatus } from '../types'
import { toTs, todayStr, minutesBetween } from './utils'

export const STATUS_META: Record<TableStatus, { label: string; color: string; short: string }> = {
  available: { label: 'Disponible', short: 'Libre', color: '#48A77A' },
  reserved: { label: 'Réservée', short: 'Réservée', color: '#E8A547' },
  occupied: { label: 'Occupée', short: 'Occupée', color: '#D95E55' },
  cleaning: { label: 'À nettoyer', short: 'Nettoyage', color: '#8C9EAB' },
  blocked: { label: 'Indisponible', short: 'Bloquée', color: '#5E5E5E' },
}

export const STATUS_ORDER: TableStatus[] = ['available', 'reserved', 'occupied', 'cleaning', 'blocked']

export const OPEN_RES: Reservation['status'][] = ['pending', 'confirmed']

export const resStart = (r: Reservation) => toTs(r.date, r.time)
export const resEnd = (r: Reservation) => resStart(r) + r.duration * 60000

/** Réservation attendue qui "tient" la table maintenant (fenêtre avant l'heure → fin du créneau). */
export const holdingReservation = (tableId: string, reservations: Reservation[], now: number, windowMin: number) =>
  reservations
    .filter((r) => r.tableId === tableId && OPEN_RES.includes(r.status))
    .filter((r) => now >= resStart(r) - windowMin * 60000 && now < resEnd(r))
    .sort((a, b) => resStart(a) - resStart(b))[0] ?? null

export const nextReservation = (tableId: string, reservations: Reservation[], now: number) =>
  reservations
    .filter((r) => r.tableId === tableId && OPEN_RES.includes(r.status) && resEnd(r) > now)
    .sort((a, b) => resStart(a) - resStart(b))[0] ?? null

export const effectiveStatus = (
  tableId: string,
  svc: TableService | undefined,
  reservations: Reservation[],
  now: number,
  windowMin: number,
): TableStatus => {
  const base = svc?.status ?? 'available'
  if (base === 'available' && holdingReservation(tableId, reservations, now, windowMin)) return 'reserved'
  return base
}

export const occupiedMinutes = (svc: TableService | undefined, now: number) =>
  svc?.status === 'occupied' && svc.seatedAt ? minutesBetween(svc.seatedAt, now) : 0

/** Conflits : même table, créneaux qui se chevauchent, réservations actives. */
export const reservationConflicts = (candidate: Pick<Reservation, 'id' | 'tableId' | 'date' | 'time' | 'duration'>, all: Reservation[]) => {
  if (!candidate.tableId) return []
  const s = toTs(candidate.date, candidate.time)
  const e = s + candidate.duration * 60000
  return all.filter(
    (r) =>
      r.id !== candidate.id &&
      r.tableId === candidate.tableId &&
      (OPEN_RES.includes(r.status) || r.status === 'seated') &&
      resStart(r) < e &&
      resEnd(r) > s,
  )
}

export const tablesOf = (layout: LayoutItem[]) =>
  layout.filter((i) => i.kind === 'table').sort((a, b) => (a.number ?? 0) - (b.number ?? 0))

export const sessionsOfDay = (sessions: Session[], date = todayStr()) => sessions.filter((s) => todayStr(new Date(s.end)) === date)
