import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  Customer,
  LayoutItem,
  Reservation,
  ServiceEvent,
  Session,
  Settings,
  Staff,
  TableService,
  TableStatus,
  View,
} from '../types'
import { demoCustomers, demoLayout, demoService, demoStaff } from '../data/demo'
import { uid, formatDuration, minutesBetween, prefersReducedMotion } from '../lib/utils'
import { tableLabel } from '../lib/layout'

export type CameraCmd =
  | { type: 'iso' | 'top' | 'reset'; nonce: number }
  | { type: 'focus'; id: string; nonce: number }

interface EditorState {
  draft: LayoutItem[] | null
  past: LayoutItem[][]
  future: LayoutItem[][]
  selectedId: string | null
  grid: boolean
  dirty: boolean
}

interface Data {
  layout: LayoutItem[]
  tables: Record<string, TableService>
  reservations: Reservation[]
  customers: Customer[]
  staff: Staff[]
  sessions: Session[]
  events: ServiceEvent[]
  settings: Settings
  seededAt: number
}

interface UI {
  view: View
  selectedTableId: string | null
  hoveredTableId: string | null
  selectedReservationId: string | null
  selectedCustomerId: string | null
  reservationDraft: Partial<Reservation> | null
  cameraCmd: CameraCmd | null
  editor: EditorState
  toast: { id: number; text: string; tone: 'ok' | 'warn' } | null
  statusFilter: TableStatus | null
}

interface Actions {
  setView: (v: View) => void
  selectTable: (id: string | null, focus?: boolean) => void
  hoverTable: (id: string | null) => void
  selectReservation: (id: string | null) => void
  selectCustomer: (id: string | null) => void
  openReservationForm: (draft: Partial<Reservation>) => void
  closeReservationForm: () => void
  camera: (type: 'iso' | 'top' | 'reset') => void
  focusTable: (id: string) => void
  notify: (text: string, tone?: 'ok' | 'warn') => void
  setStatusFilter: (s: TableStatus | null) => void

  // Service
  seatTable: (tableId: string, opts: { guests: number; customerId?: string | null; reservationId?: string | null }) => void
  releaseTable: (tableId: string) => void
  markClean: (tableId: string) => void
  setTableStatus: (tableId: string, status: TableService['status']) => void
  setGuests: (tableId: string, guests: number) => void
  assignWaiter: (tableId: string, waiterId: string | null) => void
  linkCustomer: (tableId: string, customerId: string | null) => void

  // Réservations
  saveReservation: (r: Omit<Reservation, 'id' | 'createdAt'> & { id?: string }) => string
  setReservationStatus: (id: string, status: Reservation['status']) => void
  checkIn: (id: string) => boolean

  // Clients
  saveCustomer: (c: Partial<Customer> & { name: string }) => string
  deleteCustomer: (id: string) => void

  // Équipe
  saveStaff: (s: Partial<Staff> & { name: string }) => void
  removeStaff: (id: string) => void

  updateSettings: (p: Partial<Settings>) => void
  resetDemo: () => void

  // Éditeur
  editorStart: () => void
  editorSelect: (id: string | null) => void
  editorCheckpoint: () => void
  editorPatch: (id: string, patch: Partial<LayoutItem>) => void
  editorAdd: (item: LayoutItem) => void
  editorRemove: (id: string) => void
  editorUndo: () => void
  editorRedo: () => void
  editorToggleGrid: () => void
  editorSave: () => { ok: boolean; error?: string }
  editorDiscard: () => void
}

export type Store = Data & UI & Actions

const MAX_HISTORY = 80

const freshData = (): Data => {
  const now = Date.now()
  const svc = demoService(now)
  return {
    layout: demoLayout(),
    tables: svc.tables,
    reservations: svc.reservations,
    customers: demoCustomers(now),
    staff: demoStaff(),
    sessions: svc.sessions,
    events: svc.events,
    seededAt: now,
    settings: {
      restaurantName: 'Maison Rouge',
      reservationWindowMin: 60,
      defaultDuration: 90,
      cleanAfterRelease: true,
      role: 'manager',
      reducedMotion: prefersReducedMotion(),
      quality: 'high',
      serviceOverride: null,
      showBadges: true,
    },
  }
}

const emptyEditor: EditorState = { draft: null, past: [], future: [], selectedId: null, grid: true, dirty: false }

const blankService = (): TableService => ({
  status: 'available',
  guests: 0,
  seatedAt: null,
  waiterId: null,
  customerId: null,
  reservationId: null,
  changedAt: Date.now(),
})

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      const log = (type: ServiceEvent['type'], text: string, tableId?: string) =>
        set((s) => ({ events: [{ id: uid('ev'), at: Date.now(), type, text, tableId }, ...s.events].slice(0, 200) }))

      const tName = (id: string) => tableLabel(get().layout.find((t) => t.id === id)?.number)

      const patchTable = (id: string, patch: Partial<TableService>) =>
        set((s) => ({ tables: { ...s.tables, [id]: { ...(s.tables[id] ?? blankService()), ...patch, changedAt: Date.now() } } }))

      /** Clôt l'occupation en cours : historique + réservation terminée. */
      const closeSession = (tableId: string) => {
        const s = get()
        const t = s.tables[tableId]
        if (!t || t.status !== 'occupied' || !t.seatedAt) return null
        const end = Date.now()
        const session: Session = {
          id: uid('ses'),
          tableId,
          tableNumber: s.layout.find((l) => l.id === tableId)?.number ?? 0,
          start: t.seatedAt,
          end,
          guests: t.guests,
          waiterId: t.waiterId,
          customerId: t.customerId,
        }
        set((st) => ({
          sessions: [...st.sessions, session],
          reservations: st.reservations.map((r) => (r.id === t.reservationId ? { ...r, status: 'completed' } : r)),
        }))
        return session
      }

      return {
        ...freshData(),
        view: 'overview',
        selectedTableId: null,
        hoveredTableId: null,
        selectedReservationId: null,
        selectedCustomerId: null,
        reservationDraft: null,
        cameraCmd: null,
        editor: emptyEditor,
        toast: null,
        statusFilter: null,

        setView: (v) => {
          // en quittant l'éditeur, le brouillon non enregistré est conservé jusqu'au retour
          if (v === 'editor' && !get().editor.draft) get().editorStart()
          set({ view: v, hoveredTableId: null, selectedCustomerId: null })
        },
        selectTable: (id, focus = true) => {
          set({ selectedTableId: id })
          if (id && focus) get().focusTable(id)
        },
        hoverTable: (id) => {
          if (get().hoveredTableId !== id) set({ hoveredTableId: id })
        },
        selectReservation: (id) => set({ selectedReservationId: id }),
        selectCustomer: (id) => set({ selectedCustomerId: id }),
        openReservationForm: (draft) => set({ reservationDraft: draft }),
        closeReservationForm: () => set({ reservationDraft: null }),
        camera: (type) => set({ cameraCmd: { type, nonce: Date.now() } }),
        focusTable: (id) => set({ cameraCmd: { type: 'focus', id, nonce: Date.now() } }),
        notify: (text, tone = 'ok') => set({ toast: { id: Date.now(), text, tone } }),
        setStatusFilter: (statusFilter) => set({ statusFilter }),

        seatTable: (tableId, { guests, customerId = null, reservationId = null }) => {
          const prev = get().tables[tableId]
          if (prev?.status === 'occupied') closeSession(tableId)
          patchTable(tableId, {
            status: 'occupied',
            guests: Math.max(1, guests),
            seatedAt: Date.now(),
            customerId,
            reservationId,
          })
          if (reservationId) {
            set((s) => ({ reservations: s.reservations.map((r) => (r.id === reservationId ? { ...r, status: 'seated', tableId } : r)) }))
          }
          const cust = customerId ? get().customers.find((c) => c.id === customerId)?.name : null
          log('seat', `${cust ? `${cust} installé·e en ${tName(tableId).toLowerCase()}` : `${tName(tableId)} installée`} — ${guests} couvert${guests > 1 ? 's' : ''}`, tableId)
        },

        releaseTable: (tableId) => {
          const session = closeSession(tableId)
          const clean = get().settings.cleanAfterRelease
          patchTable(tableId, {
            status: clean ? 'cleaning' : 'available',
            guests: 0,
            seatedAt: null,
            customerId: null,
            reservationId: null,
          })
          log(
            'release',
            `${tName(tableId)} libérée${session ? ` — ${session.guests} couverts, ${formatDuration(minutesBetween(session.start, session.end))}` : ''}`,
            tableId,
          )
        },

        markClean: (tableId) => {
          patchTable(tableId, { status: 'available' })
          log('clean', `${tName(tableId)} nettoyée et disponible`, tableId)
        },

        setTableStatus: (tableId, status) => {
          const cur = get().tables[tableId]
          if (cur?.status === status) return
          if (status === 'occupied') {
            const cap = get().layout.find((t) => t.id === tableId)?.capacity ?? 2
            get().seatTable(tableId, { guests: Math.min(cap, 2) })
            return
          }
          if (cur?.status === 'occupied') closeSession(tableId)
          patchTable(tableId, {
            status,
            ...(cur?.status === 'occupied' ? { guests: 0, seatedAt: null, customerId: null, reservationId: null } : {}),
          })
          const label = { available: 'disponible', reserved: 'réservée (blocage manuel)', cleaning: 'à nettoyer', blocked: 'indisponible', occupied: 'occupée' }[status]
          log('status', `${tName(tableId)} passée en ${label}`, tableId)
        },

        setGuests: (tableId, guests) => patchTable(tableId, { guests: Math.max(1, guests) }),

        assignWaiter: (tableId, waiterId) => {
          patchTable(tableId, { waiterId })
          const name = get().staff.find((s) => s.id === waiterId)?.name
          log('waiter', `${tName(tableId)} → ${name ?? 'aucun serveur'}`, tableId)
        },

        linkCustomer: (tableId, customerId) => patchTable(tableId, { customerId }),

        saveReservation: (r) => {
          const id = r.id ?? uid('res')
          const exists = get().reservations.some((x) => x.id === id)
          set((s) => ({
            reservations: exists
              ? s.reservations.map((x) => (x.id === id ? { ...x, ...r, id } : x))
              : [...s.reservations, { ...r, id, createdAt: Date.now() }],
          }))
          const cust = get().customers.find((c) => c.id === r.customerId)?.name ?? 'Client'
          log('reservation', `${exists ? 'Réservation modifiée' : 'Nouvelle réservation'} : ${cust}, ${r.partySize} pers. à ${r.time}${r.tableId ? ` · ${tName(r.tableId)}` : ''}`, r.tableId ?? undefined)
          return id
        },

        setReservationStatus: (id, status) => {
          const r = get().reservations.find((x) => x.id === id)
          if (!r) return
          set((s) => ({ reservations: s.reservations.map((x) => (x.id === id ? { ...x, status } : x)) }))
          const cust = get().customers.find((c) => c.id === r.customerId)?.name ?? 'Client'
          const label = { cancelled: 'annulée', noshow: 'marquée absente', confirmed: 'confirmée', pending: 'remise en attente', completed: 'terminée', seated: 'installée' }[status]
          log('reservation', `Réservation ${cust} ${label}`, r.tableId ?? undefined)
        },

        checkIn: (id) => {
          const r = get().reservations.find((x) => x.id === id)
          if (!r || !r.tableId) return false
          const t = get().tables[r.tableId]
          if (t?.status === 'occupied' || t?.status === 'blocked') return false
          get().seatTable(r.tableId, { guests: r.partySize, customerId: r.customerId, reservationId: r.id })
          return true
        },

        saveCustomer: (c) => {
          const id = c.id ?? uid('cu')
          const exists = get().customers.some((x) => x.id === id)
          set((s) => ({
            customers: exists
              ? s.customers.map((x) => (x.id === id ? { ...x, ...c } : x))
              : [
                  ...s.customers,
                  {
                    phone: '',
                    email: '',
                    preferences: '',
                    allergies: '',
                    internalNotes: '',
                    vip: false,
                    priorVisits: 0,
                    createdAt: Date.now(),
                    ...c,
                    id,
                  },
                ],
          }))
          if (!exists) log('customer', `Fiche client créée : ${c.name}`)
          return id
        },

        deleteCustomer: (id) => {
          const name = get().customers.find((c) => c.id === id)?.name
          set((s) => ({
            customers: s.customers.filter((c) => c.id !== id),
            selectedCustomerId: s.selectedCustomerId === id ? null : s.selectedCustomerId,
            tables: Object.fromEntries(
              Object.entries(s.tables).map(([k, v]) => [k, v.customerId === id ? { ...v, customerId: null } : v]),
            ),
          }))
          log('customer', `Fiche client supprimée${name ? ` : ${name}` : ''}`)
        },

        saveStaff: (st) =>
          set((s) => {
            if (st.id && s.staff.some((x) => x.id === st.id)) return { staff: s.staff.map((x) => (x.id === st.id ? { ...x, ...st } : x)) }
            const palette = ['#5B7DB1', '#C9873A', '#6E9A6A', '#9A6AA0', '#4E9C9C', '#B0646E']
            return {
              staff: [
                ...s.staff,
                { id: uid('st'), role: 'serveur', color: palette[s.staff.length % palette.length], active: true, ...st } as Staff,
              ],
            }
          }),

        removeStaff: (id) =>
          set((s) => ({
            staff: s.staff.filter((x) => x.id !== id),
            tables: Object.fromEntries(Object.entries(s.tables).map(([k, v]) => [k, v.waiterId === id ? { ...v, waiterId: null } : v])),
          })),

        updateSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),

        resetDemo: () => {
          const settings = get().settings
          set({
            ...freshData(),
            settings: { ...freshData().settings, reducedMotion: settings.reducedMotion, quality: settings.quality },
            selectedTableId: null,
            selectedReservationId: null,
            selectedCustomerId: null,
            editor: emptyEditor,
          })
          get().notify('Données de démonstration réinitialisées')
        },

        // ─── Éditeur ─────────────────────────────────────────────────────
        editorStart: () =>
          set((s) => ({ editor: { ...emptyEditor, grid: s.editor.grid, draft: structuredClone(s.layout) } })),
        editorSelect: (id) => set((s) => ({ editor: { ...s.editor, selectedId: id } })),
        editorCheckpoint: () =>
          set((s) =>
            s.editor.draft
              ? { editor: { ...s.editor, past: [...s.editor.past, structuredClone(s.editor.draft)].slice(-MAX_HISTORY), future: [] } }
              : {},
          ),
        editorPatch: (id, patch) =>
          set((s) =>
            s.editor.draft
              ? { editor: { ...s.editor, dirty: true, draft: s.editor.draft.map((it) => (it.id === id ? { ...it, ...patch } : it)) } }
              : {},
          ),
        editorAdd: (item) => {
          get().editorCheckpoint()
          set((s) => ({ editor: { ...s.editor, dirty: true, selectedId: item.id, draft: [...(s.editor.draft ?? []), item] } }))
        },
        editorRemove: (id) => {
          get().editorCheckpoint()
          set((s) => ({
            editor: { ...s.editor, dirty: true, selectedId: null, draft: (s.editor.draft ?? []).filter((it) => it.id !== id) },
          }))
        },
        editorUndo: () =>
          set((s) => {
            const { past, draft, future } = s.editor
            if (!past.length || !draft) return {}
            return {
              editor: { ...s.editor, dirty: true, draft: past[past.length - 1], past: past.slice(0, -1), future: [draft, ...future] },
            }
          }),
        editorRedo: () =>
          set((s) => {
            const { past, draft, future } = s.editor
            if (!future.length || !draft) return {}
            return { editor: { ...s.editor, dirty: true, draft: future[0], past: [...past, draft], future: future.slice(1) } }
          }),
        editorToggleGrid: () => set((s) => ({ editor: { ...s.editor, grid: !s.editor.grid } })),
        editorSave: () => {
          const s = get()
          const draft = s.editor.draft
          if (!draft) return { ok: false, error: 'Aucune modification' }
          const tables = draft.filter((d) => d.kind === 'table')
          const nums = tables.map((t) => t.number)
          const dup = nums.find((n, i) => nums.indexOf(n) !== i)
          if (dup !== undefined) return { ok: false, error: `Le numéro de table ${dup} est utilisé deux fois.` }
          const ids = new Set(tables.map((t) => t.id))
          const removed = s.layout.filter((l) => l.kind === 'table' && !ids.has(l.id))
          const nextTables: Record<string, TableService> = {}
          for (const t of tables) nextTables[t.id] = s.tables[t.id] ?? blankService()
          set({
            layout: structuredClone(draft),
            tables: nextTables,
            // une réservation sur une table supprimée redevient "sans table"
            reservations: s.reservations.map((r) => (r.tableId && !ids.has(r.tableId) ? { ...r, tableId: null } : r)),
            selectedTableId: s.selectedTableId && ids.has(s.selectedTableId) ? s.selectedTableId : null,
            editor: { ...s.editor, past: [], future: [], dirty: false, draft: structuredClone(draft) },
          })
          log('layout', `Plan de salle enregistré — ${tables.length} tables${removed.length ? `, ${removed.length} supprimée(s)` : ''}`)
          return { ok: true }
        },
        editorDiscard: () => set((s) => ({ editor: { ...emptyEditor, grid: s.editor.grid, draft: structuredClone(s.layout) } })),
      }
    },
    {
      name: 'tableflow3d-v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        layout: s.layout,
        tables: s.tables,
        reservations: s.reservations,
        customers: s.customers,
        staff: s.staff,
        sessions: s.sessions,
        events: s.events,
        settings: s.settings,
        seededAt: s.seededAt,
      }),
    },
  ),
)

// Horloge partagée (rafraîchie toutes les 20 s) — évite les re-rendus à chaque frame.
export const useClock = create<{ now: number }>(() => ({ now: Date.now() }))
if (typeof window !== 'undefined') setInterval(() => useClock.setState({ now: Date.now() }), 20000)
