import { memo, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { LayoutItem, TableStatus } from '../types'
import { TableModel, PLANE } from './models'
import { seatPositions, tableLabel } from '../lib/layout'
import { STATUS_META } from '../lib/service'
import { cn } from '../lib/utils'

export interface TableView {
  status: TableStatus
  guests: number
  minutes: number
  info: string
  waiterColor?: string
}

const roundedRect = (w: number, d: number, r: number) => {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -d / 2
  r = Math.min(r, w / 2, d / 2)
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + d - r)
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d)
  s.lineTo(x + r, y + d)
  s.quadraticCurveTo(x, y + d, x, y + d - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

/** Empreinte locale (table + chaises) pour le halo au sol. */
const haloGeometry = (item: LayoutItem) => {
  const pad = 0.18
  if (item.shape === 'round' && item.seating !== 'oneSide') {
    const r = item.w / 2 + 0.55 + pad
    return { fill: new THREE.CircleGeometry(r, 48), ring: new THREE.RingGeometry(r - 0.035, r, 64), cx: 0, cz: 0 }
  }
  let minX = -item.w / 2
  let maxX = item.w / 2
  let minZ = -item.d / 2
  let maxZ = item.d / 2
  for (const s of seatPositions(item)) {
    minX = Math.min(minX, s.x - 0.25)
    maxX = Math.max(maxX, s.x + 0.25)
    minZ = Math.min(minZ, s.z - 0.25)
    maxZ = Math.max(maxZ, s.z + 0.25)
  }
  const w = maxX - minX + pad * 2
  const d = maxZ - minZ + pad * 2
  const shape = roundedRect(w, d, 0.3)
  const inner = roundedRect(w - 0.07, d - 0.07, 0.27)
  const ringShape = roundedRect(w, d, 0.3)
  ringShape.holes.push(new THREE.Path(inner.getPoints(12).reverse()))
  return {
    fill: new THREE.ShapeGeometry(shape, 12),
    ring: new THREE.ShapeGeometry(ringShape, 12),
    cx: (minX + maxX) / 2,
    cz: (minZ + maxZ) / 2,
  }
}

interface Props {
  item: LayoutItem
  view: TableView
  selected: boolean
  hovered: boolean
  dimmed: boolean
  reduced: boolean
  showBadge: boolean
  compact?: boolean
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}

const tmpColor = new THREE.Color()

export const TableObject = memo(function TableObject({ item, view, selected, hovered, dimmed, reduced, showBadge, compact, onSelect, onHover }: Props) {
  const lift = useRef<THREE.Group>(null)
  const fillMat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0.16 }), [])
  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0.7 }), [])
  const pulseMat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0 }), [])
  const pulse = useRef<THREE.Mesh>(null)
  const geo = useMemo(() => haloGeometry(item), [item])
  const target = STATUS_META[view.status].color
  const lastStatus = useRef(view.status)
  const pulseStart = useRef(-1)
  const first = useRef(true)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (lastStatus.current !== view.status) {
      lastStatus.current = view.status
      pulseStart.current = t
    }
    const k = reduced ? 1 : 1 - Math.exp(-dt * 8)
    tmpColor.set(target)
    if (first.current) {
      fillMat.color.copy(tmpColor)
      ringMat.color.copy(tmpColor)
      first.current = false
    }
    fillMat.color.lerp(tmpColor, k)
    ringMat.color.lerp(tmpColor, k)
    pulseMat.color.copy(ringMat.color)

    const base = view.status === 'available' ? 0.1 : 0.18
    const fillTarget = (selected ? 0.32 : hovered ? 0.26 : base) * (dimmed ? 0.4 : 1)
    fillMat.opacity += (fillTarget - fillMat.opacity) * k
    const ringTarget = (selected ? 0.95 + (reduced ? 0 : Math.sin(t * 3) * 0.05) : hovered ? 0.85 : 0.5) * (dimmed ? 0.35 : 1)
    ringMat.opacity += (ringTarget - ringMat.opacity) * k

    if (lift.current) {
      const ly = selected ? 0.06 : hovered ? 0.04 : 0
      lift.current.position.y += (ly - lift.current.position.y) * k
      const sc = hovered && !selected ? 1.02 : 1
      lift.current.scale.setScalar(lift.current.scale.x + (sc - lift.current.scale.x) * k)
    }

    // onde de changement de statut
    if (pulse.current) {
      const p = pulseStart.current < 0 || reduced ? 1 : (t - pulseStart.current) / 0.9
      if (p < 1) {
        pulse.current.visible = true
        pulse.current.scale.setScalar(1 + p * 0.35)
        pulseMat.opacity = (1 - p) * 0.6
      } else pulse.current.visible = false
    }
  })

  const click = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6) return // c'était un déplacement de caméra
    e.stopPropagation()
    onSelect(item.id)
  }

  return (
    <group position={[item.x, 0, item.z]} rotation={[0, item.rotation, 0]}>
      <group position={[geo.cx, 0.012, geo.cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={geo.fill} material={fillMat} renderOrder={2} />
        <mesh geometry={geo.ring} material={ringMat} renderOrder={3} />
        <mesh ref={pulse} geometry={geo.ring} material={pulseMat} visible={false} renderOrder={3} />
      </group>
      <group
        ref={lift}
        onClick={click}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(item.id)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          onHover(null)
          document.body.style.cursor = ''
        }}
      >
        <TableModel item={item} />
        {/* zone de clic généreuse, invisible */}
        <mesh geometry={PLANE} rotation={[-Math.PI / 2, 0, 0]} position={[geo.cx, 0.8, geo.cz]} scale={[item.w + 0.9, item.d + 0.9, 1]} visible={false} />
      </group>
      {showBadge && (
        <Html position={[0, item.parasol ? 2.7 : 1.25, 0]} center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
          <TableBadge item={item} view={view} selected={selected} hovered={hovered} dimmed={dimmed} compact={compact} onClick={() => onSelect(item.id)} />
        </Html>
      )}
    </group>
  )
})

function TableBadge({
  item,
  view,
  selected,
  hovered,
  dimmed,
  compact,
  onClick,
}: {
  item: LayoutItem
  view: TableView
  selected: boolean
  hovered: boolean
  dimmed: boolean
  compact?: boolean
  onClick: () => void
}) {
  const meta = STATUS_META[view.status]
  const expanded = hovered || selected
  return (
    <button
      type="button"
      onClick={(e) => {
        // empêche R3F (écouteur sur le conteneur) de considérer ce clic comme "dans le vide"
        e.stopPropagation()
        onClick()
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      aria-label={`${tableLabel(item.number)} — ${meta.label}`}
      className={cn(
        'tf-badge pointer-events-auto flex select-none items-center gap-1.5 whitespace-nowrap rounded-full bg-white/95 py-1 pl-1',
        compact && !expanded ? 'pr-1.5' : 'pr-2.5',
        ' text-[11px] font-medium text-ink shadow-float ring-1 ring-black/5 backdrop-blur transition-all duration-200',
        selected && 'ring-2 ring-accent',
        dimmed && 'opacity-40',
      )}
      style={{ transform: `translateY(${expanded ? -4 : 0}px)` }}
    >
      <span
        key={view.status}
        className="tf-pop flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
        style={{ background: meta.color }}
      >
        {String(item.number).padStart(2, '0')}
      </span>
      {(!compact || expanded) && <span className="tabular-nums">{view.info}</span>}
      {expanded && !compact && <span className="text-muted">· {meta.label}</span>}
      {view.waiterColor && <span className="ml-0.5 h-1.5 w-1.5 rounded-full" style={{ background: view.waiterColor }} />}
    </button>
  )
}
