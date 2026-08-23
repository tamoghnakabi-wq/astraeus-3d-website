import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { STARS_FRAG, STARS_VERT } from './shaders'

/**
 * A spherical shell of shader points that follows the camera —
 * the sky never runs out no matter how far the journey travels.
 */
export function Starfield({ count = 6500 }: { count?: number }) {
  const group = useRef<THREE.Group>(null!)
  const mat = useRef<THREE.ShaderMaterial>(null!)

  const { positions, sizes, colors, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    const phases = new Float32Array(count)
    const color = new THREE.Color()

    for (let i = 0; i < count; i++) {
      // uniform direction, radius pushed outward for an even dome
      const u = Math.random() * 2 - 1
      const phi = Math.random() * Math.PI * 2
      const r = 70 + Math.pow(Math.random(), 0.6) * 85
      const s = Math.sqrt(1 - u * u)
      positions[i * 3] = s * Math.cos(phi) * r
      positions[i * 3 + 1] = u * r
      positions[i * 3 + 2] = s * Math.sin(phi) * r

      const m = Math.random()
      sizes[i] = m > 0.992 ? 3.4 : 0.5 + Math.pow(Math.random(), 2.2) * 2.0

      // stellar temperature mix: mostly white, some blue giants, some warm dwarfs
      const k = Math.random()
      if (k < 0.68) color.setRGB(0.92, 0.95, 1.0)
      else if (k < 0.86) color.setRGB(0.62, 0.74, 1.0)
      else color.setRGB(1.0, 0.85, 0.65)
      const v = 0.7 + Math.random() * 0.3
      colors[i * 3] = color.r * v
      colors[i * 3 + 1] = color.g * v
      colors[i * 3 + 2] = color.b * v

      phases[i] = Math.random() * Math.PI * 2
    }
    return { positions, sizes, colors, phases }
  }, [count])

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame((state) => {
    mat.current.uniforms.uTime.value = state.clock.elapsedTime
    group.current.position.copy(state.camera.position)
    group.current.rotation.y = state.clock.elapsedTime * 0.0035
  })

  return (
    <group ref={group}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
          <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
          <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={mat}
          vertexShader={STARS_VERT}
          fragmentShader={STARS_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
