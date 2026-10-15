import type { Customer, LayoutItem, Reservation, ServiceEvent, Session, Staff, TableService } from '../types'
import { tableDims } from '../lib/layout'
import { roundQuarter, todayStr, toTs, addDays } from '../lib/utils'

// ─── Maison Rouge — plan de démonstration ──────────────────────────────────
// Bâtiment : x ∈ [-10, 10], z ∈ [-7, 5] — Terrasse : z ∈ [5.3, 10]

const P = Math.PI / 2

const T = (
  id: string,
  number: number,
  shape: 'round' | 'square' | 'rect',
  capacity: number,
  x: number,
  z: number,
  rotation = 0,
  extra: Partial<LayoutItem> = {},
): LayoutItem => ({ id, kind: 'table', number, shape, capacity, x, z, rotation, seating: 'all', ...tableDims(shape, capacity), ...extra })

export const demoLayout = (): LayoutItem[] => [
  // Zones
  { id: 'z_salle', kind: 'zone', zoneType: 'salle', name: 'Salle', x: 0, z: -1, w: 20, d: 12, rotation: 0 },
  { id: 'z_bar', kind: 'zone', zoneType: 'bar', name: 'Bar', x: 6.5, z: -5, w: 7, d: 4, rotation: 0 },
  { id: 'z_cuisine', kind: 'zone', zoneType: 'cuisine', name: 'Cuisine', x: -6.5, z: -5, w: 7, d: 4, rotation: 0 },
  { id: 'z_terrasse', kind: 'zone', zoneType: 'terrasse', name: 'Terrasse', x: 0, z: 7.65, w: 20, d: 4.7, rotation: 0 },

  // Murs extérieurs (les murs face caméra sont abaissés : coupe architecturale)
  { id: 'w_back', kind: 'wall', x: 0, z: -7.1, w: 20.4, d: 0.2, h: 2.6, rotation: 0 },
  { id: 'w_left', kind: 'wall', x: -10.1, z: -1, w: 12.2, d: 0.2, h: 2.6, rotation: P },
  { id: 'w_right', kind: 'wall', x: 10.1, z: -1, w: 12.2, d: 0.2, h: 0.5, rotation: P },
  { id: 'w_front_l', kind: 'wall', x: -5.55, z: 5.1, w: 9.1, d: 0.2, h: 0.5, rotation: 0 },
  { id: 'w_front_r', kind: 'wall', x: 5.55, z: 5.1, w: 9.1, d: 0.2, h: 0.5, rotation: 0 },
  { id: 'd_entree', kind: 'door', x: 0, z: 5.1, w: 2, d: 0.2, h: 2.4, rotation: 0, name: 'Entrée principale' },

  // Cuisine (derrière cloison vitrée)
  { id: 'p_cuis_1', kind: 'partition', x: -7.2, z: -3, w: 5.6, d: 0.08, h: 2.4, glass: true, rotation: 0 },
  { id: 'p_cuis_2', kind: 'partition', x: -3, z: -5, w: 4, d: 0.08, h: 2.4, glass: true, rotation: P },
  { id: 'd_service', kind: 'door', x: -3.9, z: -3, w: 1, d: 0.16, h: 2.2, rotation: 0, name: 'Porte de service' },
  { id: 'k_stove', kind: 'kitchen', variant: 'stove', x: -8.4, z: -6.55, w: 2.2, d: 0.8, rotation: 0 },
  { id: 'k_hood', kind: 'kitchen', variant: 'hood', x: -8.4, z: -6.6, w: 2.2, d: 0.9, rotation: 0 },
  { id: 'k_counter', kind: 'kitchen', variant: 'counter', x: -5.9, z: -6.55, w: 2.2, d: 0.8, rotation: 0 },
  { id: 'k_fridge', kind: 'kitchen', variant: 'fridge', x: -3.9, z: -6.6, w: 1.2, d: 0.7, rotation: 0 },
  { id: 'k_island', kind: 'kitchen', variant: 'counter', x: -6.8, z: -4.7, w: 2.6, d: 0.9, rotation: 0 },
  { id: 'k_pass', kind: 'kitchen', variant: 'pass', x: -7.2, z: -2.72, w: 2.6, d: 0.5, rotation: 0, name: 'Passe' },

  // Bar
  { id: 'b_shelf', kind: 'shelf', x: 6.5, z: -6.78, w: 5, d: 0.35, rotation: 0 },
  { id: 'b_counter', kind: 'bar', x: 6.3, z: -4.7, w: 4.8, d: 0.7, rotation: 0 },
  { id: 'b_coffee', kind: 'coffee', x: 4.5, z: -4.75, w: 0.6, d: 0.45, rotation: Math.PI },
  { id: 'b_display', kind: 'display', x: 7.9, z: -4.7, w: 0.9, d: 0.45, rotation: 0 },
  { id: 'b_stool1', kind: 'stool', x: 4.6, z: -3.95, w: 0.4, d: 0.4, rotation: 0 },
  { id: 'b_stool2', kind: 'stool', x: 5.6, z: -3.95, w: 0.4, d: 0.4, rotation: 0 },
  { id: 'b_stool3', kind: 'stool', x: 6.6, z: -3.95, w: 0.4, d: 0.4, rotation: 0 },
  { id: 'b_stool4', kind: 'stool', x: 7.6, z: -3.95, w: 0.4, d: 0.4, rotation: 0 },
  { id: 'b_pend1', kind: 'pendant', x: 4.9, z: -4.7, w: 0.4, d: 0.4, rotation: 0 },
  { id: 'b_pend2', kind: 'pendant', x: 6.3, z: -4.7, w: 0.4, d: 0.4, rotation: 0 },
  { id: 'b_pend3', kind: 'pendant', x: 7.7, z: -4.7, w: 0.4, d: 0.4, rotation: 0 },
  { id: 'c_wine', kind: 'shelf', x: 0, z: -6.78, w: 3.6, d: 0.35, rotation: 0, name: 'Cave à vin' },

  // Salle principale
  { id: 'bq_left', kind: 'banquette', x: -9.68, z: 1.5, w: 5.6, d: 0.6, rotation: P },
  T('t01', 1, 'square', 2, -8.85, -0.6, P, { seating: 'oneSide' }),
  T('t02', 2, 'square', 2, -8.85, 1.5, P, { seating: 'oneSide' }),
  T('t03', 3, 'square', 2, -8.85, 3.6, P, { seating: 'oneSide' }),
  { id: 'p_claustra1', kind: 'partition', x: -7.55, z: 1.5, w: 3.4, d: 0.08, h: 1.3, rotation: P },
  T('t04', 4, 'square', 4, -5.6, -0.6),
  T('t05', 5, 'square', 4, -5.6, 2.7),
  T('t06', 6, 'rect', 6, -2.7, 1.1, P),
  T('t07', 7, 'round', 2, 2.6, -0.6),
  T('t08', 8, 'round', 4, 2.6, 2.7),
  { id: 'p_claustra2', kind: 'partition', x: 4.35, z: 1.2, w: 2.6, d: 0.08, h: 1.3, rotation: P },
  T('t09', 9, 'rect', 8, 7.1, 1.2),
  { id: 's_pend1', kind: 'pendant', x: 6.4, z: 1.2, w: 0.4, d: 0.4, rotation: 0 },
  { id: 's_pend2', kind: 'pendant', x: 7.8, z: 1.2, w: 0.4, d: 0.4, rotation: 0 },
  { id: 's_pend3', kind: 'pendant', x: -2.7, z: 1.1, w: 0.4, d: 0.4, rotation: 0 },
  { id: 'lectern', kind: 'lectern', x: 1.9, z: 4.4, w: 0.6, d: 0.45, rotation: Math.PI },
  { id: 'pl_1', kind: 'plant', x: -9.5, z: -2.5, w: 0.5, d: 0.5, rotation: 0 },
  { id: 'pl_2', kind: 'plant', x: 9.5, z: -2.5, w: 0.5, d: 0.5, rotation: 0 },
  { id: 'pl_3', kind: 'plant', x: 9.5, z: 4.4, w: 0.5, d: 0.5, rotation: 0 },
  { id: 'pl_4', kind: 'plant', x: -1.6, z: 4.4, w: 0.5, d: 0.5, rotation: 0 },
  { id: 'pl_5', kind: 'plant', x: -2.4, z: -6.5, w: 0.5, d: 0.5, rotation: 0 },
  { id: 'pl_6', kind: 'plant', x: 2.4, z: -6.5, w: 0.5, d: 0.5, rotation: 0 },

  // Terrasse
  T('t10', 10, 'round', 2, -7, 7.5, 0, { parasol: true }),
  T('t11', 11, 'round', 2, -3.6, 7.5, 0, { parasol: true }),
  T('t12', 12, 'square', 4, 4, 7.5, 0, { parasol: true }),
  { id: 'tp_1', kind: 'planter', x: -5.6, z: 9.75, w: 8.4, d: 0.4, rotation: 0 },
  { id: 'tp_2', kind: 'planter', x: 5.6, z: 9.75, w: 8.4, d: 0.4, rotation: 0 },
  { id: 'pl_7', kind: 'plant', x: 7.6, z: 7.2, w: 0.5, d: 0.5, rotation: 0 },
  { id: 'pl_8', kind: 'plant', x: -9.5, z: 6, w: 0.5, d: 0.5, rotation: 0 },
]

export const demoStaff = (): Staff[] => [
  { id: 'st_thomas', name: 'Thomas', role: 'chef de rang', color: '#5B7DB1', active: true },
  { id: 'st_lea', name: 'Léa', role: 'serveur', color: '#C9873A', active: true },
  { id: 'st_karim', name: 'Karim', role: 'serveur', color: '#6E9A6A', active: true },
]

export const demoCustomers = (now: number): Customer[] => {
  const c = (id: string, name: string, phone: string, email: string, extra: Partial<Customer> = {}): Customer => ({
    id,
    name,
    phone,
    email,
    preferences: '',
    allergies: '',
    internalNotes: '',
    vip: false,
    priorVisits: 0,
    createdAt: now - 1000 * 3600 * 24 * 90,
    ...extra,
  })
  return [
    c('cu_sophie', 'Sophie Martin', '06 12 48 90 31', 'sophie.martin@exemple.fr', {
      vip: true,
      priorVisits: 14,
      preferences: 'Table au calme, côté banquette. Eau pétillante.',
      allergies: 'Fruits à coque',
      internalNotes: 'Cliente fidèle depuis l’ouverture. Offrir le café en fin de repas.',
    }),
    c('cu_atelier', 'Atelier Nord (déjeuner équipe)', '01 44 20 18 70', 'contact@ateliernord.exemple', {
      priorVisits: 6,
      preferences: 'Facture unique au nom de la société.',
    }),
    c('cu_julien', 'Julien Bernard', '06 77 21 05 64', 'j.bernard@exemple.fr', { priorVisits: 3 }),
    c('cu_camille', 'Camille Dubois', '07 81 33 42 10', 'camille.dubois@exemple.fr', {
      priorVisits: 8,
      preferences: 'Végétarienne.',
      vip: true,
    }),
    c('cu_antoine', 'Antoine Leroy', '06 40 55 18 92', 'antoine.leroy@exemple.fr', {
      priorVisits: 1,
      preferences: 'Anniversaire — prévoir une bougie au dessert.',
    }),
    c('cu_chloe', 'Chloé Moreau', '06 09 87 12 44', 'chloe.moreau@exemple.fr', { allergies: 'Lactose' }),
    c('cu_hugo', 'Hugo Petit', '07 66 10 29 73', 'hugo.petit@exemple.fr', { priorVisits: 2 }),
    c('cu_ines', 'Inès Garnier', '06 52 73 61 08', 'ines.garnier@exemple.fr', { priorVisits: 4, preferences: 'Terrasse si possible.' }),
    c('cu_lucas', 'Lucas Fontaine', '06 38 90 47 15', 'lucas.fontaine@exemple.fr', {
      internalNotes: 'Absence non signalée le mois dernier.',
    }),
    c('cu_manon', 'Manon Rousseau', '07 12 64 85 39', 'manon.rousseau@exemple.fr', { priorVisits: 5, allergies: 'Gluten (cœliaque)' }),
  ]
}

const at = (ts: number) => ({ date: todayStr(new Date(ts)), time: roundQuarter(ts) })

export const demoService = (now: number) => {
  const min = 60000
  const today = todayStr(new Date(now))

  const R = (
    id: string,
    customerId: string,
    ts: number,
    partySize: number,
    tableId: string | null,
    status: Reservation['status'],
    note = '',
    duration = 90,
  ): Reservation => ({ id, customerId, ...at(ts), duration, partySize, tableId, status, note, createdAt: now - 3 * 24 * 3600 * 1000 })

  const reservations: Reservation[] = [
    R('r_sophie', 'cu_sophie', now - 55 * min, 3, 't04', 'seated', 'Allergie fruits à coque — prévenir la cuisine.'),
    R('r_atelier', 'cu_atelier', now - 25 * min, 6, 't06', 'seated', 'Déjeuner d’équipe, menu du jour.', 105),
    R('r_julien', 'cu_julien', now + 30 * min, 4, 't05', 'confirmed'),
    R('r_camille', 'cu_camille', now + 45 * min, 4, 't08', 'confirmed', 'Menu végétarien.'),
    R('r_chloe', 'cu_chloe', now + 60 * min, 2, null, 'pending', 'Sans lactose.'),
    R('r_antoine', 'cu_antoine', now + 150 * min, 6, 't09', 'confirmed', 'Anniversaire — bougie au dessert.', 120),
    R('r_hugo', 'cu_hugo', now + 330 * min, 2, 't02', 'confirmed'),
    R('r_ines', 'cu_ines', now - 130 * min, 2, 't07', 'completed'),
    R('r_lucas', 'cu_lucas', now - 90 * min, 2, null, 'noshow'),
    // Historique (visites passées)
    { ...R('r_h1', 'cu_sophie', now, 2, 't02', 'completed'), date: addDays(today, -7), time: '12:30' },
    { ...R('r_h2', 'cu_sophie', now, 4, 't04', 'completed'), date: addDays(today, -21), time: '20:00' },
    { ...R('r_h3', 'cu_camille', now, 2, 't07', 'completed'), date: addDays(today, -12), time: '13:00' },
    { ...R('r_h4', 'cu_manon', now, 3, 't08', 'completed'), date: addDays(today, -3), time: '19:45' },
    { ...R('r_h5', 'cu_julien', now, 2, 't10', 'cancelled'), date: addDays(today, -5), time: '12:15' },
    // Demain
    { ...R('r_t1', 'cu_manon', now, 4, 't05', 'confirmed', 'Sans gluten.'), date: addDays(today, 1), time: '12:30' },
    { ...R('r_t2', 'cu_sophie', now, 2, 't01', 'confirmed'), date: addDays(today, 1), time: '20:00' },
  ]

  const base = (status: TableService['status'], extra: Partial<TableService> = {}): TableService => ({
    status,
    guests: 0,
    seatedAt: null,
    waiterId: null,
    customerId: null,
    reservationId: null,
    changedAt: now - 20 * min,
    ...extra,
  })

  const tables: Record<string, TableService> = {
    t01: base('occupied', { guests: 2, seatedAt: now - 38 * min, waiterId: 'st_lea', changedAt: now - 38 * min }),
    t02: base('available', { waiterId: 'st_lea' }),
    t03: base('cleaning', { waiterId: 'st_lea', changedAt: now - 12 * min }),
    t04: base('occupied', {
      guests: 3,
      seatedAt: toTs(reservations[0].date, reservations[0].time) + 5 * min,
      waiterId: 'st_thomas',
      customerId: 'cu_sophie',
      reservationId: 'r_sophie',
    }),
    t05: base('available', { waiterId: 'st_thomas' }),
    t06: base('occupied', {
      guests: 6,
      seatedAt: now - 24 * min,
      waiterId: 'st_karim',
      customerId: 'cu_atelier',
      reservationId: 'r_atelier',
    }),
    t07: base('available', { waiterId: 'st_thomas' }),
    t08: base('available', { waiterId: 'st_thomas' }),
    t09: base('available', { waiterId: 'st_karim' }),
    t10: base('occupied', { guests: 2, seatedAt: now - 15 * min, waiterId: 'st_karim', changedAt: now - 15 * min }),
    t11: base('blocked', { changedAt: now - 3 * 3600 * 1000 }),
    t12: base('available', { waiterId: 'st_karim' }),
  }

  const S = (id: string, tableId: string, n: number, s: number, e: number, guests: number, waiterId: string, customerId: string | null = null): Session => ({
    id,
    tableId,
    tableNumber: n,
    start: now - s * min,
    end: now - e * min,
    guests,
    waiterId,
    customerId,
  })

  const sessions: Session[] = [
    S('s1', 't07', 7, 128, 72, 2, 'st_thomas', 'cu_ines'),
    S('s2', 't02', 2, 112, 50, 2, 'st_lea'),
    S('s3', 't03', 3, 95, 12, 2, 'st_lea'),
    S('s4', 't10', 10, 104, 41, 2, 'st_karim'),
    S('s5', 't12', 12, 100, 30, 3, 'st_karim'),
  ]

  const E = (id: string, ago: number, type: ServiceEvent['type'], text: string, tableId?: string): ServiceEvent => ({
    id,
    at: now - ago * min,
    type,
    text,
    tableId,
  })

  const events: ServiceEvent[] = [
    E('e9', 12, 'release', 'Table 03 libérée — 2 couverts, 1 h 23', 't03'),
    E('e8', 15, 'seat', 'Table 10 installée — 2 couverts (sans réservation)', 't10'),
    E('e7', 24, 'seat', 'Atelier Nord installé en table 06 — 6 couverts', 't06'),
    E('e6', 30, 'release', 'Table 12 libérée — 3 couverts', 't12'),
    E('e5', 38, 'seat', 'Table 01 installée — 2 couverts', 't01'),
    E('e4', 50, 'seat', 'Sophie Martin installée en table 04 — 3 couverts', 't04'),
    E('e3', 75, 'reservation', 'Lucas Fontaine marqué absent (no-show)'),
    E('e2', 180, 'status', 'Table 11 indisponible — parasol endommagé', 't11'),
  ]

  return { reservations, tables, sessions, events }
}
