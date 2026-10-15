import { useClock, useStore } from '../store/useStore'
import { effectiveStatus, STATUS_META } from '../lib/service'
import { worldAABB } from '../lib/layout'

export const hasWebGL = () => {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

/** Affichage de secours (sans WebGL) : plan vu de dessus, tables cliquables. */
export function FallbackPlan({ mode }: { mode: 'service' | 'editor' }) {
  const layout = useStore((s) => s.layout)
  const tables = useStore((s) => s.tables)
  const reservations = useStore((s) => s.reservations)
  const windowMin = useStore((s) => s.settings.reservationWindowMin)
  const selected = useStore((s) => s.selectedTableId)
  const selectTable = useStore((s) => s.selectTable)
  const now = useClock((s) => s.now)
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
      <p className="rounded-lg bg-[#FDF3E3] px-3 py-1.5 text-xs text-[#8A5A14]">
        WebGL n’est pas disponible sur cet appareil : affichage simplifié du plan{mode === 'editor' ? ' (édition indisponible)' : ''}.
      </p>
      <svg viewBox="-11 -8 22 19" className="h-full max-h-[80%] w-full">
        {layout.map((it) => {
          const r = worldAABB(it)
          if (it.kind === 'zone')
            return <rect key={it.id} x={r.minX} y={r.minZ} width={r.maxX - r.minX} height={r.maxZ - r.minZ} fill="#EFE7DA" stroke="#E0D8CA" strokeWidth={0.03} />
          if (it.kind === 'wall' || it.kind === 'partition')
            return <rect key={it.id} x={r.minX} y={r.minZ} width={r.maxX - r.minX} height={r.maxZ - r.minZ} fill="#BB3834" />
          if (it.kind !== 'table') return null
          const st = effectiveStatus(it.id, tables[it.id], reservations, now, windowMin)
          return (
            <g key={it.id} onClick={() => selectTable(it.id, false)} className="cursor-pointer">
              {it.shape === 'round' ? (
                <circle cx={it.x} cy={it.z} r={it.w / 2 + 0.25} fill="#fff" stroke={STATUS_META[st].color} strokeWidth={selected === it.id ? 0.12 : 0.06} />
              ) : (
                <rect x={r.minX + 0.15} y={r.minZ + 0.15} width={r.maxX - r.minX - 0.3} height={r.maxZ - r.minZ - 0.3} rx={0.15} fill="#fff" stroke={STATUS_META[st].color} strokeWidth={selected === it.id ? 0.12 : 0.06} />
              )}
              <text x={it.x} y={it.z + 0.18} textAnchor="middle" fontSize={0.5} fontWeight={600} fill="#242424">
                {it.number}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
