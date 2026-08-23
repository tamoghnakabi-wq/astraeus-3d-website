import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MARS_POS, MARS_RADIUS, RANGES, SUN_DIR } from '@/data/journey'
import { scrollProgress } from '@/store/useStore'
import { fbm3, ridged3 } from '@/lib/noise'
import { ATMOSPHERE_FRAG, ATMOSPHERE_VERT } from '../shaders'

/**
 * Scene 04 — Mars. CPU-displaced terrain with ridged highlands, a canyon
 * system, polar caps, and Ares Base glowing on the sunward face.
 */

function buildMarsGeometry(segments: number) {
  const geo = new THREE.SphereGeometry(MARS_RADIUS, segments, segments)
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)

  const canyonAxis = new THREE.Vector3(0.3, 0.85, 0.1).normalize()
  const lowland = new THREE.Color('#5d2a16')
  const midland = new THREE.Color('#a14a26')
  const highland = new THREE.Color('#c97c4b')
  const cap = new THREE.Color('#e8e2d8')
  const c = new THREE.Color()

  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize()

    let h = fbm3(v.x * 2.4, v.y * 2.4, v.z * 2.4, 4) * 0.03
    h += (ridged3(v.x * 4.2, v.y * 4.2, v.z * 4.2, 4) - 0.55) * 0.022

    // Valles-style canyon along a great circle
    const band = Math.abs(v.dot(canyonAxis))
    if (band < 0.1) {
      const k = 1 - band / 0.1
      h -= k * k * 0.035 * (0.5 + fbm3(v.x * 6, v.y * 6, v.z * 6, 3) * 0.5 + 0.5)
    }

    const r = MARS_RADIUS * (1 + h)
    pos.setXYZ(i, v.x * r, v.y * r, v.z * r)

    const hn = THREE.MathUtils.clamp((h + 0.04) / 0.09, 0, 1)
    if (hn < 0.45) c.copy(lowland).lerp(midland, hn / 0.45)
    else c.copy(midland).lerp(highland, (hn - 0.45) / 0.55)

    // polar ice
    const ice = THREE.MathUtils.smoothstep(Math.abs(v.y), 0.86, 0.93)
    c.lerp(cap, ice)

    const dust = 0.9 + fbm3(v.x * 11, v.y * 11, v.z * 11, 3) * 0.18
    colors[i * 3] = c.r * dust
    colors[i * 3 + 1] = c.g * dust
    colors[i * 3 + 2] = c.b * dust
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  return geo
}

function AresBase() {
  const processors = useRef<THREE.Group>(null!)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    processors.current.children.forEach((stack, i) => {
      const ring = (stack as THREE.Group).children[1] as THREE.Mesh
      const m = ring.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 1.6 + Math.sin(t * 1.4 + i * 2.1) * 0.8
    })
  })

  return (
    <group>
      {/* pressurized domes */}
      {[
        [0, 0, 0.26],
        [-0.42, 0.16, 0.2],
        [0.3, -0.3, 0.17],
      ].map(([x, z, r], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh>
            <sphereGeometry args={[r, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshPhysicalMaterial
              color="#cfd8e8"
              metalness={0.1}
              roughness={0.18}
              transparent
              opacity={0.32}
              clearcoat={1}
            />
          </mesh>
          {/* interior blocks glowing through the glass */}
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[r * 0.7, r * 0.45, r * 0.7]} />
            <meshStandardMaterial color="#23150e" emissive="#ffc06a" emissiveIntensity={1.05} />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, r * 0.06, 10, 32]} />
            <meshStandardMaterial color="#8e9aad" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      ))}
      {/* greenhouse rows */}
      {[0.18, 0.3].map((z, i) => (
        <mesh key={i} position={[-0.12, 0.025, -z]} rotation={[0, 0.2, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 0.42, 12]} />
          <meshStandardMaterial color="#1a2e1c" emissive="#4dffa1" emissiveIntensity={0.55} transparent opacity={0.85} />
        </mesh>
      ))}
      {/* solar farm */}
      <group position={[0.52, 0, -0.18]} rotation={[0, -0.4, 0]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[(i % 4) * 0.13, 0.035, Math.floor(i / 4) * 0.16]} rotation={[-0.5, 0, 0]}>
            <boxGeometry args={[0.1, 0.006, 0.12]} />
            <meshStandardMaterial color="#16305c" metalness={0.6} roughness={0.3} emissive="#234b8f" emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>
      {/* atmospheric processors — the terraforming stacks */}
      <group ref={processors}>
        {[
          [-0.62, -0.3],
          [0.58, 0.34],
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.16, 0]}>
              <cylinderGeometry args={[0.05, 0.075, 0.34, 16]} />
              <meshStandardMaterial color="#7d8694" metalness={0.75} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.052, 0.012, 8, 24]} />
              <meshStandardMaterial color="#0d2b2e" emissive="#43e8d8" emissiveIntensity={2} />
            </mesh>
          </group>
        ))}
      </group>
      <pointLight position={[0, 0.6, 0]} intensity={1.1} distance={2.8} decay={2} color="#ffc89a" />
    </group>
  )
}

export function MarsScene({ detail = 112 }: { detail?: number }) {
  const group = useRef<THREE.Group>(null!)
  const geometry = useMemo(() => buildMarsGeometry(detail), [detail])

  const hazeUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color('#e07a4a') },
      uLightDir: { value: new THREE.Vector3(...SUN_DIR) },
      uCamPos: { value: new THREE.Vector3() },
      uPower: { value: 4.2 },
      uIntensity: { value: 0.5 },
    }),
    [],
  )

  // Ares Base on the camera-facing slope
  const baseAnchor = useMemo(() => {
    const dir = new THREE.Vector3(0.05, 0.5, 1).normalize()
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    return { pos: dir.multiplyScalar(MARS_RADIUS * 1.005), quat: q }
  }, [])

  useFrame((state) => {
    const p = scrollProgress.get()
    group.current.visible = p >= RANGES.mars.start && p <= RANGES.mars.end
    if (!group.current.visible) return
    hazeUniforms.uCamPos.value.copy(state.camera.position)
  })

  return (
    <group ref={group} position={MARS_POS}>
      <mesh geometry={geometry}>
        <meshStandardMaterial vertexColors color="#c08562" roughness={0.92} metalness={0.02} />
      </mesh>
      {/* thin CO₂ haze */}
      <mesh>
        <sphereGeometry args={[MARS_RADIUS * 1.09, 48, 48]} />
        <shaderMaterial
          vertexShader={ATMOSPHERE_VERT}
          fragmentShader={ATMOSPHERE_FRAG}
          uniforms={hazeUniforms}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <group position={baseAnchor.pos} quaternion={baseAnchor.quat} scale={0.85}>
        <AresBase />
      </group>
      {/* camera-side fills (pointLights — nested directionals aim at world origin) */}
      <pointLight position={[4, 3, 9]} intensity={1.05} decay={0} color="#e8b49a" />
      <pointLight position={[-5, 1.5, 5]} intensity={0.45} decay={0} color="#b87c5a" />
    </group>
  )
}
