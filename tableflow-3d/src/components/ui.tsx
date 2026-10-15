import { forwardRef, useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../lib/utils'
import { useStore } from '../store/useStore'

// Primitives au style shadcn/ui (sobres, accessibles, sans dépendance supplémentaire).

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' }>(
  ({ className, variant = 'secondary', size = 'md', ...p }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40',
        size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-9 px-3.5 text-sm',
        variant === 'primary' && 'bg-accent text-white hover:bg-accent-dark',
        variant === 'secondary' && 'bg-[#F1EEE8] text-ink hover:bg-[#E9E5DD]',
        variant === 'outline' && 'border border-line bg-white text-ink hover:bg-[#FAF8F4]',
        variant === 'ghost' && 'text-ink hover:bg-black/5',
        variant === 'danger' && 'bg-white text-accent-dark ring-1 ring-inset ring-accent/30 hover:bg-accent-soft',
        className,
      )}
      {...p}
    />
  ),
)

export const IconButton = ({ className, active, label, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; label: string }) => (
  <button
    aria-label={label}
    title={label}
    className={cn(
      'inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-30',
      active && 'bg-ink text-white hover:bg-ink',
      className,
    )}
    {...p}
  />
)

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-9 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink placeholder:text-muted/70 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/15',
      className,
    )}
    {...p}
  />
))

export const Textarea = ({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn(
      'min-h-[72px] w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/15',
      className,
    )}
    {...p}
  />
)

export const Select = ({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={cn(
      'h-9 w-full rounded-lg border border-line bg-white px-2.5 text-sm text-ink focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/15',
      className,
    )}
    {...p}
  >
    {children}
  </select>
)

export const Field = ({ label, children, hint, className }: { label: string; children: ReactNode; hint?: ReactNode; className?: string }) => (
  <label className={cn('block', className)}>
    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
  </label>
)

export const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn('rounded-xl2 bg-white shadow-card', className)}>{children}</div>
)

export const SectionTitle = ({ children, action }: { children: ReactNode; action?: ReactNode }) => (
  <div className="mb-2 flex items-center justify-between">
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">{children}</h3>
    {action}
  </div>
)

export const Dot = ({ color, className }: { color: string; className?: string }) => (
  <span className={cn('inline-block h-2 w-2 shrink-0 rounded-full', className)} style={{ background: color }} />
)

export const Segmented = <T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T
  options: { value: T; label: ReactNode }[]
  onChange: (v: T) => void
  className?: string
}) => (
  <div className={cn('inline-flex rounded-lg bg-[#EFECE6] p-0.5', className)}>
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={cn(
          'rounded-md px-2.5 py-1 text-xs font-medium transition-all',
          value === o.value ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink',
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
)

export const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={cn('relative h-5 w-9 shrink-0 rounded-full transition-colors', checked ? 'bg-accent' : 'bg-[#D9D5CD]')}
  >
    <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', checked ? 'left-[18px]' : 'left-0.5')} />
  </button>
)

export const Modal = ({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) => {
  const reduced = useStore((s) => s.settings.reducedMotion)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/25 backdrop-blur-[2px] sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.15 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn('max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-float sm:rounded-2xl', wide ? 'sm:max-w-2xl' : 'sm:max-w-lg')}
            initial={{ y: reduced ? 0 : 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduced ? 0 : 16, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">{title}</h2>
              <IconButton label="Fermer" onClick={onClose}>
                <X size={16} />
              </IconButton>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Confirmation en deux clics (les boîtes de dialogue natives ne sont pas toujours disponibles). */
export const useTwoStep = (ms = 3500) => {
  const [armed, setArmed] = useState<string | null>(null)
  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(null), ms)
    return () => clearTimeout(t)
  }, [armed, ms])
  return {
    armed,
    run: (key: string, fn: () => void) => {
      if (armed === key) {
        setArmed(null)
        fn()
      } else setArmed(key)
    },
  }
}

export const Empty = ({ children }: { children: ReactNode }) => (
  <div className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">{children}</div>
)
