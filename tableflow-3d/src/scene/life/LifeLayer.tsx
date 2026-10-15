import { useEffect, useLayoutEffect, useMemo, useReducer, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useClock, useStore } from '../../store/useStore'
import { useLife } from '../../store/useLife'
import { effectiveStatus } from '../../lib/service'
import { LifeSim, type StaffSnap, type TableSnap } from './sim'
import { Character } from './Character'

/**
 * Couche de vie du restaurant : serveurs, cuisiniers et convives animés,
 * synchronisés en continu avec l'état réel (statuts, couverts, serveurs affectés).
 */
export function LifeLayer() {
  const layout = useStore((s) => s.layout)
  const tables = useStore((s) => s.tables)
  const reservations = useStore((s) => s.reservations)
  const staff = useStore((s) => s.staff)
  const windowMin = useStore((s) => s.settings.reservationWindowMin)
  const reduced = useStore((s) => s.settings.reducedMotion)
  const enabled = useStore((s) => s.settings.showCharacters)
  const density = useStore((s) => s.settings.lifeDensity)
  const selected = useStore((s) => s.selectedTableId)
  const missions = useLife((s) => s.missions)
  const now = useClock((s) => s.now)
  const [, rerender] = useReducer((x: number) => x + 1, 0)
  const version = useRef(-1)

  // Une simulation par plan de salle : la grille de navigation dépend du mobilier.
  const sim = useMemo(() => new LifeSim(layout), [layout])

  useEffect(() => {
    sim.onMission = (id, m) => useLife.getState().set(id, m)
    return () => {
      sim.onMission = undefined
      useLife.setState({ missions: {} })
    }
  }, [sim])

  const snaps = useMemo<TableSnap[]>(
    () =>
      layout
        .filter((t) => t.kind === 'table')
        .map((t) => {
          const svc = tables[t.id]
          return {
            id: t.id,
            item: t,
            status: effectiveStatus(t.id, svc, reservations, now, windowMin),
            guests: svc?.guests ?? 0,
            seatedAt: svc?.seatedAt ?? null,
            waiterId: svc?.waiterId ?? null,
          }
        }),
    [layout, tables, reservations, now, windowMin],
  )
  const crew = useMemo<StaffSnap[]>(() => staff.filter((s) => s.active).map((s) => ({ id: s.id, name: s.name, color: s.color })), [staff])

  useLayoutEffect(() => sim.setOptions({ reduced, enabled, density }), [sim, reduced, enabled, density])
  useLayoutEffect(() => sim.sync(snaps, crew), [sim, snaps, crew])

  useFrame((_, dt) => {
    sim.update(dt)
    if (sim.version !== version.current) {
      version.current = sim.version
      rerender()
    }
  })

  const inCharge = selected ? tables[selected]?.waiterId : null
  const nameOf = (id?: string) => staff.find((s) => s.id === id)?.name ?? ''

  return (
    <group>
      {sim.agents.map((a) => (
        <Character
          key={a.id}
          agent={a}
          reduced={reduced}
          highlight={a.role === 'guest' && !!selected && a.tableId === selected}
          label={a.role === 'waiter' && a.staffId === inCharge ? `${nameOf(a.staffId)} · ${missions[a.staffId!]?.text ?? 'Disponible'}` : null}
        />
      ))}
    </group>
  )
}
