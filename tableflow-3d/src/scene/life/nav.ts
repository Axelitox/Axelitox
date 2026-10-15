import type { ItemKind, LayoutItem } from '../../types'
import { worldAABB } from '../../lib/layout'

// ─── Grille de navigation ──────────────────────────────────────────────────
// Construite à partir du plan de salle : chaque meuble bloquant marque ses cellules.
// Les personnages calculent leurs trajets par A* puis les lissent (lignes de vue).

export interface P2 {
  x: number
  z: number
}

/** Objets qu'on peut traverser (au sol ou en hauteur). */
const PASSABLE: ItemKind[] = ['zone', 'pendant', 'door', 'coffee', 'display']

const CELL = 0.2
const RADIUS = 0.16 // demi-largeur d'un personnage
const MARGIN = 1.8 // rue / abords autour du bâtiment

export class NavGrid {
  readonly cell = CELL
  minX = 0
  minZ = 0
  cols = 0
  rows = 0
  blocked: Uint8Array

  constructor(layout: LayoutItem[]) {
    let minX = Infinity
    let maxX = -Infinity
    let minZ = Infinity
    let maxZ = -Infinity
    for (const it of layout) {
      if (it.kind !== 'zone') continue
      const r = worldAABB(it)
      minX = Math.min(minX, r.minX)
      maxX = Math.max(maxX, r.maxX)
      minZ = Math.min(minZ, r.minZ)
      maxZ = Math.max(maxZ, r.maxZ)
    }
    if (!isFinite(minX)) [minX, maxX, minZ, maxZ] = [-10, 10, -7, 10]
    this.minX = minX - MARGIN
    this.minZ = minZ - MARGIN
    this.cols = Math.ceil((maxX - minX + MARGIN * 2) / CELL)
    this.rows = Math.ceil((maxZ - minZ + MARGIN * 2) / CELL)
    this.blocked = new Uint8Array(this.cols * this.rows)

    for (const it of layout) {
      if (PASSABLE.includes(it.kind)) continue
      if (it.kind === 'kitchen' && it.variant === 'hood') continue // hotte : en hauteur
      const r = worldAABB(it)
      this.fill(r.minX - RADIUS, r.maxX + RADIUS, r.minZ - RADIUS, r.maxZ + RADIUS)
    }
    // Les portes ré-ouvrent le passage dans les murs qu'elles traversent.
    for (const it of layout) {
      if (it.kind !== 'door') continue
      const r = worldAABB(it)
      const alongX = r.maxX - r.minX >= r.maxZ - r.minZ
      if (alongX) this.fill(r.minX + 0.12, r.maxX - 0.12, r.minZ - 0.4, r.maxZ + 0.4, 0)
      else this.fill(r.minX - 0.4, r.maxX + 0.4, r.minZ + 0.12, r.maxZ - 0.12, 0)
    }
  }

  private fill(x0: number, x1: number, z0: number, z1: number, v = 1) {
    const c0 = Math.max(0, Math.floor((x0 - this.minX) / CELL))
    const c1 = Math.min(this.cols - 1, Math.floor((x1 - this.minX) / CELL))
    const r0 = Math.max(0, Math.floor((z0 - this.minZ) / CELL))
    const r1 = Math.min(this.rows - 1, Math.floor((z1 - this.minZ) / CELL))
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) this.blocked[r * this.cols + c] = v
  }

  col(x: number) {
    return Math.floor((x - this.minX) / CELL)
  }
  row(z: number) {
    return Math.floor((z - this.minZ) / CELL)
  }
  center(c: number, r: number): P2 {
    return { x: this.minX + (c + 0.5) * CELL, z: this.minZ + (r + 0.5) * CELL }
  }
  inside(c: number, r: number) {
    return c >= 0 && r >= 0 && c < this.cols && r < this.rows
  }
  free(c: number, r: number) {
    return this.inside(c, r) && !this.blocked[r * this.cols + c]
  }
  walkable(p: P2) {
    return this.free(this.col(p.x), this.row(p.z))
  }

  /** Cellule libre la plus proche (recherche en anneaux). */
  nearestFree(p: P2, maxRadius = 14): P2 {
    const c0 = this.col(p.x)
    const r0 = this.row(p.z)
    if (this.free(c0, r0)) return p
    for (let k = 1; k <= maxRadius; k++) {
      let best: P2 | null = null
      let bd = Infinity
      for (let dr = -k; dr <= k; dr++)
        for (let dc = -k; dc <= k; dc++) {
          if (Math.max(Math.abs(dr), Math.abs(dc)) !== k) continue
          if (!this.free(c0 + dc, r0 + dr)) continue
          const q = this.center(c0 + dc, r0 + dr)
          const d = (q.x - p.x) ** 2 + (q.z - p.z) ** 2
          if (d < bd) {
            bd = d
            best = q
          }
        }
      if (best) return best
    }
    return p
  }

  /** Ligne de vue sans obstacle entre deux points. */
  clear(a: P2, b: P2) {
    const d = Math.hypot(b.x - a.x, b.z - a.z)
    const n = Math.ceil(d / (CELL * 0.5))
    for (let i = 1; i < n; i++) {
      const t = i / n
      if (!this.walkable({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t })) return false
    }
    return true
  }

  /** A* 8-connexe + lissage. Renvoie la liste des points à suivre (sans le départ). */
  path(from: P2, to: P2): P2[] {
    const s = this.nearestFree(from)
    const g = this.nearestFree(to)
    if (this.clear(s, g)) return [g]
    const sc = this.col(s.x)
    const sr = this.row(s.z)
    const gc = this.col(g.x)
    const gr = this.row(g.z)
    const N = this.cols * this.rows
    const start = sr * this.cols + sc
    const goal = gr * this.cols + gc
    const gScore = new Float32Array(N).fill(Infinity)
    const came = new Int32Array(N).fill(-1)
    const closed = new Uint8Array(N)
    const heap = new MinHeap()
    gScore[start] = 0
    heap.push(start, 0)
    const h = (i: number) => {
      const dc = Math.abs((i % this.cols) - gc)
      const dr = Math.abs(Math.floor(i / this.cols) - gr)
      return Math.max(dc, dr) + 0.414 * Math.min(dc, dr)
    }
    let found = false
    let guard = 0
    while (heap.size && guard++ < 40000) {
      const cur = heap.pop()
      if (cur === goal) {
        found = true
        break
      }
      if (closed[cur]) continue
      closed[cur] = 1
      const cc = cur % this.cols
      const cr = Math.floor(cur / this.cols)
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue
          const nc = cc + dc
          const nr = cr + dr
          if (!this.free(nc, nr)) continue
          // pas de coupe d'angle à travers un obstacle
          if (dr && dc && (!this.free(cc + dc, cr) || !this.free(cc, cr + dr))) continue
          const ni = nr * this.cols + nc
          const ng = gScore[cur] + (dr && dc ? 1.414 : 1)
          if (ng < gScore[ni]) {
            gScore[ni] = ng
            came[ni] = cur
            heap.push(ni, ng + h(ni))
          }
        }
    }
    if (!found) return [g]
    const cells: P2[] = []
    for (let i = goal; i !== -1 && i !== start; i = came[i]) cells.push(this.center(i % this.cols, Math.floor(i / this.cols)))
    cells.reverse()
    cells[cells.length - 1] = g
    // lissage par lignes de vue
    const out: P2[] = []
    let anchor = s
    let i = 0
    while (i < cells.length) {
      let j = cells.length - 1
      while (j > i && !this.clear(anchor, cells[j])) j--
      out.push(cells[j])
      anchor = cells[j]
      i = j + 1
    }
    return out
  }
}

class MinHeap {
  private ids: number[] = []
  private ks: number[] = []
  get size() {
    return this.ids.length
  }
  push(id: number, k: number) {
    const a = this.ids
    const b = this.ks
    a.push(id)
    b.push(k)
    let i = a.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (b[p] <= b[i]) break
      ;[a[p], a[i]] = [a[i], a[p]]
      ;[b[p], b[i]] = [b[i], b[p]]
      i = p
    }
  }
  pop() {
    const a = this.ids
    const b = this.ks
    const top = a[0]
    const lastId = a.pop()!
    const lastK = b.pop()!
    if (a.length) {
      a[0] = lastId
      b[0] = lastK
      let i = 0
      for (;;) {
        const l = i * 2 + 1
        const r = l + 1
        let m = i
        if (l < a.length && b[l] < b[m]) m = l
        if (r < a.length && b[r] < b[m]) m = r
        if (m === i) break
        ;[a[m], a[i]] = [a[i], a[m]]
        ;[b[m], b[i]] = [b[i], b[m]]
        i = m
      }
    }
    return top
  }
}
