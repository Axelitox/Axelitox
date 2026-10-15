import { memo, useCallback, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import type { LayoutItem } from '../types'
import { useClock, useStore } from '../store/useStore'
import { ItemModel } from './models'
import { TableObject, type TableView } from './TableObject'
import { LifeLayer } from './life/LifeLayer'
import { effectiveStatus, holdingReservation, occupiedMinutes } from '../lib/service'

export const StaticItems = memo(({ items }: { items: LayoutItem[] }) => {
  // les zones les plus petites sont dessinées au-dessus des grandes
  const zoneLevel = useMemo(() => {
    const zones = items.filter((i) => i.kind === 'zone').sort((a, b) => b.w * b.d - a.w * a.d)
    return new Map(zones.map((z, i) => [z.id, i]))
  }, [items])
  return (
    <>
      {items.map((it) => (
        <group
          key={it.id}
          position={[it.x, it.kind === 'zone' ? (zoneLevel.get(it.id) ?? 0) * 0.002 : 0, it.z]}
          rotation={[0, it.rotation, 0]}
        >
          <ItemModel item={it} />
        </group>
      ))}
    </>
  )
})

export function ServiceLayer() {
  const layout = useStore((s) => s.layout)
  const tables = useStore((s) => s.tables)
  const reservations = useStore((s) => s.reservations)
  const customers = useStore((s) => s.customers)
  const staff = useStore((s) => s.staff)
  const settings = useStore((s) => s.settings)
  const selected = useStore((s) => s.selectedTableId)
  const hovered = useStore((s) => s.hoveredTableId)
  const filter = useStore((s) => s.statusFilter)
  const selectTable = useStore((s) => s.selectTable)
  const hoverTable = useStore((s) => s.hoverTable)
  const now = useClock((s) => s.now)
  const compact = useThree((s) => s.size.width < 700)

  const statics = useMemo(() => layout.filter((i) => i.kind !== 'table'), [layout])
  const tableItems = useMemo(() => layout.filter((i) => i.kind === 'table'), [layout])

  const views = useMemo(() => {
    const out: Record<string, TableView> = {}
    for (const t of tableItems) {
      const svc = tables[t.id]
      const status = effectiveStatus(t.id, svc, reservations, now, settings.reservationWindowMin)
      const minutes = occupiedMinutes(svc, now)
      let info = `${t.capacity} pl.`
      if (status === 'occupied') info = `${svc?.guests ?? 0}/${t.capacity} · ${minutes} min`
      else if (status === 'reserved') {
        const r = holdingReservation(t.id, reservations, now, settings.reservationWindowMin)
        const c = r ? customers.find((x) => x.id === r.customerId) : null
        info = r ? `${r.time} · ${c?.name.split(' ').slice(-1)[0] ?? ''}` : 'Bloquée'
      } else if (status === 'cleaning') info = 'Nettoyage'
      else if (status === 'blocked') info = 'Indisponible'
      out[t.id] = { status, guests: svc?.guests ?? 0, minutes, info, waiterColor: staff.find((s) => s.id === svc?.waiterId)?.color }
    }
    return out
  }, [tableItems, tables, reservations, customers, staff, now, settings.reservationWindowMin])

  const onSelect = useCallback((id: string) => selectTable(id), [selectTable])

  return (
    <>
      <StaticItems items={statics} />
      <LifeLayer />
      {tableItems.map((t) => (
        <TableObject
          key={t.id}
          item={t}
          view={views[t.id]}
          selected={selected === t.id}
          hovered={hovered === t.id}
          dimmed={!!filter && views[t.id].status !== filter}
          reduced={settings.reducedMotion}
          showBadge={settings.showBadges}
          compact={compact}
          onSelect={onSelect}
          onHover={hoverTable}
        />
      ))}
    </>
  )
}
