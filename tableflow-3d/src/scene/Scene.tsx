import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, N8AO, SMAA } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { CameraRig } from './CameraRig'
import { Environment, Lights } from './Environment'
import { ServiceLayer } from './ServiceLayer'
import { EditorLayer } from './EditorLayer'

export default function Scene({ mode }: { mode: 'service' | 'editor' }) {
  const quality = useStore((s) => s.settings.quality)
  const layout = useStore((s) => (mode === 'editor' ? s.editor.draft ?? s.layout : s.layout))
  const down = useRef({ x: 0, y: 0 })

  const missed = (e: MouseEvent) => {
    if (Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) > 6) return
    const st = useStore.getState()
    if (mode === 'service') st.selectTable(null, false)
    else st.editorSelect(null)
  }

  return (
    <div
      className="absolute inset-0"
      onPointerDown={(e) => (down.current = { x: e.clientX, y: e.clientY })}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Canvas
        orthographic
        flat
        shadows={{ type: THREE.PCFSoftShadowMap }}
        dpr={[1, quality === 'high' ? 2 : 1.25]}
        camera={{ position: [25, 30, 25], zoom: 30, near: 0.1, far: 400 }}
        gl={{ antialias: quality !== 'high', powerPreference: 'high-performance', preserveDrawingBuffer: true }}
        onPointerMissed={missed}
        aria-label="Plan 3D du restaurant"
      >
        <color attach="background" args={['#F5F3EE']} />
        <Lights quality={quality} />
        <Suspense fallback={null}>
          <Environment layout={layout} />
          {mode === 'service' ? <ServiceLayer /> : <EditorLayer />}
        </Suspense>
        <CameraRig />
        {quality === 'high' && (
          <EffectComposer multisampling={0} enableNormalPass={false}>
            <N8AO aoRadius={0.9} distanceFalloff={0.5} intensity={2.4} color="#3a2e24" halfRes quality="medium" />
            <SMAA />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
