import * as THREE from 'three'

/**
 * Procedural sprite textures generated on a canvas at startup —
 * keeps the build asset-free while giving particles soft, organic falloff.
 */

function makeCanvas(size: number) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  return canvas
}

let softCircle: THREE.Texture | null = null

/** Soft radial gradient — smoke puffs, glows, halos. */
export function getSoftCircleTexture(): THREE.Texture {
  if (softCircle) return softCircle
  const size = 128
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.55)')
  g.addColorStop(0.7, 'rgba(255,255,255,0.12)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  softCircle = new THREE.CanvasTexture(canvas)
  return softCircle
}

let flare: THREE.Texture | null = null

/** Bright core with horizontal streak — used for the distant sun flare. */
export function getFlareTexture(): THREE.Texture {
  if (flare) return flare
  const size = 256
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')!
  const c = size / 2

  const core = ctx.createRadialGradient(c, c, 0, c, c, c * 0.5)
  core.addColorStop(0, 'rgba(255,250,240,1)')
  core.addColorStop(0.25, 'rgba(255,235,200,0.8)')
  core.addColorStop(1, 'rgba(255,220,180,0)')
  ctx.fillStyle = core
  ctx.fillRect(0, 0, size, size)

  // horizontal anamorphic streak
  const streak = ctx.createLinearGradient(0, c, size, c)
  streak.addColorStop(0, 'rgba(160,190,255,0)')
  streak.addColorStop(0.5, 'rgba(190,215,255,0.55)')
  streak.addColorStop(1, 'rgba(160,190,255,0)')
  ctx.fillStyle = streak
  ctx.fillRect(0, c - 2, size, 4)

  const vstreak = ctx.createLinearGradient(c, 0, c, size)
  vstreak.addColorStop(0, 'rgba(255,235,200,0)')
  vstreak.addColorStop(0.5, 'rgba(255,240,215,0.35)')
  vstreak.addColorStop(1, 'rgba(255,235,200,0)')
  ctx.fillStyle = vstreak
  ctx.fillRect(c - 1.5, 0, 3, size)

  flare = new THREE.CanvasTexture(canvas)
  return flare
}
