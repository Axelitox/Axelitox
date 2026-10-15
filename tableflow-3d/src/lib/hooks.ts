import { useEffect, useMemo, useState } from 'react'
import { useClock, useStore } from '../store/useStore'
import { computeStats } from './stats'
import { serviceOf } from './utils'

export const useActiveService = () => {
  const override = useStore((s) => s.settings.serviceOverride)
  const now = useClock((s) => s.now)
  return override ?? serviceOf(now)
}

export const useLiveStats = () => {
  const layout = useStore((s) => s.layout)
  const tables = useStore((s) => s.tables)
  const reservations = useStore((s) => s.reservations)
  const sessions = useStore((s) => s.sessions)
  const windowMin = useStore((s) => s.settings.reservationWindowMin)
  const now = useClock((s) => s.now)
  const service = useActiveService()
  return useMemo(
    () => computeStats(layout, tables, reservations, sessions, now, windowMin, service),
    [layout, tables, reservations, sessions, now, windowMin, service],
  )
}

export const useIsMobile = () => {
  const q = '(max-width: 1023px)'
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const h = () => setM(mq.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return m
}

export const useCustomerName = () => {
  const customers = useStore((s) => s.customers)
  return useMemo(() => {
    const map = new Map(customers.map((c) => [c.id, c.name]))
    return (id: string | null | undefined) => (id ? map.get(id) ?? 'Client supprimé' : '—')
  }, [customers])
}
