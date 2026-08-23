import { useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EARTH_POS, EARTH_RADIUS, RANGES, SUN_DIR } from '@/data/journey'
import { scrollProgress } from '@/store/useStore'
import { bakeEarthMaps } from '@/lib/earthBake'
import {
  ATMOSPHERE_FRAG,
  ATMOSPHERE_VERT,
  CLOUDS_FRAG,
  EARTH_FRAG,
  EARTH_VERT,
  withNoise,
} from '../shaders'

/**
 * Hero Earth. The surface (continents, biomes, ice, city lights) is baked to
 * equirect textures once at startup — the per-frame shader is two texture
 * taps + lighting, so the planet costs almost nothing even at full screen.
 * Only the drifting cloud deck still evaluates noise per frame (3 octaves).
 */
export function EarthScene({ bakeSize = 2048 }: { bakeSize?: number }) {
  const group = useRef<THREE.Group>(null!)
  const earth = useRef<THREE.Mesh>(null!)
  const clouds = useRef<THREE.Mesh>(null!)
  const gl = useThree((s) => s.gl)

  // lazy state init = bake exactly once, before the first painted frame
  // (the WeakMap cache in bakeEarthMaps absorbs StrictMode double-invokes)
  const [maps] = useState(() => bakeEarthMaps(gl, bakeSize))

  const earthUniforms = useMemo(
    () => ({
      uLightDir: { value: new THREE.Vector3(...SUN_DIR) },
      uCamPos: { value: new THREE.Vector3() },
      uMap: { value: maps.map },
      uAux: { value: maps.aux },
    }),
    [maps],
  )
  const cloudUniforms = useMemo(
    () => ({
      uLightDir: { value: new THREE.Vector3(...SUN_DIR) },
      uCamPos: { value: new THREE.Vector3() },
      uTime: { value: 0 },
    }),
    [],
  )
  const atmoUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color('#3f7ef0') },
      uLightDir: { value: new THREE.Vector3(...SUN_DIR) },
      uCamPos: { value: new THREE.Vector3() },
      uPower: { value: 3.4 },
      uIntensity: { value: 1.0 },
    }),
    [],
  )

  const cloudsFrag = useMemo(() => withNoise(CLOUDS_FRAG, 3), [])

  useFrame((state, delta) => {
    const p = scrollProgress.get()
    group.current.visible = p <= RANGES.earth.end
    if (!group.current.visible) return

    earth.current.rotation.y += delta * 0.012
    clouds.current.rotation.y += delta * 0.017
    cloudUniforms.uTime.value = state.clock.elapsedTime
    earthUniforms.uCamPos.value.copy(state.camera.position)
    cloudUniforms.uCamPos.value.copy(state.camera.position)
    atmoUniforms.uCamPos.value.copy(state.camera.position)
  })

  return (
    <group ref={group} position={EARTH_POS}>
      <mesh ref={earth}>
        <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
        <shaderMaterial vertexShader={EARTH_VERT} fragmentShader={EARTH_FRAG} uniforms={earthUniforms} />
      </mesh>

      <mesh ref={clouds}>
        <sphereGeometry args={[EARTH_RADIUS * 1.014, 56, 56]} />
        <shaderMaterial
          vertexShader={EARTH_VERT}
          fragmentShader={cloudsFrag}
          uniforms={cloudUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* additive halo shell — drawn back-side so the glow hugs the limb */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS * 1.13, 48, 48]} />
        <shaderMaterial
          vertexShader={ATMOSPHERE_VERT}
          fragmentShader={ATMOSPHERE_FRAG}
          uniforms={atmoUniforms}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
