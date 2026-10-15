import { useEffect, useMemo, useState } from 'react'
import { Copy, Grid3x3, Redo2, RotateCcw, RotateCw, Save, Trash2, Undo2, X, Layers } from 'lucide-react'
import { useStore } from '../store/useStore'
import { SceneHost } from './Workspace'
import { CameraControlsBar } from '../components/SceneOverlay'
import { Button, Field, IconButton, Input, Select, SectionTitle, Toggle, useTwoStep } from '../components/ui'
import { CATALOG, KIND_LABEL, collides, findFreeSpot, makeItem, tableDims, tableLabel } from '../lib/layout'
import { controlsRef } from '../scene/CameraRig'
import { cn, uid } from '../lib/utils'
import type { LayoutItem, TableShape } from '../types'
import * as THREE from 'three'

const deg = (r: number) => Math.round(((((r * 180) / Math.PI) % 360) + 360) % 360)

export function EditorView() {
  const draft = useStore((s) => s.editor.draft)
  const selectedId = useStore((s) => s.editor.selectedId)
  const past = useStore((s) => s.editor.past.length)
  const future = useStore((s) => s.editor.future.length)
  const grid = useStore((s) => s.editor.grid)
  const dirty = useStore((s) => s.editor.dirty)
  const a = useStore.getState()
  const [cat, setCat] = useState(CATALOG[0].key)
  const confirmDiscard = useTwoStep()
  const selected = draft?.find((d) => d.id === selectedId) ?? null

  const add = (entryKey: string) => {
    const entry = CATALOG.flatMap((c) => c.entries).find((e) => e.key === entryKey)
    if (!entry || !draft) return
    const target = new THREE.Vector3()
    controlsRef.current?.getTarget(target)
    let item = makeItem(entry, 0, 0)
    if (item.kind === 'table') {
      const max = Math.max(0, ...draft.filter((d) => d.kind === 'table').map((d) => d.number ?? 0))
      item = { ...item, number: max + 1 }
    }
    const spot = findFreeSpot(item, draft, target.x, target.z)
    a.editorAdd({ ...item, ...spot })
  }

  const rotate = (delta: number) => {
    if (!selected || !draft) return
    const rotation = selected.rotation + delta
    if (collides(selected, draft, { x: selected.x, z: selected.z, rotation })) {
      a.notify('Rotation impossible : chevauchement', 'warn')
      return
    }
    a.editorCheckpoint()
    a.editorPatch(selected.id, { rotation })
  }

  const duplicate = () => {
    if (!selected || !draft) return
    let copy: LayoutItem = { ...selected, id: uid(selected.kind) }
    if (copy.kind === 'table') copy.number = Math.max(0, ...draft.filter((d) => d.kind === 'table').map((d) => d.number ?? 0)) + 1
    const spot = findFreeSpot(copy, draft, selected.x + 1, selected.z + 1)
    copy = { ...copy, ...spot }
    a.editorAdd(copy)
  }

  const remove = () => selected && a.editorRemove(selected.id)

  const save = () => {
    const r = a.editorSave()
    if (r.ok) a.notify('Plan de salle enregistré')
    else a.notify(r.error ?? 'Erreur', 'warn')
  }

  // Raccourcis clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) a.editorRedo()
        else a.editorUndo()
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        a.editorRedo()
      } else if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        duplicate()
      } else if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault()
        save()
      } else if (e.key === 'Delete' || e.key === 'Backspace') remove()
      else if (e.key.toLowerCase() === 'r') rotate(e.shiftKey ? -Math.PI / 4 : Math.PI / 4)
      else if (e.key === 'Escape') a.editorSelect(null)
      else if (selected && draft && e.key.startsWith('Arrow')) {
        e.preventDefault()
        const step = grid ? 0.25 : 0.05
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dz = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
        const p = { x: +(selected.x + dx).toFixed(2), z: +(selected.z + dz).toFixed(2) }
        if (collides(selected, draft, p)) return a.notify('Emplacement déjà occupé', 'warn')
        a.editorCheckpoint()
        a.editorPatch(selected.id, p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const category = CATALOG.find((c) => c.key === cat)!
  const zones = useMemo(() => (draft ?? []).filter((d) => d.kind === 'zone'), [draft])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* barre d'outils */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line/70 bg-[#FCFBF9] px-4 py-2">
        <span className="mr-1 rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">Mode édition</span>
        <IconButton label="Annuler (Ctrl+Z)" onClick={a.editorUndo} disabled={!past}>
          <Undo2 size={16} />
        </IconButton>
        <IconButton label="Rétablir (Ctrl+Y)" onClick={a.editorRedo} disabled={!future}>
          <Redo2 size={16} />
        </IconButton>
        <IconButton label="Grille magnétique" active={grid} onClick={a.editorToggleGrid}>
          <Grid3x3 size={16} />
        </IconButton>
        <span className="hidden text-xs text-muted md:inline">Glisser un objet pour le déplacer · R : pivoter · Suppr : supprimer · flèches : ajuster</span>
        <div className="ml-auto flex items-center gap-2">
          {dirty && <span className="text-xs text-[#A8701F]">Modifications non enregistrées</span>}
          <Button size="sm" variant="ghost" disabled={!dirty} onClick={() => confirmDiscard.run('discard', a.editorDiscard)}>
            <X size={14} /> {confirmDiscard.armed ? 'Confirmer l’abandon' : 'Abandonner'}
          </Button>
          <Button size="sm" variant="primary" disabled={!dirty} onClick={save}>
            <Save size={14} /> Enregistrer le plan
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 max-lg:flex-col">
        {/* catalogue */}
        <div className="shrink-0 border-line/70 bg-[#FCFBF9] lg:w-[230px] lg:overflow-y-auto lg:border-r max-lg:order-2 max-lg:border-t">
          <div className="no-scrollbar flex gap-1 overflow-x-auto p-2 lg:flex-col lg:gap-0.5">
            {CATALOG.map((c) => (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={cn(
                  'shrink-0 rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium',
                  cat === c.key ? 'bg-white text-ink shadow-card' : 'text-muted hover:text-ink',
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-2 pt-0 sm:grid-cols-4 lg:grid-cols-2 max-lg:pb-24">
            {category.entries.map((e) => (
              <button
                key={e.key}
                onClick={() => add(e.key)}
                className="rounded-lg bg-white px-2 py-2.5 text-left text-xs font-medium shadow-card ring-1 ring-black/5 transition hover:ring-accent/40"
              >
                <span className="mb-1 block text-accent">+</span>
                {e.label}
              </button>
            ))}
          </div>
          {cat === 'zones' && zones.length > 0 && (
            <div className="px-3 pb-3">
              <SectionTitle>Zones existantes</SectionTitle>
              {zones.map((z) => (
                <button key={z.id} onClick={() => a.editorSelect(z.id)} className={cn('flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs', selectedId === z.id ? 'bg-accent-soft' : 'hover:bg-black/[0.03]')}>
                  <Layers size={12} /> {z.name}
                </button>
              ))}
              <p className="mt-1 text-[11px] text-muted">Sélectionnez une zone ici, puis faites-la glisser dans la scène.</p>
            </div>
          )}
        </div>

        {/* scène */}
        <div className="relative min-h-[300px] min-w-0 flex-1 overflow-hidden max-lg:order-1">
          <SceneHost mode="editor" />
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-end">
            <CameraControlsBar className="pointer-events-auto" hideLife />
          </div>
          {/* propriétés : panneau flottant (ne redimensionne pas la scène pendant un glisser) */}
          {selected && (
            <div className="absolute right-3 top-3 max-h-[calc(100%-84px)] w-[290px] overflow-y-auto rounded-xl2 bg-white/95 p-4 shadow-float ring-1 ring-black/5 backdrop-blur max-lg:inset-x-3 max-lg:top-auto max-lg:bottom-16 max-lg:max-h-[45%] max-lg:w-auto">
              <Properties item={selected} onRotate={rotate} onDuplicate={duplicate} onRemove={remove} />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function Properties({ item, onRotate, onDuplicate, onRemove }: { item: LayoutItem; onRotate: (d: number) => void; onDuplicate: () => void; onRemove: () => void }) {
  const a = useStore.getState()
  const draft = useStore((s) => s.editor.draft) ?? []
  const patch = (p: Partial<LayoutItem>) => {
    const next = { ...item, ...p }
    if (collides(next, draft)) {
      a.notify('Modification impossible : chevauchement', 'warn')
      return
    }
    a.editorCheckpoint()
    a.editorPatch(item.id, p)
  }
  const dupNumber = item.kind === 'table' && draft.some((d) => d.kind === 'table' && d.id !== item.id && d.number === item.number)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted">{KIND_LABEL[item.kind]}</div>
          <div className="text-base font-semibold">{item.kind === 'table' ? tableLabel(item.number) : item.name ?? KIND_LABEL[item.kind]}</div>
        </div>
        <IconButton label="Désélectionner" onClick={() => a.editorSelect(null)}>
          <X size={16} />
        </IconButton>
      </div>

      <div className="flex gap-1.5">
        <Button size="sm" variant="outline" onClick={() => onRotate(-Math.PI / 4)} title="Pivoter de -45°">
          <RotateCcw size={13} />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onRotate(Math.PI / 4)} title="Pivoter de +45°">
          <RotateCw size={13} />
        </Button>
        <span className="flex items-center px-1 text-xs tabular-nums text-muted">{deg(item.rotation)}°</span>
        <Button size="sm" variant="outline" className="ml-auto" onClick={onDuplicate} title="Dupliquer (Ctrl+D)">
          <Copy size={13} />
        </Button>
        <Button size="sm" variant="danger" onClick={onRemove} title="Supprimer (Suppr)">
          <Trash2 size={13} />
        </Button>
      </div>

      {item.kind === 'table' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Numéro" hint={dupNumber ? <span className="text-accent">Numéro déjà utilisé</span> : undefined}>
              <Input type="number" min={1} value={item.number ?? 1} onChange={(e) => a.editorPatch(item.id, { number: Math.max(1, Number(e.target.value) || 1) })} />
            </Field>
            <Field label="Capacité">
              <Select
                value={item.capacity}
                onChange={(e) => {
                  const capacity = Number(e.target.value)
                  patch({ capacity, ...tableDims(item.shape ?? 'square', capacity) })
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => (
                  <option key={n} value={n}>
                    {n} pers.
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Forme">
            <Select value={item.shape} onChange={(e) => patch({ shape: e.target.value as TableShape, ...tableDims(e.target.value as TableShape, item.capacity ?? 2) })}>
              <option value="round">Ronde</option>
              <option value="square">Carrée</option>
              <option value="rect">Rectangulaire</option>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Largeur (m)">
              <Input type="number" step={0.05} min={0.5} max={4} value={item.w} onChange={(e) => patch({ w: clampN(e.target.value, 0.5, 4), ...(item.shape === 'round' ? { d: clampN(e.target.value, 0.5, 4) } : {}) })} />
            </Field>
            <Field label="Profondeur (m)">
              <Input type="number" step={0.05} min={0.5} max={2} disabled={item.shape === 'round'} value={item.d} onChange={(e) => patch({ d: clampN(e.target.value, 0.5, 2) })} />
            </Field>
          </div>
          <label className="flex items-center justify-between text-[13px]">
            Adossée à une banquette
            <Toggle label="Adossée à une banquette" checked={item.seating === 'oneSide'} onChange={(v) => patch({ seating: v ? 'oneSide' : 'all' })} />
          </label>
          <label className="flex items-center justify-between text-[13px]">
            Parasol
            <Toggle label="Parasol" checked={!!item.parasol} onChange={(v) => patch({ parasol: v })} />
          </label>
        </>
      )}

      {item.kind === 'zone' && (
        <>
          <Field label="Nom de la zone">
            <Input value={item.name ?? ''} onChange={(e) => a.editorPatch(item.id, { name: e.target.value })} />
          </Field>
          <Field label="Type">
            <Select value={item.zoneType} onChange={(e) => patch({ zoneType: e.target.value as LayoutItem['zoneType'] })}>
              <option value="salle">Salle</option>
              <option value="terrasse">Terrasse</option>
              <option value="bar">Bar</option>
              <option value="cuisine">Cuisine</option>
              <option value="prive">Salon privé</option>
            </Select>
          </Field>
        </>
      )}

      {item.kind !== 'table' && !['chair', 'stool', 'plant', 'pendant', 'parasol', 'coffee', 'lectern'].includes(item.kind) && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Longueur (m)">
            <Input type="number" step={0.1} min={0.3} max={30} value={item.w} onChange={(e) => patch({ w: clampN(e.target.value, 0.3, 30) })} />
          </Field>
          <Field label="Profondeur (m)">
            <Input type="number" step={0.05} min={0.05} max={20} value={item.d} onChange={(e) => patch({ d: clampN(e.target.value, 0.05, 20) })} />
          </Field>
          {(item.kind === 'wall' || item.kind === 'partition') && (
            <Field label="Hauteur (m)">
              <Input type="number" step={0.1} min={0.3} max={3.5} value={item.h ?? 2.6} onChange={(e) => patch({ h: clampN(e.target.value, 0.3, 3.5) })} />
            </Field>
          )}
          {item.kind === 'partition' && (
            <label className="col-span-2 flex items-center justify-between text-[13px]">
              Vitrée
              <Toggle label="Vitrée" checked={!!item.glass} onChange={(v) => patch({ glass: v })} />
            </label>
          )}
        </div>
      )}

      <p className="text-xs text-muted">
        Position : {item.x.toFixed(2)} m · {item.z.toFixed(2)} m
      </p>
    </div>
  )
}

const clampN = (v: string, a: number, b: number) => Math.min(b, Math.max(a, Number(v) || a))
