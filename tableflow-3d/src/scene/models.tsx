import { memo, useMemo } from 'react'
import * as THREE from 'three'
import type { LayoutItem } from '../types'
import { M, floorTexture, labelTexture } from './materials'
import { seatPositions } from '../lib/layout'

// Géométries unitaires partagées, mises à l'échelle par mesh (réutilisation maximale).
export const BOX = new THREE.BoxGeometry(1, 1, 1)
export const CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 24)
const CYL8 = new THREE.CylinderGeometry(0.5, 0.5, 1, 8)
const CONE = new THREE.ConeGeometry(0.5, 1, 10, 1, true)
const LEAF = new THREE.IcosahedronGeometry(0.5, 1)
const SPHERE = new THREE.SphereGeometry(0.5, 12, 8)
export const PLANE = new THREE.PlaneGeometry(1, 1)

type V3 = [number, number, number]

interface PrimProps {
  p: V3
  s: V3
  m: THREE.Material
  r?: V3
  shadow?: boolean
}

export const B = ({ p, s, m, r, shadow = true }: PrimProps) => (
  <mesh geometry={BOX} position={p} scale={s} rotation={r} material={m} castShadow={shadow} receiveShadow />
)
export const C = ({ p, s, m, r, shadow = true, g = CYL }: PrimProps & { g?: THREE.BufferGeometry }) => (
  <mesh geometry={g} position={p} scale={s} rotation={r} material={m} castShadow={shadow} receiveShadow />
)

// ─── Mobilier ──────────────────────────────────────────────────────────────

export const Chair = memo(({ x = 0, z = 0, rot = 0 }: { x?: number; z?: number; rot?: number }) => (
  <group position={[x, 0, z]} rotation={[0, rot, 0]}>
    <B p={[0, 0.46, 0]} s={[0.42, 0.05, 0.42]} m={M.wood} />
    <B p={[0, 0.72, 0.19]} s={[0.42, 0.42, 0.04]} m={M.wood} />
    {[
      [-0.18, -0.18],
      [0.18, -0.18],
      [-0.18, 0.18],
      [0.18, 0.18],
    ].map(([lx, lz], i) => (
      <B key={i} p={[lx, 0.22, lz]} s={[0.035, 0.44, 0.035]} m={M.greyDark} shadow={false} />
    ))}
  </group>
))

export const Stool = memo(() => (
  <group>
    <C p={[0, 0.76, 0]} s={[0.36, 0.06, 0.36]} m={M.upholstery} />
    <C p={[0, 0.38, 0]} s={[0.05, 0.76, 0.05]} m={M.greyDark} g={CYL8} />
    <C p={[0, 0.3, 0]} s={[0.3, 0.02, 0.3]} m={M.greyDark} g={CYL8} shadow={false} />
    <C p={[0, 0.015, 0]} s={[0.34, 0.03, 0.34]} m={M.greyDark} />
  </group>
))

export const TableModel = memo(({ item }: { item: LayoutItem }) => {
  const seats = useMemo(() => seatPositions(item), [item])
  const top = 0.74
  return (
    <group>
      {item.shape === 'round' ? (
        <>
          <C p={[0, top, 0]} s={[item.w, 0.045, item.w]} m={M.wood} />
          <C p={[0, top / 2, 0]} s={[0.08, top, 0.08]} m={M.greyDark} g={CYL8} />
          <C p={[0, 0.015, 0]} s={[item.w * 0.5, 0.03, item.w * 0.5]} m={M.greyDark} />
        </>
      ) : (
        <>
          <B p={[0, top, 0]} s={[item.w, 0.045, item.d]} m={M.wood} />
          {[
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([sx, sz], i) => (
            <B key={i} p={[sx * (item.w / 2 - 0.07), top / 2, sz * (item.d / 2 - 0.07)]} s={[0.05, top, 0.05]} m={M.greyDark} shadow={false} />
          ))}
        </>
      )}
      {/* couverts dressés */}
      {seats.map((s, i) => (
        <C key={`p${i}`} p={[s.x * 0.52, top + 0.028, s.z * 0.52]} s={[0.2, 0.012, 0.2]} m={M.plate} shadow={false} />
      ))}
      {seats.map((s, i) => (
        <Chair key={i} x={s.x} z={s.z} rot={s.rot} />
      ))}
      {item.parasol && <ParasolModel />}
    </group>
  )
})

export const Banquette = memo(({ w, d }: { w: number; d: number }) => (
  <group>
    <B p={[0, 0.21, 0.04]} s={[w, 0.42, d - 0.08]} m={M.upholstery} />
    <B p={[0, 0.62, -d / 2 + 0.08]} s={[w, 0.62, 0.16]} m={M.upholstery} />
    <B p={[0, 0.03, 0]} s={[w + 0.02, 0.06, d]} m={M.woodDark} />
  </group>
))

export const Wall = memo(({ w, d, h }: { w: number; d: number; h: number }) => (
  <group>
    <B p={[0, h / 2, 0]} s={[w, h, d]} m={M.wall} />
    <B p={[0, h + 0.025, 0]} s={[w + 0.01, 0.05, d + 0.02]} m={M.red} />
  </group>
))

export const Partition = memo(({ w, h, glass }: { w: number; h: number; glass?: boolean }) => {
  if (glass) {
    const base = 0.95
    const posts = Math.max(2, Math.round(w / 1.2) + 1)
    return (
      <group>
        <B p={[0, base / 2, 0]} s={[w, base, 0.12]} m={M.wall} />
        <B p={[0, (h + base) / 2, 0]} s={[w, h - base, 0.02]} m={M.glass} shadow={false} />
        {Array.from({ length: posts }).map((_, i) => (
          <B key={i} p={[-w / 2 + (i * w) / (posts - 1), (h + base) / 2, 0]} s={[0.05, h - base, 0.06]} m={M.redDark} />
        ))}
        <B p={[0, h, 0]} s={[w, 0.06, 0.08]} m={M.red} />
      </group>
    )
  }
  const n = Math.max(3, Math.round(w / 0.16))
  return (
    <group>
      <B p={[0, 0.04, 0]} s={[w, 0.08, 0.1]} m={M.woodDark} />
      <B p={[0, h, 0]} s={[w, 0.05, 0.1]} m={M.woodDark} />
      {Array.from({ length: n }).map((_, i) => (
        <B key={i} p={[-w / 2 + 0.04 + (i * (w - 0.08)) / (n - 1), h / 2, 0]} s={[0.04, h, 0.06]} m={M.wood} />
      ))}
    </group>
  )
})

export const Door = memo(({ w, h, label }: { w: number; h: number; label?: string }) => (
  <group>
    <B p={[-w / 2 + 0.05, h / 2, 0]} s={[0.1, h, 0.22]} m={M.red} />
    <B p={[w / 2 - 0.05, h / 2, 0]} s={[0.1, h, 0.22]} m={M.red} />
    <B p={[0, h - 0.06, 0]} s={[w, 0.12, 0.22]} m={M.red} />
    {/* battants entrouverts */}
    <group position={[-w / 2 + 0.1, 0, 0]} rotation={[0, -0.9, 0]}>
      <B p={[(w / 2 - 0.1) / 2, (h - 0.14) / 2, 0]} s={[w / 2 - 0.12, h - 0.16, 0.03]} m={M.glass} shadow={false} />
    </group>
    <group position={[w / 2 - 0.1, 0, 0]} rotation={[0, 0.9, 0]}>
      <B p={[-(w / 2 - 0.1) / 2, (h - 0.14) / 2, 0]} s={[w / 2 - 0.12, h - 0.16, 0.03]} m={M.glass} shadow={false} />
    </group>
    {label && (
      <mesh geometry={PLANE} position={[0, 0.006, 0.9]} rotation={[-Math.PI / 2, 0, 0]} scale={[w * 1.6, w * 0.2, 1]}>
        <meshBasicMaterial map={labelTexture(label, 'rgba(187,56,52,0.55)')} transparent depthWrite={false} />
      </mesh>
    )}
  </group>
))

const BOTTLE_MATS = [M.bottleGreen, M.bottleAmber, M.bottleClear]

export const BarCounter = memo(({ w, d }: { w: number; d: number }) => (
  <group>
    <B p={[0, 0.5, 0]} s={[w, 1.0, d - 0.1]} m={M.wood} />
    <B p={[0, 1.04, 0]} s={[w + 0.08, 0.08, d]} m={M.stone} />
    <B p={[0, 0.2, d / 2 + 0.02]} s={[w - 0.1, 0.04, 0.04]} m={M.red} shadow={false} />
    {Array.from({ length: Math.floor(w / 0.12) }).map((_, i) =>
      i % 2 ? null : <B key={i} p={[-w / 2 + 0.1 + i * 0.12, 0.5, (d - 0.1) / 2 + 0.005]} s={[0.05, 0.92, 0.01]} m={M.woodDark} shadow={false} />,
    )}
  </group>
))

export const Shelf = memo(({ w, d }: { w: number; d: number }) => {
  const bottles = useMemo(() => {
    const out: { x: number; y: number; m: THREE.Material; h: number }[] = []
    const n = Math.floor(w / 0.16)
    for (const y of [0.95, 1.45, 1.95]) for (let i = 0; i < n; i++) if ((i * 7 + y * 10) % 5 > 1) out.push({ x: -w / 2 + 0.12 + i * 0.16, y, m: BOTTLE_MATS[(i + Math.round(y * 3)) % 3], h: 0.24 + ((i * 3) % 4) * 0.02 })
    return out
  }, [w])
  return (
    <group>
      <B p={[0, 1.2, -d / 2 + 0.02]} s={[w, 2.2, 0.04]} m={M.woodDark} />
      <B p={[0, 0.4, 0]} s={[w, 0.8, d]} m={M.wood} />
      {[0.82, 1.32, 1.82, 2.3].map((y) => (
        <B key={y} p={[0, y, 0]} s={[w, 0.04, d]} m={M.wood} shadow={false} />
      ))}
      {bottles.map((b, i) => (
        <C key={i} p={[b.x, b.y - 0.1 + b.h / 2, 0.02]} s={[0.07, b.h, 0.07]} m={b.m} g={CYL8} shadow={false} />
      ))}
    </group>
  )
})

export const Coffee = memo(() => (
  <group position={[0, 1.08, 0]}>
    <B p={[0, 0.22, 0]} s={[0.6, 0.44, 0.42]} m={M.steel} />
    <B p={[0, 0.46, 0]} s={[0.62, 0.04, 0.44]} m={M.red} />
    <B p={[0, 0.14, 0.24]} s={[0.5, 0.06, 0.08]} m={M.black} />
    <C p={[-0.13, 0.08, 0.26]} s={[0.07, 0.06, 0.07]} m={M.black} />
    <C p={[0.13, 0.08, 0.26]} s={[0.07, 0.06, 0.07]} m={M.black} />
    <C p={[-0.2, 0.52, 0.1]} s={[0.06, 0.04, 0.06]} m={M.plate} />
  </group>
))

export const Display = memo(({ w, d }: { w: number; d: number }) => (
  <group position={[0, 1.08, 0]}>
    <B p={[0, 0.03, 0]} s={[w, 0.06, d]} m={M.woodDark} />
    {[-0.25, 0, 0.25].map((x, i) => (
      <C key={i} p={[x * w, 0.11, 0]} s={[0.16, 0.08, 0.16]} m={i === 1 ? M.red : M.wood} />
    ))}
    <B p={[0, 0.2, 0]} s={[w - 0.02, 0.28, d - 0.02]} m={M.glass} shadow={false} />
  </group>
))

export const Kitchen = memo(({ item }: { item: LayoutItem }) => {
  const { w, d } = item
  switch (item.variant) {
    case 'stove':
      return (
        <group>
          <B p={[0, 0.45, 0]} s={[w, 0.9, d]} m={M.steel} />
          <B p={[0, 0.91, 0]} s={[w - 0.04, 0.02, d - 0.04]} m={M.black} />
          {Array.from({ length: Math.max(2, Math.floor(w / 0.5)) }).map((_, i, a) => (
            <C key={i} p={[-w / 2 + (w / a.length) * (i + 0.5), 0.93, 0]} s={[0.22, 0.02, 0.22]} m={M.greyDark} shadow={false} />
          ))}
          <C p={[-w / 4, 1.0, 0.05]} s={[0.28, 0.16, 0.28]} m={M.metal} />
        </group>
      )
    case 'hood':
      return <B p={[0, 2.15, 0]} s={[w, 0.45, d]} m={M.steel} />
    case 'fridge':
      return (
        <group>
          <B p={[0, 1.0, 0]} s={[w, 2.0, d]} m={M.steel} />
          <B p={[0, 1.0, d / 2 + 0.005]} s={[0.02, 1.9, 0.01]} m={M.greyDark} shadow={false} />
        </group>
      )
    case 'pass':
      return (
        <group>
          <B p={[0, 0.5, 0]} s={[w, 1.0, d]} m={M.steel} />
          <B p={[0, 1.02, 0]} s={[w + 0.04, 0.04, d + 0.04]} m={M.stone} />
          <B p={[0, 1.6, 0]} s={[w, 0.08, 0.2]} m={M.red} />
          <B p={[-w / 2 + 0.04, 1.32, 0]} s={[0.03, 0.56, 0.03]} m={M.greyDark} shadow={false} />
          <B p={[w / 2 - 0.04, 1.32, 0]} s={[0.03, 0.56, 0.03]} m={M.greyDark} shadow={false} />
          {[-0.8, -0.3, 0.3, 0.8].map((x) => (
            <C key={x} p={[x * (w / 2.2), 1.06, 0]} s={[0.26, 0.03, 0.26]} m={M.plate} shadow={false} />
          ))}
        </group>
      )
    default:
      return (
        <group>
          <B p={[0, 0.45, 0]} s={[w, 0.9, d]} m={M.steel} />
          <B p={[0, 0.91, 0]} s={[w + 0.02, 0.02, d + 0.02]} m={M.metal} />
          <B p={[w / 4, 0.95, 0]} s={[0.4, 0.04, 0.3]} m={M.wood} shadow={false} />
        </group>
      )
  }
})

export const Plant = memo(({ scale = 1 }: { scale?: number }) => (
  <group scale={scale}>
    <C p={[0, 0.22, 0]} s={[0.36, 0.44, 0.36]} m={M.pot} />
    <mesh geometry={LEAF} material={M.leaf} position={[0, 0.82, 0]} scale={[0.72, 0.85, 0.72]} castShadow />
    <mesh geometry={LEAF} material={M.leafDark} position={[0.12, 1.12, -0.05]} scale={[0.46, 0.5, 0.46]} castShadow />
  </group>
))

export const Planter = memo(({ w, d }: { w: number; d: number }) => {
  const n = Math.max(2, Math.round(w / 0.6))
  return (
    <group>
      <B p={[0, 0.25, 0]} s={[w, 0.5, d]} m={M.wall} />
      <B p={[0, 0.52, 0]} s={[w + 0.02, 0.04, d + 0.02]} m={M.red} shadow={false} />
      {Array.from({ length: n }).map((_, i) => (
        <mesh
          key={i}
          geometry={LEAF}
          material={i % 2 ? M.leafDark : M.leaf}
          position={[-w / 2 + (w / n) * (i + 0.5), 0.72, 0]}
          scale={[0.55, 0.42 + (i % 3) * 0.06, 0.4]}
          castShadow
        />
      ))}
    </group>
  )
})

export const ParasolModel = memo(() => (
  <group>
    <C p={[0, 1.1, 0]} s={[0.04, 2.2, 0.04]} m={M.greyDark} g={CYL8} />
    <mesh geometry={CONE} material={M.canvas} position={[0, 2.3, 0]} scale={[1.7, 0.32, 1.7]} castShadow />
    <C p={[0, 2.15, 0]} s={[1.7, 0.03, 1.7]} m={M.red} g={CYL8} shadow={false} />
  </group>
))

export const Lectern = memo(() => (
  <group>
    <B p={[0, 0.5, 0]} s={[0.5, 1.0, 0.36]} m={M.wood} />
    <B p={[0, 1.05, 0.02]} s={[0.56, 0.04, 0.42]} r={[-0.25, 0, 0]} m={M.red} />
  </group>
))

export const Pendant = memo(() => (
  <group>
    <C p={[0, 2.65, 0]} s={[0.012, 1.1, 0.012]} m={M.black} g={CYL8} shadow={false} />
    <mesh geometry={CONE} material={M.red} position={[0, 2.03, 0]} scale={[0.36, 0.22, 0.36]} />
    <mesh geometry={SPHERE} material={M.bulb} position={[0, 1.93, 0]} scale={0.1} />
  </group>
))

const ZONE_COLORS: Record<string, string> = {
  salle: 'rgba(110,95,75,0.35)',
  terrasse: 'rgba(110,95,75,0.35)',
  bar: 'rgba(110,95,75,0.35)',
  cuisine: 'rgba(90,95,100,0.35)',
  prive: 'rgba(187,56,52,0.4)',
}

export const ZoneFloor = memo(({ item, level = 0 }: { item: LayoutItem; level?: number }) => {
  const tex = useMemo(() => {
    const t = floorTexture(item.zoneType ?? 'salle').clone()
    t.needsUpdate = true
    t.repeat.set(item.w / 2, item.d / 2)
    return t
  }, [item.zoneType, item.w, item.d])
  const y = 0.002 + level * 0.002
  const lw = Math.min(item.w * 0.6, 4)
  return (
    <group>
      <mesh geometry={PLANE} rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} scale={[item.w, item.d, 1]} receiveShadow>
        <meshStandardMaterial map={tex} roughness={0.9} color={item.zoneType === 'prive' ? '#F6E9E4' : '#FFFFFF'} />
      </mesh>
      {item.zoneType !== 'salle' && (
        <mesh
          geometry={PLANE}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-item.w / 2 + lw / 2 + 0.25, y + 0.001, item.d / 2 - 0.35]}
          scale={[lw, lw / 8, 1]}
        >
          <meshBasicMaterial map={labelTexture(item.name ?? '', ZONE_COLORS[item.zoneType ?? 'salle'])} transparent depthWrite={false} />
        </mesh>
      )}
    </group>
  )
})

/** Rendu d'un objet du plan (hors interactivité). */
export const ItemModel = memo(({ item }: { item: LayoutItem }) => {
  switch (item.kind) {
    case 'table':
      return <TableModel item={item} />
    case 'chair':
      return <Chair />
    case 'stool':
      return <Stool />
    case 'banquette':
      return <Banquette w={item.w} d={item.d} />
    case 'wall':
      return <Wall w={item.w} d={item.d} h={item.h ?? 2.6} />
    case 'partition':
      return <Partition w={item.w} h={item.h ?? 1.4} glass={item.glass} />
    case 'door':
      return <Door w={item.w} h={item.h ?? 2.2} label={item.name === 'Entrée principale' ? 'Entrée' : undefined} />
    case 'bar':
      return <BarCounter w={item.w} d={item.d} />
    case 'shelf':
      return <Shelf w={item.w} d={item.d} />
    case 'coffee':
      return <Coffee />
    case 'display':
      return <Display w={item.w} d={item.d} />
    case 'kitchen':
      return <Kitchen item={item} />
    case 'plant':
      return <Plant scale={item.w / 0.5} />
    case 'planter':
      return <Planter w={item.w} d={item.d} />
    case 'parasol':
      return <ParasolModel />
    case 'lectern':
      return <Lectern />
    case 'pendant':
      return <Pendant />
    case 'zone':
      return <ZoneFloor item={item} />
    default:
      return null
  }
})
