import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MOON_POS, MOON_RADIUS, RANGES } from '@/data/journey'
import { scrollProgress } from '@/store/useStore'
import { fbm3 } from '@/lib/noise'

/**
 * Scene 03 — Luna. Geometry is displaced once on the CPU: fbm relief plus a
 * field of analytic craters (smooth pit + raised rim), tinted by vertex color.
 * Selene Station sits on the camera-facing slope.
 */

function buildMoonGeometry(segments: number) {
  const geo = new THREE.SphereGeometry(MOON_RADIUS, segments, segments)
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)

  // crater field — deterministic so every visit looks the same
  const craters: { dir: THREE.Vector3; r: number; depth: number }[] = []
  let seed = 42
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let i = 0; i < 34; i++) {
    craters.push({
      dir: new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize(),
      r: 0.05 + rand() * 0.16,
      depth: 0.012 + rand() * 0.03,
    })
  }

  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize()

    let h = fbm3(v.x * 3.2, v.y * 3.2, v.z * 3.2, 4) * 0.035

    for (const c of craters) {
      const ang = v.angleTo(c.dir)
      if (ang < c.r) {
        const k = ang / c.r
        h -= (1 - k * k) * (1 - k * k) * c.depth // bowl
      } else if (ang < c.r * 1.35) {
        const k = (ang - c.r) / (c.r * 0.35)
        h += Math.sin((1 - k) * Math.PI) * c.depth * 0.35 // rim
      }
    }

    const r = MOON_RADIUS * (1 + h)
    pos.setXYZ(i, v.x * r, v.y * r, v.z * r)

    const tone = 0.62 + h * 5.2 + fbm3(v.x * 9, v.y * 9, v.z * 9, 3) * 0.1
    colors[i * 3] = tone
    colors[i * 3 + 1] = tone * 1.005
    colors[i * 3 + 2] = tone * 1.04
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  return geo
}

function SeleneStation() {
  const rover = useRef<THREE.Group>(null!)

  useFrame((state) => {
    // rover patrols a small arc in front of the base
    const t = state.clock.elapsedTime * 0.12
    rover.current.position.set(Math.sin(t) * 0.55, 0, 0.42 + Math.cos(t * 0.8) * 0.1)
    rover.current.rotation.y = Math.cos(t) * 0.6
  })

  return (
    <group>
      {/* landing pad */}
      <mesh position={[0.55, 0.005, -0.3]}>
        <cylinderGeometry args={[0.22, 0.24, 0.02, 24]} />
        <meshStandardMaterial color="#3c4048" roughness={0.9} />
      </mesh>
      {/* habitat domes with warm interior glow */}
      {[
        [0, 0, 0, 0.2],
        [-0.32, 0, 0.12, 0.14],
        [-0.13, 0, -0.26, 0.11],
      ].map(([x, , z, r], i) => (
        <group key={i} position={[x as number, 0, z as number]}>
          <mesh>
            <sphereGeometry args={[r as number, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#d7dce6" metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <sphereGeometry args={[(r as number) * 0.55, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#1b1d24" emissive="#ffb45e" emissiveIntensity={1.05} />
          </mesh>
        </group>
      ))}
      {/* connecting tubes */}
      <mesh position={[-0.16, 0.035, 0.07]} rotation={[0, 0.4, Math.PI / 2]}>
        <cylinderGeometry args={[0.028, 0.028, 0.3, 12]} />
        <meshStandardMaterial color="#b9bfcc" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[-0.08, 0.035, -0.14]} rotation={[Math.PI / 2, 0, 0.5]}>
        <cylinderGeometry args={[0.024, 0.024, 0.28, 12]} />
        <meshStandardMaterial color="#b9bfcc" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* comms mast */}
      <group position={[0.18, 0, 0.18]}>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.008, 0.012, 0.28, 8]} />
          <meshStandardMaterial color="#8a909c" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.29, 0]}>
          <sphereGeometry args={[0.018, 10, 10]} />
          <meshStandardMaterial color="#fff" emissive="#ff4734" emissiveIntensity={3.4} />
        </mesh>
      </group>
      {/* rover */}
      <group ref={rover} scale={0.55}>
        <mesh position={[0, 0.045, 0]}>
          <boxGeometry args={[0.12, 0.05, 0.08]} />
          <meshStandardMaterial color="#cfd5e0" metalness={0.5} roughness={0.45} />
        </mesh>
        {[-0.045, 0.045].map((x) =>
          [-0.035, 0.035].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.02, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.015, 12]} />
              <meshStandardMaterial color="#2a2d34" roughness={0.9} />
            </mesh>
          )),
        )}
        <mesh position={[0.03, 0.09, 0]}>
          <boxGeometry args={[0.03, 0.03, 0.03]} />
          <meshStandardMaterial color="#1c2a4a" emissive="#6fe3ff" emissiveIntensity={1.2} />
        </mesh>
      </group>
      {/* warm site floodlight */}
      <pointLight position={[0, 0.5, 0.4]} intensity={0.9} distance={2.6} decay={2} color="#ffd9a8" />
    </group>
  )
}

export function MoonScene({ detail = 128 }: { detail?: number }) {
  const group = useRef<THREE.Group>(null!)
  const geometry = useMemo(() => buildMoonGeometry(detail), [detail])

  // anchor the base on the camera-facing hemisphere
  const baseAnchor = useMemo(() => {
    const dir = new THREE.Vector3(0.12, 0.42, 1).normalize()
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    return { pos: dir.multiplyScalar(MOON_RADIUS * 1.0), quat: q }
  }, [])

  useFrame(() => {
    const p = scrollProgress.get()
    group.current.visible = p >= RANGES.moon.start && p <= RANGES.moon.end
  })

  return (
    <group ref={group} position={MOON_POS}>
      <mesh geometry={geometry}>
        <meshStandardMaterial vertexColors color="#9fa3ab" roughness={0.96} metalness={0.02} />
      </mesh>
      <group position={baseAnchor.pos} quaternion={baseAnchor.quat} scale={0.85}>
        <SeleneStation />
      </group>
      {/* camera-side fills (pointLights — a nested directionalLight would aim
          at the world origin, not at this scene) */}
      <pointLight position={[3.5, 2.5, 9]} intensity={1.15} decay={0} color="#aebad6" />
      <pointLight position={[-7, 4, 5]} intensity={0.5} decay={0} color="#d8c8b0" />
    </group>
  )
}
