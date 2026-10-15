import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  Box,
  CalendarClock,
  LayoutDashboard,
  PencilRuler,
  Settings as SettingsIcon,
  Users,
  UserRound,
  CircleAlert,
  CircleCheck,
} from 'lucide-react'
import type { View } from '../types'
import { useClock, useStore } from '../store/useStore'
import { useActiveService, useLiveStats } from '../lib/hooks'
import { STATUS_META } from '../lib/service'
import { cn, formatDateLong, serviceOf, toHHMM } from '../lib/utils'
import { Segmented } from './ui'

export const NAV: { view: View; label: string; icon: typeof Box }[] = [
  { view: 'overview', label: 'Overview', icon: LayoutDashboard },
  { view: 'plan', label: 'Plan 3D', icon: Box },
  { view: 'reservations', label: 'Réservations', icon: CalendarClock },
  { view: 'customers', label: 'Clients', icon: UserRound },
  { view: 'team', label: 'Équipe', icon: Users },
  { view: 'analytics', label: 'Analytics', icon: BarChart3 },
  { view: 'editor', label: 'Éditeur de salle', icon: PencilRuler },
  { view: 'settings', label: 'Réglages', icon: SettingsIcon },
]

export const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-accent shadow-sm">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path d="M4 10.5 12 6l8 4.5-8 4.5-8-4.5Z" fill="white" />
        <path d="M7 12.2v3.3M17 12.2v3.3M12 15v3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
    <div className="leading-tight">
      <div className="text-[13px] font-semibold tracking-tight">TableFlow 3D</div>
      <div className="text-[10px] text-muted">Restaurant OS</div>
    </div>
  </div>
)

export function Sidebar() {
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  const reservations = useStore((s) => s.reservations)
  const dirty = useStore((s) => s.editor.dirty)
  const pending = reservations.filter((r) => r.status === 'pending').length
  return (
    <aside className="hidden w-[212px] shrink-0 flex-col border-r border-line/70 bg-[#FAF9F6] px-3 py-4 lg:flex">
      <div className="px-2 pb-6">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col gap-0.5" aria-label="Navigation principale">
        {NAV.map(({ view: v, label, icon: Icon }) => (
          <button
            key={v}
            onClick={() => setView(v)}
            aria-current={view === v ? 'page' : undefined}
            className={cn(
              'group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors',
              view === v ? 'bg-white text-ink shadow-card' : 'text-muted hover:bg-black/[0.03] hover:text-ink',
              v === 'editor' && 'mt-3',
            )}
          >
            <Icon size={16} className={view === v ? 'text-accent' : ''} />
            <span className="flex-1 text-left">{label}</span>
            {v === 'reservations' && pending > 0 && (
              <span className="rounded-full bg-st-reserved/15 px-1.5 text-[10px] font-semibold text-[#A8701F]">{pending}</span>
            )}
            {v === 'editor' && dirty && <span className="h-1.5 w-1.5 rounded-full bg-accent" title="Modifications non enregistrées" />}
          </button>
        ))}
      </nav>
      <div className="rounded-xl bg-white p-3 text-[11px] leading-relaxed text-muted shadow-card">
        <div className="mb-1 font-semibold text-ink">Prototype local</div>
        Données enregistrées dans ce navigateur. Aucune synchronisation multi-postes ni caisse connectée.
      </div>
    </aside>
  )
}

export function MobileNav() {
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex gap-1 overflow-x-auto border-t border-line bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5 backdrop-blur lg:hidden"
      aria-label="Navigation principale"
    >
      {NAV.map(({ view: v, label, icon: Icon }) => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={cn(
            'flex min-w-[64px] flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-medium',
            view === v ? 'text-accent' : 'text-muted',
          )}
        >
          <Icon size={18} />
          <span className="whitespace-nowrap">{label.replace('Éditeur de salle', 'Éditeur')}</span>
        </button>
      ))}
    </nav>
  )
}

const Kpi = ({ label, value, color, sub }: { label: string; value: string | number; color?: string; sub?: string }) => (
  <div className="flex min-w-[92px] flex-col px-3 first:pl-0">
    <span className="flex items-center gap-1.5 text-[11px] text-muted">
      {color && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
      {label}
    </span>
    <span className="text-lg font-semibold tabular-nums leading-tight">
      {value}
      {sub && <span className="ml-1 text-xs font-normal text-muted">{sub}</span>}
    </span>
  </div>
)

export function Header() {
  const name = useStore((s) => s.settings.restaurantName)
  const override = useStore((s) => s.settings.serviceOverride)
  const update = useStore((s) => s.updateSettings)
  const now = useClock((s) => s.now)
  const service = useActiveService()
  const st = useLiveStats()
  return (
    <header className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 border-b border-line/70 bg-bg px-4 py-3 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">T</div>
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-semibold tracking-tight">{name}</h1>
          <p className="text-xs capitalize text-muted">
            {formatDateLong(new Date(now))} · <span className="tabular-nums">{toHHMM(now)}</span>
          </p>
        </div>
        <Segmented
          className="ml-1"
          value={service}
          onChange={(v) => update({ serviceOverride: v === serviceOf(now) ? null : v })}
          options={[
            { value: 'midi', label: 'Midi' },
            { value: 'soir', label: 'Soir' },
          ]}
        />
        {override && <span className="hidden text-[10px] text-muted sm:inline">(forcé)</span>}
      </div>
      <div className="no-scrollbar -mx-1 flex flex-1 items-center justify-start overflow-x-auto px-1 lg:justify-end">
        <div className="flex divide-x divide-line">
          <Kpi label="Disponibles" value={st.counts.available} color={STATUS_META.available.color} />
          <Kpi label="Occupées" value={st.counts.occupied} color={STATUS_META.occupied.color} />
          <Kpi label="Réservées" value={st.counts.reserved} color={STATUS_META.reserved.color} />
          <Kpi label={`Résa. ${service}`} value={st.reservationsService} sub={`/ ${st.reservationsToday} jour`} />
          <Kpi label="Couverts présents" value={st.covers} sub={`/ ${st.seats}`} />
        </div>
      </div>
    </header>
  )
}

export function Toast() {
  const toast = useStore((s) => s.toast)
  const [visible, setVisible] = useState<typeof toast>(null)
  useEffect(() => {
    if (!toast) return
    setVisible(toast)
    const t = setTimeout(() => setVisible(null), 2600)
    return () => clearTimeout(t)
  }, [toast])
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex justify-center lg:bottom-6" aria-live="polite">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={visible.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-float"
          >
            {visible.tone === 'warn' ? <CircleAlert size={15} className="text-st-reserved" /> : <CircleCheck size={15} className="text-st-available" />}
            {visible.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
