/**
 * Compact CPU-side 3D value noise + fbm.
 * Used once at mount time to displace planet geometry (Moon craters, Mars terrain) —
 * never in the per-frame path, so clarity beats raw speed here.
 */

const hash3 = (x: number, y: number, z: number) => {
  let h = x * 374761393 + y * 668265263 + z * 2147483647
  h = (h ^ (h >> 13)) * 1274126177
  h = h ^ (h >> 16)
  // map to [-1, 1]
  return ((h >>> 0) % 2048) / 1024 - 1
}

const fade = (t: number) => t * t * (3 - 2 * t)

export function valueNoise3(x: number, y: number, z: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const zi = Math.floor(z)
  const xf = x - xi
  const yf = y - yi
  const zf = z - zi
  const u = fade(xf)
  const v = fade(yf)
  const w = fade(zf)

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  const c000 = hash3(xi, yi, zi)
  const c100 = hash3(xi + 1, yi, zi)
  const c010 = hash3(xi, yi + 1, zi)
  const c110 = hash3(xi + 1, yi + 1, zi)
  const c001 = hash3(xi, yi, zi + 1)
  const c101 = hash3(xi + 1, yi, zi + 1)
  const c011 = hash3(xi, yi + 1, zi + 1)
  const c111 = hash3(xi + 1, yi + 1, zi + 1)

  return lerp(
    lerp(lerp(c000, c100, u), lerp(c010, c110, u), v),
    lerp(lerp(c001, c101, u), lerp(c011, c111, u), v),
    w,
  )
}

export function fbm3(x: number, y: number, z: number, octaves = 4): number {
  let value = 0
  let amplitude = 0.5
  let fx = x
  let fy = y
  let fz = z
  for (let i = 0; i < octaves; i++) {
    value += amplitude * valueNoise3(fx, fy, fz)
    fx *= 2.03
    fy *= 2.03
    fz *= 2.03
    amplitude *= 0.5
  }
  return value
}

/** Ridged fbm — sharp crests, good for canyon walls and mountain ridges. */
export function ridged3(x: number, y: number, z: number, octaves = 4): number {
  let value = 0
  let amplitude = 0.5
  let fx = x
  let fy = y
  let fz = z
  for (let i = 0; i < octaves; i++) {
    value += amplitude * (1 - Math.abs(valueNoise3(fx, fy, fz)))
    fx *= 2.1
    fy *= 2.1
    fz *= 2.1
    amplitude *= 0.5
  }
  return value
}
