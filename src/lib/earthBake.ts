import * as THREE from 'three'
import {
  BAKE_VERT,
  EARTH_BAKE_ALBEDO_FRAG,
  EARTH_BAKE_LIGHTS_FRAG,
  withNoise,
} from '@/components/three/shaders'

export interface EarthMaps {
  /** rgb: albedo · a: ocean specular mask (equirect) */
  map: THREE.Texture
  /** r: city-light intensity (equirect, half res) */
  aux: THREE.Texture
}

// One bake per renderer — survives StrictMode double-invocation without
// leaking render targets.
const cache = new WeakMap<THREE.WebGLRenderer, EarthMaps>()

/**
 * Renders the procedural Earth surface into equirect textures, once.
 * Costs roughly one hero-frame of GPU time at startup (behind the loader)
 * and removes all per-frame noise evaluation from the planet shader.
 */
export function bakeEarthMaps(gl: THREE.WebGLRenderer, width = 2048): EarthMaps {
  const cached = cache.get(gl)
  if (cached) return cached

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const geometry = new THREE.PlaneGeometry(2, 2)
  const prevTarget = gl.getRenderTarget()

  const bakePass = (fragment: string, w: number, h: number): THREE.Texture => {
    const target = new THREE.WebGLRenderTarget(w, h, {
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping, // seamless across the antimeridian
      wrapT: THREE.ClampToEdgeWrapping,
    })
    const material = new THREE.ShaderMaterial({
      vertexShader: BAKE_VERT,
      fragmentShader: withNoise(fragment, 5),
      depthWrite: false,
      depthTest: false,
    })
    const quad = new THREE.Mesh(geometry, material)
    scene.add(quad)
    gl.setRenderTarget(target)
    gl.render(scene, camera)
    scene.remove(quad)
    material.dispose()
    return target.texture
  }

  const maps: EarthMaps = {
    map: bakePass(EARTH_BAKE_ALBEDO_FRAG, width, width / 2),
    aux: bakePass(EARTH_BAKE_LIGHTS_FRAG, width / 2, width / 4),
  }

  gl.setRenderTarget(prevTarget)
  geometry.dispose()
  cache.set(gl, maps)
  return maps
}
