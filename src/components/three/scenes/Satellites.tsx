import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { EARTH_POS, EARTH_RADIUS, RANGES } from '@/data/journey'
import { scrollProgress } from '@/store/useStore'

interface Orbit {
  radius: number
  speed: number
  phase: number
  /** orthonormal basis of the orbital plane */
  u: THREE.Vector3
  v: THREE.Vector3
  spin: number
}

function makeOrbit(radius: number, speed: number): Orbit {
  const normal = new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() * 0.9 + 0.25,
    Math.random() - 0.5,
  ).normalize()
  const u = new THREE.Vector3(1, 0, 0).cross(normal)
  if (u.lengthSq() < 0.01) u.set(0, 0, 1).cross(normal)
  u.normalize()
  const v = new THREE.Vector3().crossVectors(normal, u)
  return { radius, speed, phase: Math.random() * Math.PI * 2, u, v, spin: Math.random() * Math.PI * 2 }
}

const SAT_COUNT = 14

/**
 * The orbital shell: instanced satellites on inclined orbits, a drifting
 * debris field, comm-burst arcs, and a modular space station.
 */
export function Satellites() {
  const group = useRef<THREE.Group>(null!)
  const bodies = useRef<THREE.InstancedMesh>(null!)
  const panels = useRef<THREE.InstancedMesh>(null!)
  const station = useRef<THREE.Group>(null!)
  const debris = useRef<THREE.Points>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const orbits = useMemo(
    () =>
      Array.from({ length: SAT_COUNT }, (_, i) =>
        makeOrbit(EARTH_RADIUS + 0.5 + (i / SAT_COUNT) * 1.0, 0.05 + Math.random() * 0.1),
      ),
    [],
  )
  // Station rides a fixed orbit in the plane facing the hero camera — it rings
  // the visible disk and never crosses between the lens and the planet.
  const stationOrbit = useMemo<Orbit>(() => {
    const normal = new THREE.Vector3(0, 0.49, 0.87).normalize()
    const u = new THREE.Vector3(1, 0, 0).cross(normal).normalize()
    const v = new THREE.Vector3().crossVectors(normal, u)
    return { radius: EARTH_RADIUS + 0.9, speed: 0.03, phase: 0.8, u, v, spin: 0 }
  }, [])

  const debrisPositions = useMemo(() => {
    const n = 150
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const u = Math.random() * 2 - 1
      const phi = Math.random() * Math.PI * 2
      const r = EARTH_RADIUS + 0.4 + Math.random() * 1.9
      const s = Math.sqrt(1 - u * u)
      arr[i * 3] = s * Math.cos(phi) * r
      arr[i * 3 + 1] = u * r * 0.7
      arr[i * 3 + 2] = s * Math.sin(phi) * r
    }
    return arr
  }, [])

  // comm-burst arcs from the surface up to the orbital shell
  const arcs = useMemo(() => {
    const out: { points: [number, number, number][]; phase: number }[] = []
    for (let i = 0; i < 5; i++) {
      const a = new THREE.Vector3().randomDirection().setY(Math.abs(Math.random() - 0.3)).normalize()
      const b = new THREE.Vector3().randomDirection().setY(Math.abs(Math.random() - 0.2)).normalize()
      const start = a.clone().multiplyScalar(EARTH_RADIUS * 1.005)
      const end = b.clone().multiplyScalar(EARTH_RADIUS + 0.8 + Math.random() * 0.9)
      const mid = start.clone().add(end).multiplyScalar(0.62)
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
      out.push({
        points: curve.getPoints(28).map((p) => [p.x, p.y, p.z] as [number, number, number]),
        phase: Math.random() * Math.PI * 2,
      })
    }
    return out
  }, [])

  const arcRefs = useRef<(any | null)[]>([])

  useFrame((state) => {
    const p = scrollProgress.get()
    group.current.visible = p <= RANGES.satellites.end
    if (!group.current.visible) return

    const t = state.clock.elapsedTime

    orbits.forEach((o, i) => {
      const a = o.phase + t * o.speed
      const x = Math.cos(a) * o.radius
      const y = Math.sin(a) * o.radius
      dummy.position.set(
        o.u.x * x + o.v.x * y,
        o.u.y * x + o.v.y * y,
        o.u.z * x + o.v.z * y,
      )
      dummy.rotation.set(o.spin, a, o.spin * 0.5)
      dummy.scale.setScalar(0.72)
      dummy.updateMatrix()
      bodies.current.setMatrixAt(i, dummy.matrix)
      panels.current.setMatrixAt(i, dummy.matrix)
    })
    bodies.current.instanceMatrix.needsUpdate = true
    panels.current.instanceMatrix.needsUpdate = true

    // station glides on its own orbit
    {
      const a = stationOrbit.phase + t * stationOrbit.speed
      const x = Math.cos(a) * stationOrbit.radius
      const y = Math.sin(a) * stationOrbit.radius
      station.current.position.set(
        stationOrbit.u.x * x + stationOrbit.v.x * y,
        stationOrbit.u.y * x + stationOrbit.v.y * y,
        stationOrbit.u.z * x + stationOrbit.v.z * y,
      )
      station.current.rotation.y = a
    }

    debris.current.rotation.y = t * 0.008

    // comm bursts pulse in and out, dash flow animates upward
    arcRefs.current.forEach((line, i) => {
      if (!line) return
      const mat = line.material as THREE.Material & { dashOffset: number; opacity: number }
      mat.dashOffset = -t * 0.55
      const pulse = Math.max(0, Math.sin(t * 0.7 + arcs[i].phase))
      mat.opacity = pulse * 0.65
    })
  })

  return (
    <group ref={group} position={EARTH_POS}>
      <instancedMesh ref={bodies} args={[undefined, undefined, SAT_COUNT]} frustumCulled={false}>
        <boxGeometry args={[0.05, 0.05, 0.08]} />
        <meshStandardMaterial color="#c8ccd6" metalness={0.8} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={panels} args={[undefined, undefined, SAT_COUNT]} frustumCulled={false}>
        <boxGeometry args={[0.26, 0.004, 0.06]} />
        <meshStandardMaterial
          color="#15294f"
          metalness={0.6}
          roughness={0.3}
          emissive="#1c3a78"
          emissiveIntensity={0.6}
        />
      </instancedMesh>

      {/* debris field */}
      <points ref={debris}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[debrisPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#8da4cc" size={0.012} sizeAttenuation transparent opacity={0.55} depthWrite={false} />
      </points>

      {/* comm-burst arcs */}
      {arcs.map((arc, i) => (
        <Line
          key={i}
          ref={(el: any) => (arcRefs.current[i] = el)}
          points={arc.points}
          color="#6fe3ff"
          lineWidth={1.1}
          dashed
          dashSize={0.09}
          gapSize={0.07}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      ))}

      {/* MERIDIAN GATEWAY — modular station */}
      <group ref={station} scale={0.13}>
        {/* central truss */}
        <mesh>
          <boxGeometry args={[3.2, 0.1, 0.1]} />
          <meshStandardMaterial color="#aab2c2" metalness={0.85} roughness={0.4} />
        </mesh>
        {/* habitat modules */}
        {[-0.4, 0.4].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.7, 24]} />
            <meshStandardMaterial color="#dde2ec" metalness={0.4} roughness={0.45} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.8, 20]} />
          <meshStandardMaterial color="#c9cfdc" metalness={0.5} roughness={0.45} />
        </mesh>
        {/* solar wings */}
        {[-1.25, 1.25].map((x) =>
          [-0.5, 0.5].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0, z]} rotation={[0.35, 0, 0]}>
              <boxGeometry args={[0.9, 0.012, 0.82]} />
              <meshStandardMaterial
                color="#16305c"
                metalness={0.55}
                roughness={0.3}
                emissive="#234b8f"
                emissiveIntensity={0.7}
              />
            </mesh>
          )),
        )}
        {/* nav beacon */}
        <mesh position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color="#fff" emissive="#ff5a3d" emissiveIntensity={3} />
        </mesh>
      </group>
    </group>
  )
}
