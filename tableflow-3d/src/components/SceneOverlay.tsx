import { Box, LocateFixed, Minus, Plus, Square, Tag } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useLiveStats } from '../lib/hooks'
import { STATUS_META, STATUS_ORDER } from '../lib/service'
import { controlsRef } from '../scene/CameraRig'
import { cn } from '../lib/utils'
import { IconButton } from './ui'

export function CameraControlsBar({ className }: { className?: string }) {
  const camera = useStore((s) => s.camera)
  const showBadges = useStore((s) => s.settings.showBadges)
  const update = useStore((s) => s.updateSettings)
  const reduced = useStore((s) => s.settings.reducedMotion)
  const zoom = (f: number) => {
    const c = controlsRef.current
    if (c) c.zoomTo(c.camera.zoom * f, !reduced)
  }
  return (
    <div className={cn('flex items-center gap-0.5 rounded-xl bg-white/95 p-1 shadow-float ring-1 ring-black/5 backdrop-blur', className)}>
      <IconButton label="Vue isométrique" onClick={() => camera('iso')}>
        <Box size={16} />
      </IconButton>
      <IconButton label="Vue de dessus" onClick={() => camera('top')}>
        <Square size={16} />
      </IconButton>
      <IconButton label="Recentrer" onClick={() => camera('reset')}>
        <LocateFixed size={16} />
      </IconButton>
      <span className="mx-0.5 h-5 w-px bg-line" />
      <IconButton label="Zoom arrière" onClick={() => zoom(0.8)}>
        <Minus size={16} />
      </IconButton>
      <IconButton label="Zoom avant" onClick={() => zoom(1.25)}>
        <Plus size={16} />
      </IconButton>
      <span className="mx-0.5 h-5 w-px bg-line" />
      <IconButton label={showBadges ? 'Masquer les étiquettes' : 'Afficher les étiquettes'} active={showBadges} onClick={() => update({ showBadges: !showBadges })}>
        <Tag size={15} />
      </IconButton>
    </div>
  )
}

export function StatusLegend({ className }: { className?: string }) {
  const st = useLiveStats()
  const filter = useStore((s) => s.statusFilter)
  const setFilter = useStore((s) => s.setStatusFilter)
  return (
    <div className={cn('flex flex-wrap items-center gap-1 rounded-xl bg-white/95 p-1 shadow-float ring-1 ring-black/5 backdrop-blur', className)} role="group" aria-label="Filtrer par statut">
      {STATUS_ORDER.map((s) => {
        const m = STATUS_META[s]
        const active = filter === s
        return (
          <button
            key={s}
            onClick={() => setFilter(active ? null : s)}
            aria-pressed={active}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors',
              active ? 'bg-ink text-white' : filter ? 'text-muted/70 hover:text-ink' : 'text-ink hover:bg-black/[0.04]',
            )}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
            {m.short}
            <span className={cn('tabular-nums', active ? 'text-white/70' : 'text-muted')}>{st.counts[s]}</span>
          </button>
        )
      })}
    </div>
  )
}

export const NavHint = () => (
  <div className="pointer-events-none hidden rounded-lg bg-white/80 px-2.5 py-1 text-[11px] text-muted backdrop-blur xl:block">
    Glisser : déplacer · Clic droit : pivoter · Molette : zoom
  </div>
)
