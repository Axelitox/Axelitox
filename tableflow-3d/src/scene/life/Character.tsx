import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { Agent } from './sim'

// ─── Personnages low-poly ──────────────────────────────────────────────────
// Géométries et matériaux partagés ; ~14 meshes par personnage ; aucune collision de clic
// (raycast neutralisé) pour ne jamais gêner la sélection des tables.

const BOX = new THREE.BoxGeometry(1, 1, 1)
const HEAD = new THREE.IcosahedronGeometry(0.5, 1)
const CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 10)
const CAP = new THREE.SphereGeometry(0.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2)
const RING = new THREE.RingGeometry(0.2, 0.26, 28)
const DOT = new THREE.SphereGeometry(0.5, 10, 8)

const mat = (color: string, roughness = 0.85) => new THREE.MeshStandardMaterial({ color, roughness, flatShading: true })
const matCache = new Map<string, THREE.MeshStandardMaterial>()
const cached = (color: string) => {
  if (!matCache.has(color)) matCache.set(color, mat(color))
  return matCache.get(color)!
}

const SKIN = ['#E9C4A6', '#D7A784', '#B07F5E', '#8A5B40'].map((c) => mat(c, 0.9))
const HAIR = ['#2E2622', '#5B4031', '#8C6A4E', '#B9A38A', '#1E1E22'].map((c) => mat(c, 0.95))
const TOPS = ['#33435C', '#B6976E', '#6E7A5A', '#7E3B3A', '#5D6A73', '#E7E1D6', '#3E3A45', '#A7836A'].map((c) => mat(c))
const BOTTOMS = ['#2B2E33', '#3F4650', '#5A4E44', '#24282E', '#6B6F72'].map((c) => mat(c))
const M = {
  shirt: mat('#F6F4EF'),
  pants: mat('#2A2C30'),
  apron: mat('#26282B'),
  chef: mat('#FBFAF7'),
  chefPants: mat('#8E9396'),
  plate: new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.35 }),
  food: mat('#C98B5A'),
  shoe: mat('#1E1F22'),
  ring: new THREE.MeshBasicMaterial({ color: '#D84A42', transparent: true, opacity: 0.6, depthWrite: false }),
}

const noop = () => null

type MP = { g?: THREE.BufferGeometry; m: THREE.Material; p: [number, number, number]; s: [number, number, number]; shadow?: boolean }
const Part = ({ g = BOX, m, p, s, shadow = false }: MP) => <mesh geometry={g} material={m} position={p} scale={s} castShadow={shadow} raycast={noop} />

interface Look {
  skin: THREE.Material
  hair: THREE.Material
  top: THREE.Material
  bottom: THREE.Material
  long: boolean
}

const lookOf = (agent: Agent): Look => {
  const s = agent.seed
  const pick = <T,>(arr: T[], k: number) => arr[(s >>> k) % arr.length]
  if (agent.role === 'waiter') return { skin: pick(SKIN, 3), hair: pick(HAIR, 7), top: M.shirt, bottom: M.pants, long: ((s >>> 11) & 3) === 0 }
  if (agent.role === 'cook') return { skin: pick(SKIN, 3), hair: pick(HAIR, 7), top: M.chef, bottom: M.chefPants, long: false }
  return { skin: pick(SKIN, 3), hair: pick(HAIR, 7), top: pick(TOPS, 13), bottom: pick(BOTTOMS, 19), long: ((s >>> 23) & 1) === 1 }
}

interface Props {
  agent: Agent
  highlight: boolean
  label?: string | null
  reduced: boolean
}

export const Character = memo(function Character({ agent, highlight, label, reduced }: Props) {
  const root = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const torso = useRef<THREE.Group>(null)
  const thighL = useRef<THREE.Group>(null)
  const thighR = useRef<THREE.Group>(null)
  const shinL = useRef<THREE.Group>(null)
  const shinR = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const plate = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const look = useMemo(() => lookOf(agent), [agent])
  const dotMat = useMemo(() => (agent.color ? cached(agent.color) : null), [agent.color])

  useFrame((state) => {
    const a = agent
    const r = root.current
    if (!r) return
    const e = 1 - (1 - Math.max(0, Math.min(1, a.appear))) ** 3
    r.position.set(a.x, 0, a.z)
    r.rotation.y = a.yaw
    r.scale.setScalar(Math.max(0.0001, e))
    r.visible = e > 0.01

    const p = a.phase
    const t = state.clock.elapsedTime
    let tl = 0
    let tr = 0
    let sl = 0
    let sr = 0
    let al = 0
    let ar = 0
    let by = 0
    let bz = 0
    let lean = 0
    if (a.pose === 'walk') {
      tl = Math.sin(p) * 0.5
      tr = -tl
      sl = 0.15 + Math.max(0, -Math.sin(p - 0.6)) * 0.55
      sr = 0.15 + Math.max(0, Math.sin(p - 0.6)) * 0.55
      al = -tl * 0.8
      ar = tl * 0.8
      by = Math.abs(Math.cos(p)) * 0.025
      lean = 0.05
    } else if (a.pose === 'sit') {
      tl = tr = -Math.PI / 2
      sl = sr = Math.PI / 2
      by = -0.33
      bz = -0.04
      // mains posées sur la table, petite respiration
      al = ar = -1.1 + (reduced ? 0 : Math.sin(t * 0.8 + a.seed) * 0.04)
    } else if (a.pose === 'work') {
      al = -1.0 + Math.sin(p) * 0.22
      ar = -1.0 - Math.sin(p) * 0.22
      lean = 0.18
    } else {
      // debout : légère respiration ; serveur penché vers la table pendant le service
      by = reduced ? 0 : Math.sin(t * 1.4 + a.seed) * 0.004
      lean = a.role === 'waiter' && a.mission?.tableId ? 0.14 : 0
    }
    if (a.carry) ar = -1.35
    thighL.current!.rotation.x = tl
    thighR.current!.rotation.x = tr
    shinL.current!.rotation.x = sl
    shinR.current!.rotation.x = sr
    armL.current!.rotation.x = al
    armR.current!.rotation.x = ar
    body.current!.position.set(0, by, bz)
    torso.current!.rotation.x = lean
    plate.current!.visible = a.carry
    if (ring.current) {
      ring.current.visible = highlight
      ;(ring.current.material as THREE.MeshBasicMaterial).opacity = reduced ? 0.6 : 0.45 + Math.sin(t * 3) * 0.15
    }
  })

  const isCook = agent.role === 'cook'
  const isWaiter = agent.role === 'waiter'

  return (
    <group ref={root}>
      {highlight && <mesh ref={ring} geometry={RING} material={M.ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} raycast={noop} />}
      <group ref={body}>
        {/* jambes : cuisse → genou → tibia */}
        {[
          [thighL, shinL, -0.075],
          [thighR, shinR, 0.075],
        ].map(([th, sh, x], i) => (
          <group key={i} ref={th as React.RefObject<THREE.Group>} position={[x as number, 0.8, 0]}>
            <Part m={look.bottom} p={[0, -0.2, 0]} s={[0.12, 0.4, 0.14]} />
            <group ref={sh as React.RefObject<THREE.Group>} position={[0, -0.4, 0]}>
              <Part m={look.bottom} p={[0, -0.18, 0]} s={[0.11, 0.36, 0.12]} />
              <Part m={M.shoe} p={[0, -0.37, 0.03]} s={[0.11, 0.06, 0.18]} />
            </group>
          </group>
        ))}
        <group ref={torso} position={[0, 0.82, 0]}>
          <Part m={look.bottom} p={[0, 0.03, 0]} s={[0.27, 0.12, 0.17]} />
          <Part m={look.top} p={[0, 0.28, 0]} s={[0.32, 0.44, 0.2]} shadow />
          {isWaiter && <Part m={M.apron} p={[0, -0.12, 0.105]} s={[0.3, 0.42, 0.02]} />}
          {isCook && <Part m={M.chef} p={[0, -0.1, 0.105]} s={[0.3, 0.38, 0.02]} />}
          {/* tête */}
          <Part m={look.skin} p={[0, 0.54, 0]} s={[0.06, 0.06, 0.06]} g={CYL} />
          <Part g={HEAD} m={look.skin} p={[0, 0.66, 0]} s={[0.22, 0.25, 0.22]} shadow />
          {isCook ? (
            <>
              <Part g={CYL} m={M.chef} p={[0, 0.83, 0]} s={[0.2, 0.14, 0.2]} />
              <Part g={CAP} m={M.chef} p={[0, 0.89, 0]} s={[0.26, 0.16, 0.26]} />
            </>
          ) : (
            <>
              <Part g={CAP} m={look.hair} p={[0, 0.68, -0.01]} s={[0.235, 0.2, 0.235]} />
              {look.long && <Part m={look.hair} p={[0, 0.6, -0.09]} s={[0.2, 0.2, 0.06]} />}
            </>
          )}
          {/* bras (pivot à l'épaule) */}
          <group ref={armL} position={[-0.2, 0.47, 0]}>
            <Part m={look.top} p={[0, -0.22, 0]} s={[0.085, 0.44, 0.1]} />
            <Part m={look.skin} p={[0, -0.47, 0]} s={[0.07, 0.07, 0.07]} />
          </group>
          <group ref={armR} position={[0.2, 0.47, 0]}>
            <Part m={look.top} p={[0, -0.22, 0]} s={[0.085, 0.44, 0.1]} />
            <Part m={look.skin} p={[0, -0.47, 0]} s={[0.07, 0.07, 0.07]} />
            <group ref={plate} position={[0, -0.5, 0.06]} visible={false}>
              <Part g={CYL} m={M.plate} p={[0, 0, 0.08]} s={[0.26, 0.02, 0.26]} />
              <Part g={CAP} m={M.food} p={[0, 0.01, 0.08]} s={[0.12, 0.06, 0.12]} />
            </group>
          </group>
        </group>
        {/* repère discret : couleur du membre de l'équipe */}
        {isWaiter && dotMat && <Part g={DOT} m={dotMat} p={[0, 1.86, 0]} s={[0.09, 0.09, 0.09]} />}
      </group>
      {label && (
        <Html position={[0, 2.45, 0]} center zIndexRange={[25, 0]} style={{ pointerEvents: 'none' }}>
          <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-ink/90 px-2 py-0.5 text-[10px] font-medium text-white shadow-float">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: agent.color }} />
            {label}
          </div>
        </Html>
      )}
    </group>
  )
})
