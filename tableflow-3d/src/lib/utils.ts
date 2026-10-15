import clsx, { type ClassValue } from 'clsx'

export const cn = (...v: ClassValue[]) => clsx(v)

export const uid = (prefix = 'id') =>
  `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`

export const pad = (n: number) => String(n).padStart(2, '0')

export const todayStr = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const toHHMM = (ts: number) => {
  const d = new Date(ts)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Timestamp local à partir d'une date YYYY-MM-DD et d'une heure HH:MM */
export const toTs = (date: string, time: string) => {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm, 0, 0).getTime()
}

export const minutesBetween = (a: number, b: number) => Math.max(0, Math.round((b - a) / 60000))

export const formatDuration = (min: number) => {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h} h ${pad(m)}` : `${h} h`
}

export const formatDateLong = (d = new Date()) =>
  d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

export const formatDateShort = (date: string) => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export const addDays = (date: string, n: number) => {
  const [y, m, d] = date.split('-').map(Number)
  return todayStr(new Date(y, m - 1, d + n))
}

/** Arrondit un timestamp au quart d'heure inférieur, renvoie HH:MM */
export const roundQuarter = (ts: number, offsetMin = 0) => {
  const d = new Date(ts + offsetMin * 60000)
  d.setMinutes(Math.floor(d.getMinutes() / 15) * 15, 0, 0)
  return toHHMM(d.getTime())
}

export const serviceOf = (ts: number): 'midi' | 'soir' => (new Date(ts).getHours() < 16 ? 'midi' : 'soir')

export const serviceOfTime = (time: string): 'midi' | 'soir' => (Number(time.split(':')[0]) < 16 ? 'midi' : 'soir')

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

export const maskEmail = (e: string) => {
  if (!e.includes('@')) return e ? '•••' : ''
  const [u, d] = e.split('@')
  return `${u.slice(0, 1)}•••@${d}`
}

export const maskPhone = (p: string) => (p.length > 4 ? `${'•'.repeat(Math.max(0, p.length - 4))}${p.slice(-4)}` : p)

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
