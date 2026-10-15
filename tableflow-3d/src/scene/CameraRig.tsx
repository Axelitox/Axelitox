import { useEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import CameraControlsImpl from 'camera-controls'
import * as THREE from 'three'
import { useStore } from '../store/useStore'

const { ACTION } = CameraControlsImpl

export const controlsRef: { current: CameraControlsImpl | null } = { current: null }

// Mémorise la vue entre deux montages de la scène (changement d'onglet).
let savedView: { pos: THREE.Vector3; target: THREE.Vector3; zoom: number } | null = null

const ISO_AZIMUTH = Math.PI / 4
const ISO_POLAR = 0.96 // ≈ 55° depuis la verticale → vue isométrique
const DIST = 45
const CENTER = new THREE.Vector3(0, 0, 1.4)

export const computeFit = (w: number, h: number) =>
  // sur écran étroit on accepte de recadrer pour garder des tables lisibles
  w < 700 ? Math.max(14, Math.min(w / 17, h / 14)) : Math.max(8, Math.min(w / 29, h / 21))

export function CameraRig() {
  const ref = useRef<CameraControlsImpl>(null)
  const size = useThree((s) => s.size)
  const cmd = useStore((s) => s.cameraCmd)
  const reduced = useStore((s) => s.settings.reducedMotion)
  const fit = useMemo(() => computeFit(size.width, size.height), [size.width, size.height])
  const fitRef = useRef(fit)
  fitRef.current = fit

  const iso = (animate: boolean) => {
    const c = ref.current
    if (!c) return
    const p = new THREE.Vector3().setFromSphericalCoords(DIST, ISO_POLAR, ISO_AZIMUTH).add(CENTER)
    c.setLookAt(p.x, p.y, p.z, CENTER.x, CENTER.y, CENTER.z, animate)
    c.zoomTo(fitRef.current, animate)
  }

  useEffect(() => {
    const c = ref.current
    if (!c) return
    controlsRef.current = c
    c.mouseButtons.left = ACTION.TRUCK
    c.mouseButtons.right = ACTION.ROTATE
    c.mouseButtons.middle = ACTION.ZOOM
    c.mouseButtons.wheel = ACTION.ZOOM
    c.touches.one = ACTION.TOUCH_TRUCK
    c.touches.two = ACTION.TOUCH_ZOOM_ROTATE
    c.touches.three = ACTION.TOUCH_TRUCK
    c.minPolarAngle = 0
    c.maxPolarAngle = 1.2
    c.minAzimuthAngle = -0.15
    c.maxAzimuthAngle = Math.PI / 2 + 0.15
    c.dollyToCursor = true
    c.draggingSmoothTime = 0.08
    c.setBoundary(new THREE.Box3(new THREE.Vector3(-13, -1, -9), new THREE.Vector3(13, 1, 12)))
    if (savedView) {
      c.setLookAt(savedView.pos.x, savedView.pos.y, savedView.pos.z, savedView.target.x, savedView.target.y, savedView.target.z, false)
      c.zoomTo(savedView.zoom, false)
    } else {
      iso(false)
    }
    return () => {
      const pos = new THREE.Vector3()
      const target = new THREE.Vector3()
      c.getPosition(pos)
      c.getTarget(target)
      savedView = { pos, target, zoom: c.camera.zoom }
      controlsRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const c = ref.current
    if (!c) return
    c.minZoom = fit * 0.55
    c.maxZoom = fit * 5
    c.smoothTime = reduced ? 0 : 0.32
  }, [fit, reduced])

  useEffect(() => {
    const c = ref.current
    if (!c || !cmd) return
    const animate = !reduced
    if (cmd.type === 'iso' || cmd.type === 'reset') iso(animate)
    else if (cmd.type === 'top') {
      c.rotateTo(0, 0, animate)
      c.moveTo(CENTER.x, 0, CENTER.z, animate)
      c.zoomTo(fitRef.current * 0.95, animate)
    } else if (cmd.type === 'focus') {
      const layout = useStore.getState().view === 'editor' ? useStore.getState().editor.draft : useStore.getState().layout
      const t = layout?.find((i) => i.id === cmd.id)
      if (!t) return
      c.moveTo(t.x, 0, t.z, animate)
      if (c.camera.zoom < fitRef.current * 1.6) c.zoomTo(fitRef.current * 1.6, animate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cmd])

  return <CameraControls ref={ref} makeDefault />
}
