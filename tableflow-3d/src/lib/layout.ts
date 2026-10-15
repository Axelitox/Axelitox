import type { ItemKind, LayoutItem, TableShape, ZoneType } from '../types'
import { uid } from './utils'

// ─── Tables : dimensions & places ──────────────────────────────────────────

export const tableDims = (shape: TableShape, capacity: number): { w: number; d: number } => {
  if (shape === 'round') {
    const dia = capacity <= 2 ? 0.75 : capacity <= 4 ? 1.05 : 1.4
    return { w: dia, d: dia }
  }
  if (shape === 'square') return capacity <= 2 ? { w: 0.7, d: 0.7 } : { w: 0.9, d: 0.9 }
  return capacity <= 6 ? { w: 1.8, d: 0.85 } : { w: 2.4, d: 0.9 }
}

export interface Seat {
  x: number
  z: number
  rot: number
}

const CHAIR_GAP = 0.3

/** Positions des chaises en coordonnées locales de la table. */
export const seatPositions = (t: LayoutItem): Seat[] => {
  const cap = Math.max(1, t.capacity ?? 2)
  const oneSide = t.seating === 'oneSide'
  const seats: Seat[] = []
  const face = (x: number, z: number): Seat => ({ x, z, rot: Math.atan2(x, z) })

  if (t.shape === 'round') {
    const r = t.w / 2 + CHAIR_GAP
    const n = oneSide ? Math.ceil(cap / 2) : cap
    for (let i = 0; i < n; i++) {
      const a = oneSide ? (n === 1 ? 0 : -Math.PI / 3 + (i * (2 * Math.PI / 3)) / (n - 1)) : (i / n) * Math.PI * 2 + Math.PI / n
      seats.push(face(Math.sin(a) * r, Math.cos(a) * r))
    }
    return seats
  }

  const hw = t.w / 2
  const hd = t.d / 2
  let perLong: number
  let ends = 0
  if (t.shape === 'square') {
    perLong = cap <= 2 ? 1 : 1
    ends = cap <= 2 ? 0 : 1
  } else {
    perLong = cap >= 8 ? 3 : Math.ceil(cap / 2)
    ends = cap >= 8 ? Math.ceil((cap - 6) / 2) : 0
  }
  const sides: number[] = oneSide ? [1] : [1, -1]
  for (const s of sides) {
    const count = oneSide ? Math.min(perLong * 2, Math.ceil(cap / 2)) : perLong
    for (let i = 0; i < count; i++) {
      const x = count === 1 ? 0 : -hw + (t.w / count) * (i + 0.5)
      seats.push(face(x, s * (hd + CHAIR_GAP)))
    }
  }
  if (!oneSide && ends > 0) {
    seats.push(face(hw + CHAIR_GAP, 0))
    seats.push(face(-(hw + CHAIR_GAP), 0))
  }
  return seats
}

// ─── Empreintes & collisions ───────────────────────────────────────────────

interface Rect {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export const localRect = (it: LayoutItem): Rect => {
  if (it.kind === 'table') {
    const hw = it.w / 2
    const hd = it.d / 2
    const seats = seatPositions(it)
    const r: Rect = { minX: -hw, maxX: hw, minZ: -hd, maxZ: hd }
    for (const s of seats) {
      r.minX = Math.min(r.minX, s.x - 0.22)
      r.maxX = Math.max(r.maxX, s.x + 0.22)
      r.minZ = Math.min(r.minZ, s.z - 0.22)
      r.maxZ = Math.max(r.maxZ, s.z + 0.22)
    }
    return r
  }
  return { minX: -it.w / 2, maxX: it.w / 2, minZ: -it.d / 2, maxZ: it.d / 2 }
}

export const worldAABB = (it: LayoutItem, at?: { x: number; z: number; rotation?: number }): Rect => {
  const r = localRect(it)
  const rot = at?.rotation ?? it.rotation
  const cx = at?.x ?? it.x
  const cz = at?.z ?? it.z
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  const pts = [
    [r.minX, r.minZ],
    [r.maxX, r.minZ],
    [r.maxX, r.maxZ],
    [r.minX, r.maxZ],
  ].map(([x, z]) => [cx + x * c + z * s, cz - x * s + z * c])
  return {
    minX: Math.min(...pts.map((p) => p[0])),
    maxX: Math.max(...pts.map((p) => p[0])),
    minZ: Math.min(...pts.map((p) => p[1])),
    maxZ: Math.max(...pts.map((p) => p[1])),
  }
}

const NON_COLLIDING: ItemKind[] = ['zone', 'pendant']
const STRUCTURAL: ItemKind[] = ['wall', 'partition', 'door']

const pairCollides = (a: ItemKind, b: ItemKind) => {
  if (NON_COLLIDING.includes(a) || NON_COLLIDING.includes(b)) return false
  if (STRUCTURAL.includes(a) && STRUCTURAL.includes(b)) return false
  // Un tabouret se glisse sous le comptoir du bar
  if ((a === 'stool' && b === 'bar') || (a === 'bar' && b === 'stool')) return false
  // Machines posées sur le bar
  if ((a === 'coffee' || a === 'display') && b === 'bar') return false
  if ((b === 'coffee' || b === 'display') && a === 'bar') return false
  return true
}

const TOL = 0.04

export const collides = (
  item: LayoutItem,
  others: LayoutItem[],
  at?: { x: number; z: number; rotation?: number },
): LayoutItem | null => {
  if (NON_COLLIDING.includes(item.kind)) return null
  const a = worldAABB(item, at)
  for (const o of others) {
    if (o.id === item.id || !pairCollides(item.kind, o.kind)) continue
    const b = worldAABB(o)
    if (a.minX + TOL < b.maxX && a.maxX - TOL > b.minX && a.minZ + TOL < b.maxZ && a.maxZ - TOL > b.minZ) return o
  }
  return null
}

export const snap = (v: number, step: number) => Math.round(v / step) * step

/** Cherche la position libre la plus proche (spirale). */
export const findFreeSpot = (item: LayoutItem, others: LayoutItem[], x: number, z: number, step = 0.5) => {
  for (let ring = 0; ring < 30; ring++) {
    for (let i = -ring; i <= ring; i++) {
      for (let j = -ring; j <= ring; j++) {
        if (Math.max(Math.abs(i), Math.abs(j)) !== ring) continue
        const p = { x: snap(x + i * step, 0.25), z: snap(z + j * step, 0.25) }
        if (!collides(item, others, p)) return p
      }
    }
  }
  return { x, z }
}

export const zoneAt = (layout: LayoutItem[], x: number, z: number): LayoutItem | null => {
  // la zone la plus petite qui contient le point
  let best: LayoutItem | null = null
  for (const it of layout) {
    if (it.kind !== 'zone') continue
    const r = worldAABB(it)
    if (x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ) {
      if (!best || it.w * it.d < best.w * best.d) best = it
    }
  }
  return best
}

// ─── Catalogue de l'éditeur ────────────────────────────────────────────────

export interface CatalogEntry {
  key: string
  label: string
  make: () => Omit<LayoutItem, 'id' | 'x' | 'z'>
}

export interface CatalogCategory {
  key: string
  label: string
  entries: CatalogEntry[]
}

const table = (shape: TableShape, capacity: number) => () => ({
  kind: 'table' as const,
  rotation: 0,
  shape,
  capacity,
  seating: 'all' as const,
  ...tableDims(shape, capacity),
})

const zone = (zoneType: ZoneType, name: string) => () => ({
  kind: 'zone' as const,
  rotation: 0,
  w: 5,
  d: 4,
  zoneType,
  name,
})

export const CATALOG: CatalogCategory[] = [
  {
    key: 'tables',
    label: 'Tables',
    entries: [
      { key: 'round2', label: 'Ronde · 2', make: table('round', 2) },
      { key: 'round4', label: 'Ronde · 4', make: table('round', 4) },
      { key: 'square2', label: 'Carrée · 2', make: table('square', 2) },
      { key: 'square4', label: 'Carrée · 4', make: table('square', 4) },
      { key: 'rect6', label: 'Rectangulaire · 6', make: table('rect', 6) },
      { key: 'rect8', label: 'Rectangulaire · 8', make: table('rect', 8) },
    ],
  },
  {
    key: 'chairs',
    label: 'Chaises',
    entries: [
      { key: 'chair', label: 'Chaise', make: () => ({ kind: 'chair', rotation: 0, w: 0.45, d: 0.45 }) },
      { key: 'stool', label: 'Tabouret haut', make: () => ({ kind: 'stool', rotation: 0, w: 0.4, d: 0.4 }) },
    ],
  },
  {
    key: 'banquettes',
    label: 'Banquettes',
    entries: [
      { key: 'banq2', label: 'Banquette 2 m', make: () => ({ kind: 'banquette', rotation: 0, w: 2, d: 0.6 }) },
      { key: 'banq4', label: 'Banquette 4 m', make: () => ({ kind: 'banquette', rotation: 0, w: 4, d: 0.6 }) },
    ],
  },
  {
    key: 'walls',
    label: 'Murs',
    entries: [
      { key: 'wall', label: 'Mur 3 m', make: () => ({ kind: 'wall', rotation: 0, w: 3, d: 0.2, h: 2.6 }) },
      { key: 'wallLow', label: 'Muret 3 m', make: () => ({ kind: 'wall', rotation: 0, w: 3, d: 0.2, h: 0.6 }) },
    ],
  },
  {
    key: 'partitions',
    label: 'Cloisons',
    entries: [
      { key: 'partWood', label: 'Claustra bois', make: () => ({ kind: 'partition', rotation: 0, w: 2, d: 0.08, h: 1.4 }) },
      { key: 'partGlass', label: 'Cloison vitrée', make: () => ({ kind: 'partition', rotation: 0, w: 2, d: 0.08, h: 2.2, glass: true }) },
    ],
  },
  {
    key: 'bar',
    label: 'Bar',
    entries: [
      { key: 'bar', label: 'Comptoir', make: () => ({ kind: 'bar', rotation: 0, w: 3, d: 0.7 }) },
      { key: 'shelf', label: 'Étagère', make: () => ({ kind: 'shelf', rotation: 0, w: 2, d: 0.35 }) },
      { key: 'coffee', label: 'Machine à café', make: () => ({ kind: 'coffee', rotation: 0, w: 0.6, d: 0.45 }) },
      { key: 'display', label: 'Présentoir', make: () => ({ kind: 'display', rotation: 0, w: 0.9, d: 0.45 }) },
    ],
  },
  {
    key: 'deco',
    label: 'Décoration',
    entries: [
      { key: 'plant', label: 'Plante', make: () => ({ kind: 'plant', rotation: 0, w: 0.5, d: 0.5 }) },
      { key: 'planter', label: 'Jardinière', make: () => ({ kind: 'planter', rotation: 0, w: 2, d: 0.4 }) },
      { key: 'parasol', label: 'Parasol', make: () => ({ kind: 'parasol', rotation: 0, w: 0.4, d: 0.4 }) },
      { key: 'pendant', label: 'Suspension', make: () => ({ kind: 'pendant', rotation: 0, w: 0.4, d: 0.4 }) },
      { key: 'lectern', label: "Pupitre d'accueil", make: () => ({ kind: 'lectern', rotation: 0, w: 0.6, d: 0.45 }) },
    ],
  },
  {
    key: 'zones',
    label: 'Zones',
    entries: [
      { key: 'zSalle', label: 'Salle', make: zone('salle', 'Salle') },
      { key: 'zTerr', label: 'Terrasse', make: zone('terrasse', 'Terrasse') },
      { key: 'zPriv', label: 'Salon privé', make: zone('prive', 'Salon privé') },
      { key: 'zBar', label: 'Espace bar', make: zone('bar', 'Bar') },
    ],
  },
  {
    key: 'doors',
    label: 'Portes',
    entries: [
      { key: 'door', label: 'Porte 1 m', make: () => ({ kind: 'door', rotation: 0, w: 1, d: 0.2, h: 2.2 }) },
      { key: 'door2', label: 'Porte double', make: () => ({ kind: 'door', rotation: 0, w: 1.8, d: 0.2, h: 2.2 }) },
    ],
  },
]

export const makeItem = (entry: CatalogEntry, x: number, z: number): LayoutItem => ({
  id: uid(entry.key),
  x,
  z,
  ...entry.make(),
})

export const KIND_LABEL: Record<ItemKind, string> = {
  table: 'Table',
  chair: 'Chaise',
  stool: 'Tabouret',
  banquette: 'Banquette',
  wall: 'Mur',
  partition: 'Cloison',
  bar: 'Comptoir',
  shelf: 'Étagère',
  coffee: 'Machine à café',
  display: 'Présentoir',
  kitchen: 'Équipement cuisine',
  plant: 'Plante',
  planter: 'Jardinière',
  parasol: 'Parasol',
  lectern: "Pupitre d'accueil",
  pendant: 'Suspension',
  door: 'Porte',
  zone: 'Zone',
}

export const tableLabel = (n?: number) => `Table ${String(n ?? 0).padStart(2, '0')}`
