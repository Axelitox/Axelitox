import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { LayoutItem } from '../types'
import { useStore } from '../store/useStore'
import { ItemModel, PLANE } from './models'
import { controlsRef } from './CameraRig'
import { collides, localRect, snap } from '../lib/layout'

const FLOOR = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const hit = new THREE.Vector3()
const ndc = new THREE.Vector2()
const raycaster = new THREE.Raycaster()

const selMat = new THREE.MeshBasicMaterial({ color: '#D84A42', transparent: true, opacity: 0.14, depthWrite: false })
const selLine = new THREE.LineBasicMaterial({ color: '#D84A42' })
const badMat = new THREE.MeshBasicMaterial({ color: '#D84A42', transparent: true, opacity: 0.45, depthWrite: false })

const Footprint = ({ item, invalid }: { item: LayoutItem; invalid: boolean }) => {
  const r = localRect(item)
  const w = r.maxX - r.minX + 0.12
  const d = r.maxZ - r.minZ + 0.12
  const cx = (r.minX + r.maxX) / 2
  const cz = (r.minZ + r.maxZ) / 2
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(
      [
        [-w / 2, -d / 2],
        [w / 2, -d / 2],
        [w / 2, d / 2],
        [-w / 2, d / 2],
        [-w / 2, -d / 2],
      ].map(([x, z]) => new THREE.Vector3(x, 0, z)),
    )
    return new THREE.Line(g, selLine)
  }, [w, d])
  return (
    <group position={[cx, 0.03, cz]}>
      <mesh geometry={PLANE} rotation={[-Math.PI / 2, 0, 0]} scale={[w, d, 1]} material={invalid ? badMat : selMat} renderOrder={5} />
      <primitive object={line} />
    </group>
  )
}

const EditableItem = memo(function EditableItem({
  item,
  selected,
  invalid,
  level,
  onDown,
}: {
  item: LayoutItem
  selected: boolean
  invalid: boolean
  level: number
  onDown: (e: ThreeEvent<PointerEvent>, item: LayoutItem) => void
}) {
  const isZone = item.kind === 'zone'
  return (
    <group position={[item.x, isZone ? level * 0.002 : 0, item.z]} rotation={[0, item.rotation, 0]}>
      <group
        onPointerDown={(e) => {
          if (isZone && !selected) return
          onDown(e, item)
        }}
        onPointerOver={(e) => {
          if (isZone && !selected) return
          e.stopPropagation()
          document.body.style.cursor = 'grab'
        }}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        <ItemModel item={item} />
        {item.kind === 'table' && (
          <mesh geometry={PLANE} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.8, 0]} scale={[item.w + 0.8, item.d + 0.8, 1]} visible={false} />
        )}
      </group>
      {(selected || invalid) && <Footprint item={item} invalid={invalid} />}
      {item.kind === 'table' && (
        <Html position={[0, 1.15, 0]} center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
          <div
            className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold shadow-float ring-1 ring-black/5 ${
              selected ? 'bg-accent text-white' : 'bg-white/95 text-ink'
            }`}
          >
            T{String(item.number).padStart(2, '0')} · {item.capacity} pl.
          </div>
        </Html>
      )}
    </group>
  )
})

export function EditorLayer() {
  const draft = useStore((s) => s.editor.draft)
  const selectedId = useStore((s) => s.editor.selectedId)
  const grid = useStore((s) => s.editor.grid)
  const { camera, gl } = useThree()
  const [invalidId, setInvalidId] = useState<string | null>(null)
  const drag = useRef<{
    id: string
    offX: number
    offZ: number
    sx: number
    sy: number
    started: boolean
    lastValid: { x: number; z: number }
    invalid: boolean
  } | null>(null)

  const zoneLevel = useMemo(() => {
    const zones = (draft ?? []).filter((i) => i.kind === 'zone').sort((a, b) => b.w * b.d - a.w * a.d)
    return new Map(zones.map((z, i) => [z.id, i]))
  }, [draft])

  const gridObj = useMemo(() => {
    const g = new THREE.GridHelper(40, 80, '#C9C3B7', '#DDD8CE')
    const m = g.material as THREE.Material
    m.transparent = true
    m.opacity = 0.55
    m.depthWrite = false
    g.position.set(0, 0.02, 1.5)
    g.renderOrder = 4
    return g
  }, [])

  useEffect(() => {
    const move = (ev: PointerEvent) => {
      const d = drag.current
      if (!d) return
      if (!d.started) {
        if (Math.hypot(ev.clientX - d.sx, ev.clientY - d.sy) < 4) return
        d.started = true
        useStore.getState().editorCheckpoint()
        document.body.style.cursor = 'grabbing'
      }
      const rect = gl.domElement.getBoundingClientRect()
      ndc.set(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      if (!raycaster.ray.intersectPlane(FLOOR, hit)) return
      const st = useStore.getState()
      const items = st.editor.draft ?? []
      const it = items.find((i) => i.id === d.id)
      if (!it) return
      const step = st.editor.grid ? 0.25 : 0.05
      const x = snap(hit.x + d.offX, step)
      const z = snap(hit.z + d.offZ, step)
      if (x === it.x && z === it.z) return
      const bad = !!collides(it, items, { x, z })
      d.invalid = bad
      if (!bad) d.lastValid = { x, z }
      setInvalidId(bad ? d.id : null)
      st.editorPatch(d.id, { x, z })
    }
    const up = () => {
      const d = drag.current
      if (!d) return
      if (d.started && d.invalid) {
        useStore.getState().editorPatch(d.id, d.lastValid)
        useStore.getState().notify('Emplacement déjà occupé — objet replacé', 'warn')
      }
      drag.current = null
      setInvalidId(null)
      document.body.style.cursor = ''
      if (controlsRef.current) controlsRef.current.enabled = true
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [camera, gl])

  const onDown = (e: ThreeEvent<PointerEvent>, item: LayoutItem) => {
    if (e.button !== 0) return
    e.stopPropagation()
    useStore.getState().editorSelect(item.id)
    if (!e.ray.intersectPlane(FLOOR, hit)) return
    drag.current = {
      id: item.id,
      offX: item.x - hit.x,
      offZ: item.z - hit.z,
      sx: e.nativeEvent.clientX,
      sy: e.nativeEvent.clientY,
      started: false,
      lastValid: { x: item.x, z: item.z },
      invalid: false,
    }
    // camera-controls a déjà reçu ce pointerdown (écouteur sur le canvas) : on annule son glissé
    if (controlsRef.current) {
      controlsRef.current.cancel()
      controlsRef.current.enabled = false
    }
  }

  if (!draft) return null
  return (
    <>
      {grid && <primitive object={gridObj} />}
      {draft.map((it) => (
        <EditableItem
          key={it.id}
          item={it}
          selected={selectedId === it.id}
          invalid={invalidId === it.id}
          level={zoneLevel.get(it.id) ?? 0}
          onDown={onDown}
        />
      ))}
    </>
  )
}
