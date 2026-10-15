// ─── Domaine TableFlow 3D ────────────────────────────────────────────────
// Toutes les distances sont en mètres, les rotations en radians (axe Y).

export type TableStatus = 'available' | 'reserved' | 'occupied' | 'cleaning' | 'blocked'

export type TableShape = 'round' | 'square' | 'rect'

export type ItemKind =
  | 'table'
  | 'chair'
  | 'stool'
  | 'banquette'
  | 'wall'
  | 'partition'
  | 'bar'
  | 'shelf'
  | 'coffee'
  | 'display'
  | 'kitchen'
  | 'plant'
  | 'planter'
  | 'parasol'
  | 'lectern'
  | 'pendant'
  | 'door'
  | 'zone'

export type ZoneType = 'salle' | 'terrasse' | 'bar' | 'cuisine' | 'prive'

export type KitchenVariant = 'stove' | 'counter' | 'fridge' | 'pass' | 'hood'

export interface LayoutItem {
  id: string
  kind: ItemKind
  x: number
  z: number
  rotation: number
  /** largeur (axe X local) */
  w: number
  /** profondeur (axe Z local) */
  d: number
  /** hauteur (murs, cloisons) */
  h?: number
  // Tables
  number?: number
  shape?: TableShape
  capacity?: number
  /** 'oneSide' = adossée à une banquette : chaises uniquement côté +Z local */
  seating?: 'all' | 'oneSide'
  parasol?: boolean
  // Murs / cloisons
  glass?: boolean
  // Zones
  zoneType?: ZoneType
  name?: string
  // Cuisine
  variant?: KitchenVariant
}

export interface TableService {
  /** Statut de base. 'reserved' peut aussi être dérivé des réservations. */
  status: Exclude<TableStatus, 'reserved'> | 'reserved'
  guests: number
  seatedAt: number | null
  waiterId: string | null
  customerId: string | null
  reservationId: string | null
  changedAt: number
}

export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'noshow'

export interface Reservation {
  id: string
  customerId: string
  date: string // YYYY-MM-DD (local)
  time: string // HH:MM
  duration: number // minutes
  partySize: number
  tableId: string | null
  status: ReservationStatus
  note: string
  createdAt: number
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  preferences: string
  allergies: string
  internalNotes: string
  vip: boolean
  /** visites antérieures à l'utilisation du logiciel */
  priorVisits: number
  createdAt: number
}

export interface Staff {
  id: string
  name: string
  role: 'serveur' | 'chef de rang' | 'responsable'
  color: string
  active: boolean
}

export interface Session {
  id: string
  tableId: string
  tableNumber: number
  start: number
  end: number
  guests: number
  waiterId: string | null
  customerId: string | null
}

export type EventType = 'seat' | 'release' | 'clean' | 'status' | 'reservation' | 'waiter' | 'layout' | 'customer'

export interface ServiceEvent {
  id: string
  at: number
  type: EventType
  text: string
  tableId?: string
}

export interface Settings {
  restaurantName: string
  reservationWindowMin: number
  defaultDuration: number
  cleanAfterRelease: boolean
  role: 'manager' | 'server'
  reducedMotion: boolean
  quality: 'high' | 'balanced'
  serviceOverride: 'midi' | 'soir' | null
  showBadges: boolean
  /** couche de vie : personnages animés */
  showCharacters: boolean
  lifeDensity: 'calm' | 'normal' | 'lively'
}

export type View = 'overview' | 'plan' | 'reservations' | 'customers' | 'team' | 'analytics' | 'editor' | 'settings'
