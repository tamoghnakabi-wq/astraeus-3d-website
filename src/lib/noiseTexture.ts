import * as THREE from 'three'
import { BAKE_VERT, NOISE_GLSL } from '@/components/three/shaders'

// One shared tile per renderer.
const cache = new WeakMap<THREE.WebGLRenderer, THREE.Texture>()

const FBM_TILE_FRAG = /* glsl */ `
#define OCTAVES 4
varying vec2 vUv;
${NOISE_GLSL}
void main(){
  // two fbm fields at different frequencies, packed into R/G,
  // remapped from ~[-0.75, 0.75] into [0, 1]
  float a = fbm(vec3(vUv * 2.3, 1.7));
  float b = fbm(vec3(vUv * 4.6, 7.3));
  gl_FragColor = vec4(a * 0.66 + 0.5, b * 0.66 + 0.5, 0.0, 1.0);
}
`

/**
 * A 512² fbm tile baked once at startup. Mirrored-repeat wrapping makes the
 * (non-tileable) noise seamless in practice — the nebula sprites sample this
 * with per-sprite offsets instead of evaluating simplex noise per fragment.
 */
export function getFbmTexture(gl: THREE.WebGLRenderer): THREE.Texture {
  const cached = cache.get(gl)
  if (cached) return cached

  const size = 512
  const target = new THREE.WebGLRenderTarget(size, size, {
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.MirroredRepeatWrapping,
    wrapT: THREE.MirroredRepeatWrapping,
  })

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const geometry = new THREE.PlaneGeometry(2, 2)
  const material = new THREE.ShaderMaterial({
    vertexShader: BAKE_VERT,
    fragmentShader: FBM_TILE_FRAG,
    depthWrite: false,
    depthTest: false,
  })
  scene.add(new THREE.Mesh(geometry, material))

  const prev = gl.getRenderTarget()
  gl.setRenderTarget(target)
  gl.render(scene, camera)
  gl.setRenderTarget(prev)

  geometry.dispose()
  material.dispose()
  cache.set(gl, target.texture)
  return target.texture
}
