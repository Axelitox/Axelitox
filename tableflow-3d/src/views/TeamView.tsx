import { useMemo, useState } from 'react'
import { Trash2, UserPlus } from 'lucide-react'
import { useClock, useStore } from '../store/useStore'
import { Button, Card, Field, Input, Select, SectionTitle, Toggle, useTwoStep } from '../components/ui'
import { effectiveStatus, STATUS_META, tablesOf } from '../lib/service'
import { cn, formatDuration, minutesBetween, todayStr } from '../lib/utils'
import type { Staff } from '../types'

export function TeamView() {
  const staff = useStore((s) => s.staff)
  const layout = useStore((s) => s.layout)
  const tables = useStore((s) => s.tables)
  const reservations = useStore((s) => s.reservations)
  const sessions = useStore((s) => s.sessions)
  const windowMin = useStore((s) => s.settings.reservationWindowMin)
  const role = useStore((s) => s.settings.role)
  const now = useClock((s) => s.now)
  const a = useStore.getState()
  const [form, setForm] = useState<{ name: string; role: Staff['role'] }>({ name: '', role: 'serveur' })
  const confirmRm = useTwoStep()
  const tableItems = useMemo(() => tablesOf(layout), [layout])
  const today = todayStr(new Date(now))

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 pb-24 lg:px-6 lg:pb-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Équipe de salle</h2>
        <span className="text-sm text-muted">{staff.filter((s) => s.active).length} en service</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {staff.map((s) => {
          const mine = tableItems.filter((t) => tables[t.id]?.waiterId === s.id)
          const busy = mine.filter((t) => effectiveStatus(t.id, tables[t.id], reservations, now, windowMin) === 'occupied')
          const covers = busy.reduce((acc, t) => acc + (tables[t.id]?.guests ?? 0), 0)
          const done = sessions.filter((x) => x.waiterId === s.id && todayStr(new Date(x.end)) === today)
          const avg = done.length ? Math.round(done.reduce((acc, x) => acc + minutesBetween(x.start, x.end), 0) / done.length) : null
          return (
            <Card key={s.id} className={cn('p-4', !s.active && 'opacity-60')}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ background: s.color }}>
                  {s.name[0]}
                </span>
                <div className="flex-1">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs capitalize text-muted">{s.role}</div>
                </div>
                <label className="flex items-center gap-2 text-xs text-muted">
                  En service <Toggle label={`${s.name} en service`} checked={s.active} onChange={(v) => a.saveStaff({ ...s, active: v })} />
                </label>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  ['Tables', mine.length],
                  ['Couverts', covers],
                  ['Tables servies', done.length],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-lg bg-[#FAF8F4] py-2">
                    <div className="text-lg font-semibold tabular-nums">{v}</div>
                    <div className="text-[10px] text-muted">{l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-1 text-right text-[11px] text-muted">{avg ? `Durée moyenne : ${formatDuration(avg)}` : ' '}</div>
              <SectionTitle>Tables affectées (cliquer pour modifier)</SectionTitle>
              <div className="flex flex-wrap gap-1">
                {tableItems.map((t) => {
                  const assigned = tables[t.id]?.waiterId === s.id
                  const other = !assigned && tables[t.id]?.waiterId
                  const st = effectiveStatus(t.id, tables[t.id], reservations, now, windowMin)
                  return (
                    <button
                      key={t.id}
                      onClick={() => a.assignWaiter(t.id, assigned ? null : s.id)}
                      title={other ? `Actuellement : ${staff.find((x) => x.id === other)?.name}` : undefined}
                      className={cn(
                        'relative h-8 w-9 rounded-md text-xs font-semibold tabular-nums ring-1 transition-colors',
                        assigned ? 'text-white ring-transparent' : other ? 'bg-white text-muted/50 ring-line' : 'bg-white text-ink ring-line hover:ring-ink/30',
                      )}
                      style={assigned ? { background: s.color } : undefined}
                    >
                      {String(t.number).padStart(2, '0')}
                      <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full" style={{ background: STATUS_META[st].color }} />
                    </button>
                  )
                })}
              </div>
              {role === 'manager' && (
                <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
                  <Select className="h-8 w-40 text-xs" value={s.role} onChange={(e) => a.saveStaff({ ...s, role: e.target.value as Staff['role'] })}>
                    <option value="serveur">Serveur</option>
                    <option value="chef de rang">Chef de rang</option>
                    <option value="responsable">Responsable</option>
                  </Select>
                  <button
                    className="flex items-center gap-1 text-xs text-muted hover:text-accent"
                    onClick={() => confirmRm.run(s.id, () => a.removeStaff(s.id))}
                  >
                    <Trash2 size={13} /> {confirmRm.armed === s.id ? 'Confirmer le retrait' : 'Retirer'}
                  </button>
                </div>
              )}
            </Card>
          )
        })}
        {role === 'manager' && (
          <Card className="flex flex-col justify-center gap-3 border border-dashed border-line bg-transparent p-4 shadow-none">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <UserPlus size={16} /> Ajouter un membre
            </div>
            <Field label="Prénom">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex. Nadia" />
            </Field>
            <Field label="Rôle">
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Staff['role'] })}>
                <option value="serveur">Serveur</option>
                <option value="chef de rang">Chef de rang</option>
                <option value="responsable">Responsable</option>
              </Select>
            </Field>
            <Button
              variant="primary"
              disabled={!form.name.trim()}
              onClick={() => {
                a.saveStaff({ name: form.name.trim(), role: form.role })
                setForm({ name: '', role: 'serveur' })
              }}
            >
              Ajouter
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
