import type { LayoutItem, TableStatus } from '../../types'
import { localRect, seatPositions, tableLabel } from '../../lib/layout'
import { NavGrid, type P2 } from './nav'

// ─── Simulation légère du service ──────────────────────────────────────────
// Les agents suivent des "missions" = suites d'étapes simples (aller, attendre, s'asseoir…).
// Tout est piloté par l'état réel du prototype (statuts, couverts, serveurs affectés) via sync().

export type Role = 'waiter' | 'cook' | 'guest'
export type Pose = 'stand' | 'walk' | 'sit' | 'work'
export type Density = 'calm' | 'normal' | 'lively'

type Step =
  | { k: 'go'; to: P2; path?: P2[] }
  | { k: 'wait'; t: number; face?: number; pose?: Pose }
  | { k: 'sit'; x: number; z: number; yaw: number; t?: number; fromX?: number; fromZ?: number }
  | { k: 'carry'; on: boolean }
  | { k: 'take' }
  | { k: 'dish' }
  | { k: 'despawn' }
  | { k: 'release' }

export interface Agent {
  id: string
  role: Role
  x: number
  z: number
  yaw: number
  pose: Pose
  /** phase de l'animation de marche / travail */
  phase: number
  /** 0 → 1 apparition, 1 → 0 disparition */
  appear: number
  speed: number
  carry: boolean
  steps: Step[]
  dead: boolean
  leaving: boolean
  seed: number
  // contexte
  tableId?: string
  seatIdx?: number
  staffId?: string
  color?: string
  mission?: { text: string; tableId: string | null }
  busyStation?: string
}

export interface TableSnap {
  id: string
  item: LayoutItem
  status: TableStatus
  guests: number
  seatedAt: number | null
  waiterId: string | null
}

export interface StaffSnap {
  id: string
  name: string
  color: string
}

interface Task {
  type: 'greet' | 'clear' | 'prepare'
  tableId: string
  at: number
}

const DENSITY = {
  calm: { waiters: 2, cooks: 1, pause: 1.35 },
  normal: { waiters: 3, cooks: 2, pause: 1 },
  lively: { waiters: 4, cooks: 3, pause: 0.8 },
}

// Générateur pseudo-aléatoire déterministe (mulberry32)
const rng = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export const hash = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

const yawTo = (from: P2, to: P2) => Math.atan2(to.x - from.x, to.z - from.z)

const toWorld = (it: LayoutItem, lx: number, lz: number): P2 => {
  const c = Math.cos(it.rotation)
  const s = Math.sin(it.rotation)
  return { x: it.x + lx * c + lz * s, z: it.z - lx * s + lz * c }
}

interface Seat {
  x: number
  z: number
  yaw: number
  /** point d'approche (derrière la chaise) */
  ax: number
  az: number
}

/** Places assises d'une table (chaises + côté banquette si adossée). */
export const guestSeats = (t: LayoutItem): Seat[] => {
  const raw = seatPositions(t).map((s) => ({ x: s.x, z: s.z }))
  if (t.seating === 'oneSide') {
    const hd = t.d / 2
    for (const s of [...raw]) raw.push({ x: s.x, z: -(hd + 0.33) })
  }
  return raw.map((s) => {
    const len = Math.hypot(s.x, s.z) || 1
    const w = toWorld(t, s.x, s.z)
    const a = toWorld(t, s.x + (s.x / len) * 0.45, s.z + (s.z / len) * 0.45)
    return { x: w.x, z: w.z, yaw: t.rotation + Math.atan2(-s.x, -s.z), ax: a.x, az: a.z }
  })
}

/** Répartit n convives sur les places de façon équilibrée. */
const pickSeats = (count: number, n: number) => {
  if (n >= count) return Array.from({ length: count }, (_, i) => i)
  const out: number[] = []
  for (let i = 0; i < n; i++) out.push(Math.floor((i * count) / n + 0.0001))
  return out
}

export class LifeSim {
  nav: NavGrid
  agents: Agent[] = []
  version = 0
  reduced = false
  enabled = true
  density: Density = 'normal'
  dishes = 0
  onMission?: (staffId: string, m: { text: string; tableId: string | null } | null) => void

  private tables = new Map<string, TableSnap>()
  private staff: StaffSnap[] = []
  private tasks: Task[] = []
  private rand = rng(42)
  private t = 0
  private uid = 0
  private initialized = false

  // points d'intérêt
  street: P2
  entrance: P2
  passSalle: P2
  passKitchen: P2
  bar: P2
  stations: { id: string; p: P2; face: number }[] = []

  constructor(layout: LayoutItem[]) {
    this.nav = new NavGrid(layout)
    const door = layout.find((d) => d.kind === 'door' && d.name === 'Entrée principale') ?? layout.find((d) => d.kind === 'door')
    const center = { x: 0, z: 0 }
    const zones = layout.filter((z) => z.kind === 'zone' && z.zoneType !== 'terrasse')
    if (zones.length) {
      center.x = zones.reduce((a, z) => a + z.x, 0) / zones.length
      center.z = zones.reduce((a, z) => a + z.z, 0) / zones.length
    }
    if (door) {
      // côté extérieur = côté opposé au centre du bâtiment
      const n = toWorld(door, 0, 1)
      let nx = n.x - door.x
      let nz = n.z - door.z
      if ((center.x - door.x) * nx + (center.z - door.z) * nz > 0) {
        nx = -nx
        nz = -nz
      }
      this.entrance = this.nav.nearestFree({ x: door.x - nx * 0.9, z: door.z - nz * 0.9 })
      // seuil extérieur : les convives y apparaissent / disparaissent en fondu
      this.street = this.nav.nearestFree({ x: door.x + nx * 1.4, z: door.z + nz * 1.4 })
    } else {
      this.entrance = this.nav.nearestFree({ x: 0, z: 4 })
      this.street = this.nav.nearestFree({ x: 0, z: 6.5 })
    }
    const pass = layout.find((k) => k.kind === 'kitchen' && k.variant === 'pass')
    if (pass) {
      const a = toWorld(pass, 0, pass.d / 2 + 0.45)
      const b = toWorld(pass, 0, -(pass.d / 2 + 0.45))
      // côté salle = le plus proche du centre de la salle
      const salleFirst = Math.hypot(a.x - center.x, a.z - center.z + 3) < Math.hypot(b.x - center.x, b.z - center.z + 3)
      this.passSalle = this.nav.nearestFree(salleFirst ? a : b)
      this.passKitchen = this.nav.nearestFree(salleFirst ? b : a)
    } else {
      this.passSalle = this.entrance
      this.passKitchen = this.entrance
    }
    const bar = layout.find((b) => b.kind === 'bar')
    this.bar = bar ? this.nav.nearestFree(toWorld(bar, bar.w / 2 + 0.45, 0.3)) : this.entrance
    for (const k of layout) {
      if (k.kind !== 'kitchen' || k.variant === 'hood' || k.variant === 'pass') continue
      const p = this.nav.nearestFree(toWorld(k, 0, k.d / 2 + 0.38))
      this.stations.push({ id: k.id, p, face: yawTo(p, k) })
    }
  }

  // ─── Synchronisation avec l'état réel ────────────────────────────────
  sync(tables: TableSnap[], staff: StaffSnap[]) {
    const first = !this.initialized
    this.initialized = true
    this.staff = staff
    const seen = new Set<string>()
    for (const snap of tables) {
      seen.add(snap.id)
      const prev = this.tables.get(snap.id)
      this.tables.set(snap.id, snap)
      const wasOcc = prev?.status === 'occupied'
      const isOcc = snap.status === 'occupied'
      const instant = first || this.reduced || !this.enabled
      if (isOcc && (!wasOcc || prev?.seatedAt !== snap.seatedAt)) {
        if (wasOcc) this.guestsLeave(snap.id, true)
        this.seatGuests(snap, snap.guests, instant)
        if (!instant) this.addTask('greet', snap.id)
      } else if (isOcc && wasOcc && prev && prev.guests !== snap.guests) {
        const present = this.guestsAt(snap.id)
        if (snap.guests > present.length) this.seatGuests(snap, snap.guests, instant, present)
        else present.slice(Math.max(0, this.cap(snap, snap.guests))).forEach((g) => this.leave(g, instant))
      } else if (!isOcc && wasOcc) {
        this.guestsLeave(snap.id, instant)
        if (snap.status === 'cleaning' && !instant) this.addTask('clear', snap.id)
      }
      if (snap.status === 'reserved' && prev && prev.status !== 'reserved' && !instant) this.addTask('prepare', snap.id)
    }
    for (const id of [...this.tables.keys()]) if (!seen.has(id)) {
      this.tables.delete(id)
      this.guestsLeave(id, true)
    }
    this.syncCrew()
  }

  setOptions(o: { reduced: boolean; enabled: boolean; density: Density }) {
    const changed = o.density !== this.density || o.reduced !== this.reduced || o.enabled !== this.enabled
    const reEnabled = o.enabled && !this.enabled
    this.reduced = o.reduced
    this.enabled = o.enabled
    this.density = o.density
    if (!changed || !this.initialized) return
    if (reEnabled) {
      // les personnages reviennent : convives directement assis
      for (const t of this.tables.values()) if (t.status === 'occupied' && !this.guestsAt(t.id).length) this.seatGuests(t, t.guests, true)
    }
    if (this.reduced) {
      // pas de déplacements : chacun rejoint directement sa position de repos
      for (const a of this.agents) {
        if (a.role !== 'guest') continue
        if (a.leaving) a.dead = true
        else this.finishSeat(a)
      }
    }
    this.syncCrew()
  }

  private bump() {
    this.version++
  }

  private cap(t: TableSnap, n: number) {
    return Math.min(n, guestSeats(t.item).length)
  }

  private guestsAt(tableId: string) {
    return this.agents.filter((a) => a.role === 'guest' && a.tableId === tableId && !a.leaving && !a.dead).sort((a, b) => (a.seatIdx ?? 0) - (b.seatIdx ?? 0))
  }

  private seatGuests(t: TableSnap, n: number, instant: boolean, keep: Agent[] = []) {
    const seats = guestSeats(t.item)
    const count = this.cap(t, n)
    const wanted = pickSeats(seats.length, count)
    const taken = new Set(keep.map((g) => g.seatIdx))
    const free = wanted.filter((i) => !taken.has(i))
    const extra = seats.map((_, i) => i).filter((i) => !taken.has(i) && !free.includes(i))
    const need = count - keep.length
    const idxs = [...free, ...extra].slice(0, Math.max(0, need))
    idxs.forEach((si, k) => {
      const s = seats[si]
      const a = this.spawn('guest', instant ? { x: s.x, z: s.z } : this.street, `${t.id}:${si}:${t.seatedAt ?? 0}`)
      a.tableId = t.id
      a.seatIdx = si
      if (instant) {
        a.appear = 1
        a.x = s.x
        a.z = s.z
        a.yaw = s.yaw
        a.pose = 'sit'
      } else {
        // petit décalage pour qu'ils n'arrivent pas tous ensemble
        a.steps.push({ k: 'wait', t: k * 0.55 })
        a.steps.push({ k: 'go', to: this.entrance })
        a.steps.push({ k: 'go', to: this.nav.nearestFree({ x: s.ax, z: s.az }) })
        a.steps.push({ k: 'sit', x: s.x, z: s.z, yaw: s.yaw })
      }
    })
    this.bump()
  }

  private guestsLeave(tableId: string, instant: boolean) {
    for (const g of this.guestsAt(tableId)) this.leave(g, instant)
  }

  private leave(g: Agent, instant: boolean) {
    g.leaving = true
    if (instant) {
      g.dead = true
      this.bump()
      return
    }
    g.steps = [{ k: 'wait', t: 0.2 + this.rand() * 0.8, pose: 'stand' }, { k: 'go', to: this.entrance }, { k: 'go', to: this.street }, { k: 'despawn' }]
  }

  private finishSeat(a: Agent) {
    const t = a.tableId ? this.tables.get(a.tableId) : null
    if (!t || a.seatIdx === undefined) return
    const s = guestSeats(t.item)[a.seatIdx]
    if (!s) return
    a.x = s.x
    a.z = s.z
    a.yaw = s.yaw
    a.pose = 'sit'
    a.appear = 1
    a.steps = []
  }

  private addTask(type: Task['type'], tableId: string) {
    if (this.tasks.some((t) => t.type === type && t.tableId === tableId)) return
    this.tasks.push({ type, tableId, at: this.t })
  }

  /** Ajuste le nombre de serveurs et de cuisiniers selon l'équipe et la densité. */
  private syncCrew() {
    const d = DENSITY[this.density]
    const want = this.enabled ? this.staff.slice(0, d.waiters) : []
    const wantIds = new Set(want.map((s) => s.id))
    for (const a of this.agents) {
      if (a.role === 'waiter' && !wantIds.has(a.staffId!)) a.dead = true
      if (a.role === 'cook' && (!this.enabled || Number(a.id.split('_')[1]) >= d.cooks)) a.dead = true
      if (a.role === 'guest' && !this.enabled) a.dead = true
    }
    for (const s of want) {
      const a = this.agents.find((x) => x.role === 'waiter' && x.staffId === s.id && !x.dead)
      if (a) {
        a.color = s.color
        continue
      }
      const w = this.spawn('waiter', this.homeOf(s.id), `w_${s.id}`)
      w.id = `w_${s.id}`
      w.staffId = s.id
      w.color = s.color
      w.appear = 1
      w.speed = 1.15
      w.steps.push({ k: 'wait', t: 0.5 + this.rand() * 2 })
    }
    if (this.enabled)
      for (let i = 0; i < d.cooks; i++) {
        if (this.agents.some((x) => x.id === `cook_${i}` && !x.dead)) continue
        const st = this.stations[i % Math.max(1, this.stations.length)]
        const c = this.spawn('cook', st ? st.p : this.passKitchen, `cook_${i}`)
        c.id = `cook_${i}`
        c.appear = 1
        c.speed = 0.85
        if (st) c.yaw = st.face
      }
    if (!this.enabled) this.tasks = []
    if (this.reduced) for (const a of this.agents) if (a.role !== 'guest') this.restPose(a)
    this.bump()
  }

  private homeOf(staffId: string): P2 {
    const mine = [...this.tables.values()].filter((t) => t.waiterId === staffId)
    if (!mine.length) return this.nav.nearestFree({ x: this.entrance.x + 1.2, z: this.entrance.z - 0.6 })
    const cx = mine.reduce((a, t) => a + t.item.x, 0) / mine.length
    const cz = mine.reduce((a, t) => a + t.item.z, 0) / mine.length
    return this.nav.nearestFree({ x: cx, z: cz })
  }

  /** Position fixe (mode mouvements réduits). */
  private restPose(a: Agent) {
    a.steps = []
    a.carry = false
    a.pose = 'stand'
    a.appear = 1
    if (a.role === 'waiter' && a.staffId) {
      const p = this.homeOf(a.staffId)
      a.x = p.x
      a.z = p.z
      this.setMission(a, null)
    } else if (a.role === 'cook') {
      const i = Number(a.id.split('_')[1])
      const st = this.stations[i % Math.max(1, this.stations.length)]
      if (st) {
        a.x = st.p.x
        a.z = st.p.z
        a.yaw = st.face
      }
    }
  }

  private spawn(role: Role, at: P2, seedKey: string): Agent {
    const a: Agent = {
      id: `${role}-${++this.uid}`,
      role,
      x: at.x,
      z: at.z,
      yaw: Math.PI,
      pose: 'stand',
      phase: this.rand() * 6,
      appear: 0,
      speed: 0.95,
      carry: false,
      steps: [],
      dead: false,
      leaving: false,
      seed: hash(seedKey),
    }
    this.agents.push(a)
    return a
  }

  private setMission(a: Agent, m: { text: string; tableId: string | null } | null) {
    a.mission = m ?? undefined
    if (a.staffId) this.onMission?.(a.staffId, m)
  }

  /** Point d'approche libre au bord d'une table, le plus proche de l'agent. */
  private tableApproach(t: LayoutItem, from: P2) {
    const r = localRect(t)
    const pad = 0.38
    const cands: P2[] = []
    const xs = [r.minX - pad, (r.minX + r.maxX) / 2, r.maxX + pad]
    const zs = [r.minZ - pad, (r.minZ + r.maxZ) / 2, r.maxZ + pad]
    for (const x of xs) for (const z of zs) if (!(x === xs[1] && z === zs[1])) cands.push(toWorld(t, x, z))
    let best: P2 | null = null
    let bd = Infinity
    for (const c of cands) {
      if (!this.nav.walkable(c)) continue
      const d = Math.hypot(c.x - from.x, c.z - from.z)
      if (d < bd) {
        bd = d
        best = c
      }
    }
    return best ?? this.nav.nearestFree(cands[0])
  }

  // ─── Décisions ───────────────────────────────────────────────────────
  private planWaiter(a: Agent) {
    const pause = DENSITY[this.density].pause
    const all = [...this.tables.values()]
    const label = (t: TableSnap) => tableLabel(t.item.number)
    // 1. tâches en attente (priorité au serveur affecté)
    const taskIdx = this.tasks.findIndex((k) => {
      const t = this.tables.get(k.tableId)
      if (!t) return false
      return t.waiterId === a.staffId || !this.waiterAgent(t.waiterId) || this.t - k.at > 4
    })
    if (taskIdx >= 0) {
      const task = this.tasks.splice(taskIdx, 1)[0]
      const t = this.tables.get(task.tableId)!
      const p = this.tableApproach(t.item, a)
      const face = yawTo(p, t.item)
      if (task.type === 'greet') {
        this.setMission(a, { text: `Accueille ${label(t)}`, tableId: t.id })
        a.steps.push({ k: 'go', to: this.entrance }, { k: 'wait', t: 1.6, face: yawTo(this.entrance, this.street) }, { k: 'go', to: p }, { k: 'wait', t: 4 * pause, face })
      } else if (task.type === 'clear') {
        this.setMission(a, { text: `Débarrasse ${label(t)}`, tableId: t.id })
        a.steps.push({ k: 'go', to: p }, { k: 'wait', t: 3 * pause, face }, { k: 'carry', on: true }, { k: 'go', to: this.passSalle }, { k: 'wait', t: 1, face: yawTo(this.passSalle, this.passKitchen) }, { k: 'carry', on: false })
      } else {
        this.setMission(a, { text: `Dresse ${label(t)}`, tableId: t.id })
        a.steps.push({ k: 'go', to: p }, { k: 'wait', t: 2.5 * pause, face })
      }
      a.steps.push({ k: 'release' })
      return
    }
    const occupied = all.filter((t) => t.status === 'occupied')
    const mine = occupied.filter((t) => t.waiterId === a.staffId)
    const pool = mine.length ? mine : occupied.filter((t) => !this.waiterAgent(t.waiterId))
    const pick = <T,>(arr: T[]) => arr[Math.floor(this.rand() * arr.length)]
    const roll = this.rand()
    // 2. un plat est prêt à la passe
    if (this.dishes > 0 && pool.length && roll < 0.75) {
      this.dishes--
      const t = pick(pool)
      const p = this.tableApproach(t.item, this.passSalle)
      this.setMission(a, { text: `Apporte une commande — ${label(t)}`, tableId: t.id })
      a.steps.push(
        { k: 'go', to: this.passSalle },
        { k: 'wait', t: 1.2, face: yawTo(this.passSalle, this.passKitchen) },
        { k: 'take' },
        { k: 'go', to: p },
        { k: 'wait', t: 2.4 * pause, face: yawTo(p, t.item) },
        { k: 'carry', on: false },
        { k: 'release' },
      )
      return
    }
    // 3. tournée de salle, bar ou attente
    if (pool.length && roll < 0.6) {
      const t = pick(pool)
      const p = this.tableApproach(t.item, a)
      this.setMission(a, { text: `Passe voir ${label(t)}`, tableId: t.id })
      a.steps.push({ k: 'go', to: p }, { k: 'wait', t: (2.5 + this.rand() * 2) * pause, face: yawTo(p, t.item) }, { k: 'release' })
    } else if (roll < 0.75) {
      this.setMission(a, { text: 'Au bar', tableId: null })
      a.steps.push({ k: 'go', to: this.bar }, { k: 'wait', t: 2.5 * pause, face: -Math.PI / 2 }, { k: 'release' })
    } else {
      const home = this.homeOf(a.staffId!)
      const p = this.nav.nearestFree({ x: home.x + (this.rand() - 0.5) * 2, z: home.z + (this.rand() - 0.5) * 2 })
      this.setMission(a, { text: 'Surveille sa zone', tableId: null })
      a.steps.push({ k: 'go', to: p }, { k: 'wait', t: (3 + this.rand() * 3) * pause }, { k: 'release' })
    }
  }

  private waiterAgent(staffId: string | null) {
    return staffId ? this.agents.find((x) => x.role === 'waiter' && x.staffId === staffId && !x.dead) : undefined
  }

  private planCook(a: Agent) {
    const pause = DENSITY[this.density].pause
    const busy = new Set(this.agents.filter((x) => x !== a && x.role === 'cook').map((x) => x.busyStation))
    const free = this.stations.filter((s) => !busy.has(s.id))
    const st = free.length ? free[Math.floor(this.rand() * free.length)] : null
    const anyOccupied = [...this.tables.values()].some((t) => t.status === 'occupied')
    if (st) {
      a.busyStation = st.id
      a.steps.push({ k: 'go', to: st.p }, { k: 'wait', t: (4 + this.rand() * 3) * pause, face: st.face, pose: 'work' })
    }
    if (anyOccupied && this.dishes < 3 && this.rand() < 0.55) {
      a.steps.push(
        { k: 'carry', on: true },
        { k: 'go', to: this.passKitchen },
        { k: 'wait', t: 1.2, face: yawTo(this.passKitchen, this.passSalle) },
        { k: 'dish' },
        { k: 'carry', on: false },
      )
    }
    if (!a.steps.length) a.steps.push({ k: 'wait', t: 2 })
  }

  // ─── Boucle ──────────────────────────────────────────────────────────
  update(dt: number) {
    dt = Math.min(dt, 0.2)
    this.t += dt
    let removed = false
    for (const a of this.agents) {
      if (a.dead) continue
      // apparition douce
      if (!a.leaving || a.steps[0]?.k !== 'despawn') a.appear = Math.min(1, a.appear + dt * 2.5)
      if (!a.steps.length) {
        if (this.reduced) continue
        if (a.role === 'waiter') this.planWaiter(a)
        else if (a.role === 'cook') this.planCook(a)
        else continue
      }
      this.step(a, dt)
    }
    if (this.agents.some((a) => a.dead)) {
      this.agents = this.agents.filter((a) => !a.dead)
      removed = true
    }
    if (removed) this.bump()
  }

  private step(a: Agent, dt: number) {
    const s = a.steps[0]
    if (!s) return
    switch (s.k) {
      case 'wait': {
        if (s.face !== undefined) a.yaw = lerpAngle(a.yaw, s.face, Math.min(1, dt * 6))
        a.pose = s.pose ?? (a.pose === 'sit' ? 'sit' : 'stand')
        if (a.pose === 'work') a.phase += dt * 5
        s.t -= dt
        if (s.t <= 0) a.steps.shift()
        return
      }
      case 'go': {
        if (this.reduced) {
          a.x = s.to.x
          a.z = s.to.z
          a.steps.shift()
          return
        }
        if (!s.path) s.path = this.nav.path(a, s.to)
        const target = s.path[0]
        if (!target) {
          a.steps.shift()
          a.pose = 'stand'
          return
        }
        const dx = target.x - a.x
        const dz = target.z - a.z
        const d = Math.hypot(dx, dz)
        const v = a.speed * dt
        a.pose = 'walk'
        a.phase += dt * a.speed * 6.5
        if (d > 0.001) a.yaw = lerpAngle(a.yaw, Math.atan2(dx, dz), Math.min(1, dt * 8))
        if (d <= v) {
          a.x = target.x
          a.z = target.z
          s.path.shift()
          if (!s.path.length) {
            a.steps.shift()
            a.pose = 'stand'
          }
        } else {
          a.x += (dx / d) * v
          a.z += (dz / d) * v
        }
        return
      }
      case 'sit': {
        if (s.t === undefined) {
          s.t = 0
          s.fromX = a.x
          s.fromZ = a.z
        }
        s.t = Math.min(1, s.t + dt * 1.8)
        const e = s.t * s.t * (3 - 2 * s.t)
        a.x = s.fromX! + (s.x - s.fromX!) * e
        a.z = s.fromZ! + (s.z - s.fromZ!) * e
        a.yaw = lerpAngle(a.yaw, s.yaw, Math.min(1, dt * 8))
        a.pose = s.t > 0.5 ? 'sit' : 'stand'
        if (s.t >= 1) {
          a.yaw = s.yaw
          a.pose = 'sit'
          a.steps.shift()
        }
        return
      }
      case 'carry':
        a.carry = s.on
        a.steps.shift()
        return
      case 'take':
        a.carry = true
        a.steps.shift()
        return
      case 'dish':
        this.dishes = Math.min(3, this.dishes + 1)
        a.steps.shift()
        return
      case 'release':
        this.setMission(a, null)
        a.steps.shift()
        return
      case 'despawn':
        a.pose = 'stand'
        a.appear -= dt * 2.5
        if (a.appear <= 0) a.dead = true
        return
    }
  }
}

const lerpAngle = (a: number, b: number, t: number) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI
  if (d < -Math.PI) d += Math.PI * 2
  return a + d * t
}
