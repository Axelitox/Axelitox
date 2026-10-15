import * as THREE from 'three'

// Matériaux partagés : un seul jeu pour toute la scène (moins de compilations de shaders).
const std = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...extra })

export const M = {
  white: std('#FBFAF7'),
  wall: std('#F4F1EA'),
  wallSide: std('#E9E5DC'),
  red: std('#D84A42', { roughness: 0.6 }),
  redDark: std('#BB3834', { roughness: 0.6 }),
  upholstery: std('#B9433C', { roughness: 0.95 }),
  wood: std('#D4B995', { roughness: 0.8 }),
  woodDark: std('#B89C78', { roughness: 0.8 }),
  grey: std('#B8BBB8', { roughness: 0.7 }),
  greyDark: std('#7E827F', { roughness: 0.6 }),
  metal: std('#C9CCCB', { roughness: 0.35, metalness: 0.5 }),
  steel: std('#D7DADA', { roughness: 0.3, metalness: 0.55 }),
  black: std('#3A3A3A', { roughness: 0.7 }),
  stone: std('#E8E4DC', { roughness: 0.6 }),
  leaf: std('#86AE72', { roughness: 0.9, flatShading: true }),
  leafDark: std('#6E9A60', { roughness: 0.9, flatShading: true }),
  pot: std('#E6DFD3', { roughness: 0.9 }),
  terracotta: std('#C98B6B', { roughness: 0.9 }),
  canvas: std('#F7F2E8', { roughness: 0.95, side: THREE.DoubleSide }),
  glass: new THREE.MeshStandardMaterial({
    color: '#CFE2E6',
    transparent: true,
    opacity: 0.28,
    roughness: 0.1,
    metalness: 0.1,
    depthWrite: false,
  }),
  bulb: new THREE.MeshStandardMaterial({ color: '#FFE6B8', emissive: '#FFD08A', emissiveIntensity: 1.4 }),
  bottleGreen: std('#5C7F63', { roughness: 0.3 }),
  bottleAmber: std('#B98A4E', { roughness: 0.3 }),
  bottleClear: std('#DDE6E2', { roughness: 0.3 }),
  plate: std('#FFFFFF', { roughness: 0.4 }),
  ground: std('#ECE8E0', { roughness: 1 }),
  sidewalk: std('#E1DDD4', { roughness: 1 }),
}

// ─── Textures procédurales (pas de fichiers externes) ──────────────────────

const canvasTex = (size: number, draw: (c: CanvasRenderingContext2D, s: number) => void, repeat = 1) => {
  const cv = document.createElement('canvas')
  cv.width = cv.height = size
  const ctx = cv.getContext('2d')!
  draw(ctx, size)
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat, repeat)
  t.anisotropy = 4
  return t
}

const noise = (c: CanvasRenderingContext2D, s: number, amount: number, alpha: number) => {
  for (let i = 0; i < amount; i++) {
    const v = Math.random() > 0.5 ? 255 : 0
    c.fillStyle = `rgba(${v},${v},${v},${Math.random() * alpha})`
    c.fillRect(Math.random() * s, Math.random() * s, 1.5, 1.5)
  }
}

const floorTextures: Partial<Record<string, THREE.Texture>> = {}

/** Texture de sol par type de zone. 1 répétition = 2 m. */
export const floorTexture = (type: string) => {
  if (floorTextures[type]) return floorTextures[type]!
  let t: THREE.Texture
  if (type === 'cuisine') {
    t = canvasTex(256, (c, s) => {
      c.fillStyle = '#E6E7E4'
      c.fillRect(0, 0, s, s)
      c.strokeStyle = 'rgba(120,125,125,0.22)'
      c.lineWidth = 2
      const n = 8
      for (let i = 0; i <= n; i++) {
        c.beginPath()
        c.moveTo((i * s) / n, 0)
        c.lineTo((i * s) / n, s)
        c.moveTo(0, (i * s) / n)
        c.lineTo(s, (i * s) / n)
        c.stroke()
      }
      noise(c, s, 1500, 0.05)
    })
  } else if (type === 'terrasse') {
    t = canvasTex(256, (c, s) => {
      c.fillStyle = '#E3D6C1'
      c.fillRect(0, 0, s, s)
      const n = 10
      for (let i = 0; i < n; i++) {
        c.fillStyle = i % 2 ? 'rgba(160,130,95,0.06)' : 'rgba(255,255,255,0.08)'
        c.fillRect(0, (i * s) / n, s, s / n)
        c.fillStyle = 'rgba(120,95,70,0.25)'
        c.fillRect(0, (i * s) / n, s, 1.5)
      }
      noise(c, s, 2000, 0.05)
    })
  } else if (type === 'bar') {
    t = canvasTex(256, (c, s) => {
      c.fillStyle = '#ECE6DC'
      c.fillRect(0, 0, s, s)
      c.strokeStyle = 'rgba(150,130,110,0.18)'
      c.lineWidth = 1.5
      for (let i = 0; i <= 4; i++) {
        c.beginPath()
        c.moveTo((i * s) / 4, 0)
        c.lineTo((i * s) / 4, s)
        c.moveTo(0, (i * s) / 4)
        c.lineTo(s, (i * s) / 4)
        c.stroke()
      }
      noise(c, s, 3000, 0.06)
    })
  } else {
    // parquet clair à bâtons rompus simplifié
    t = canvasTex(512, (c, s) => {
      c.fillStyle = '#EFE5D6'
      c.fillRect(0, 0, s, s)
      const rows = 16
      const h = s / rows
      for (let r = 0; r < rows; r++) {
        const off = (r % 2) * (s / 6)
        for (let x = -off; x < s; x += s / 3) {
          const tone = 0.03 + Math.random() * 0.05
          c.fillStyle = `rgba(170,135,95,${tone})`
          c.fillRect(x, r * h, s / 3, h)
          c.fillStyle = 'rgba(140,110,80,0.18)'
          c.fillRect(x, r * h, 1, h)
        }
        c.fillStyle = 'rgba(140,110,80,0.16)'
        c.fillRect(0, r * h, s, 1)
      }
      noise(c, s, 4000, 0.04)
    })
  }
  floorTextures[type] = t
  return t
}

const labelCache = new Map<string, THREE.Texture>()

/** Texte "peint au sol" (façon marquage des références). */
export const labelTexture = (text: string, color = 'rgba(70,70,70,0.55)') => {
  const key = `${text}|${color}`
  if (labelCache.has(key)) return labelCache.get(key)!
  const cv = document.createElement('canvas')
  cv.width = 1024
  cv.height = 128
  const c = cv.getContext('2d')!
  c.clearRect(0, 0, cv.width, cv.height)
  c.font = '800 84px Inter, system-ui, sans-serif'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillStyle = color
  // espacement des lettres
  const spaced = text.toUpperCase().split('').join(' ')
  c.fillText(spaced, cv.width / 2, cv.height / 2 + 4)
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  labelCache.set(key, t)
  return t
}
