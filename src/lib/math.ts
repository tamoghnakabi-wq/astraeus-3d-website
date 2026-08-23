/** Small math helpers shared between the DOM and the 3D layer. */

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Remap v from [inMin, inMax] into [0, 1], clamped. */
export const range = (v: number, inMin: number, inMax: number) =>
  clamp((v - inMin) / (inMax - inMin))

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

export const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

/** Frame-rate independent exponential damping (same shape as THREE.MathUtils.damp). */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt))
