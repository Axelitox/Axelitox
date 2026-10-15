import { create } from 'zustand'

/** Missions en cours des serveurs animés (mises à jour à chaque changement, pas à chaque image). */
export interface Mission {
  text: string
  tableId: string | null
}

export const useLife = create<{ missions: Record<string, Mission | null>; set: (staffId: string, m: Mission | null) => void }>((set) => ({
  missions: {},
  set: (staffId, m) => set((s) => (s.missions[staffId]?.text === m?.text ? s : { missions: { ...s.missions, [staffId]: m } })),
}))
