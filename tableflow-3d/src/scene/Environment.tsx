import { memo, useMemo } from 'react'
import * as THREE from 'three'
import type { LayoutItem } from '../types'
import { M } from './materials'
import { BOX, C, PLANE } from './models'
import { worldAABB } from '../lib/layout'

const TREE = new THREE.SphereGeometry(0.5, 20, 14)
const treeMat = new THREE.MeshStandardMaterial({ color: '#9CC48A', roughness: 0.95 })
const trunkMat = new THREE.MeshStandardMaterial({ color: '#B39A7D', roughness: 0.9 })

const Tree = ({ x, z, s = 1 }: { x: number; z: number; s?: number }) => (
  <group position={[x, -0.12, z]} scale={s}>
    <C p={[0, 0.6, 0]} s={[0.16, 1.2, 0.16]} m={trunkMat} />
    <mesh geometry={TREE} material={treeMat} position={[0, 1.75, 0]} scale={[1.7, 1.8, 1.7]} castShadow />
  </group>
)

/** Sol, socle du bâtiment (calculé depuis les zones) et abords. */
export const Environment = memo(({ layout }: { layout: LayoutItem[] }) => {
  const slab = useMemo(() => {
    let minX = -10
    let maxX = 10
    let minZ = -7
    let maxZ = 5
    for (const it of layout) {
      if (it.kind !== 'zone' && it.kind !== 'wall') continue
      const r = worldAABB(it)
      minX = Math.min(minX, r.minX)
      maxX = Math.max(maxX, r.maxX)
      minZ = Math.min(minZ, r.minZ)
      maxZ = Math.max(maxZ, r.maxZ)
    }
    const m = 0.25
    return { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2, w: maxX - minX + m * 2, d: maxZ - minZ + m * 2, maxZ: maxZ + m, minX, maxX }
  }, [layout])

  return (
    <group>
      <mesh geometry={PLANE} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.125, 0]} scale={[90, 90, 1]} material={M.ground} receiveShadow />
      {/* socle */}
      <mesh geometry={BOX} position={[slab.x, -0.065, slab.z]} scale={[slab.w, 0.13, slab.d]} material={M.white} receiveShadow castShadow />
      {/* trottoir */}
      <mesh geometry={BOX} position={[slab.x, -0.11, slab.maxZ + 1.4]} scale={[slab.w + 6, 0.03, 2.2]} material={M.sidewalk} receiveShadow />
      <mesh geometry={BOX} position={[slab.x, -0.1, slab.maxZ + 0.32]} scale={[slab.w + 6, 0.05, 0.12]} material={M.wallSide} receiveShadow />
      <Tree x={slab.minX - 2.2} z={-4.5} s={1.05} />
      <Tree x={slab.minX - 2.6} z={1.5} s={0.9} />
      <Tree x={slab.maxX + 2.3} z={-3.2} s={1} />
      <Tree x={slab.maxX + 2.6} z={3.6} s={0.85} />
      <Tree x={slab.minX + 1} z={slab.maxZ + 1.5} s={0.8} />
      <Tree x={slab.maxX - 1} z={slab.maxZ + 1.5} s={0.8} />
    </group>
  )
})

export function Lights({ quality }: { quality: 'high' | 'balanced' }) {
  const size = quality === 'high' ? 2048 : 1024
  return (
    <>
      <ambientLight intensity={0.95} color="#FFF8EE" />
      <hemisphereLight args={['#FFFFFF', '#E6DCCB', 0.9]} />
      <directionalLight
        castShadow
        position={[10, 24, 14]}
        intensity={2.1}
        color="#FFF3E2"
        shadow-mapSize={[size, size]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={4}
      />
      <directionalLight position={[-12, 10, -6]} intensity={0.35} color="#EAF0FF" />
    </>
  )
}
