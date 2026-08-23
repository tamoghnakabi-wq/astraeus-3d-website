import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { BLACKHOLE_POS, RANGES } from '@/data/journey'
import { afterProgress, scrollProgress } from '@/store/useStore'
import { getSoftCircleTexture } from '@/lib/textures'
import { getFbmTexture } from '@/lib/noiseTexture'
import { DISK_FRAG, DISK_VERT, NEBULA_FRAG, NEBULA_VERT, withNoise } from '../shaders'

/**
 * Scene 05 — the dark between stars: layered nebulae, a distant spiral
 * galaxy, a fusion explorer on a slow flyby, and GARGANT-1: an accretion
 * disk + photon ring around a true-black event horizon.
 * uDim fades the bright shader work once the DOM sections scroll over it.
 */

const NEBULAE: { pos: [number, number, number]; scale: number; a: string; b: string; opacity: number; rot: number }[] = [
  { pos: [-14, 4, -132], scale: 30, a: '#1b1450', b: '#5e2a8a', opacity: 0.34, rot: 0.4 },
  { pos: [10, -3, -128], scale: 24, a: '#0d2a4d', b: '#3a6ec2', opacity: 0.3, rot: -0.7 },
  { pos: [-4, 7, -126], scale: 18, a: '#451a52', b: '#b04a8f', opacity: 0.24, rot: 1.2 },
  { pos: [3, -6, -122], scale: 16, a: '#0e3242', b: '#2e8fa3', opacity: 0.22, rot: 2.1 },
  { pos: [-9, -2, -120], scale: 13, a: '#241a5e', b: '#7048c8', opacity: 0.2, rot: -1.5 },
]

function Nebulae() {
  const gl = useThree((s) => s.gl)
  // all noise lives in a baked tile — fragments are two texture taps
  const noiseTex = useMemo(() => getFbmTexture(gl), [gl])

  const uniformSets = useMemo(
    () =>
      NEBULAE.map((n, i) => ({
        uNoise: { value: noiseTex },
        uColorA: { value: new THREE.Color(n.a) },
        uColorB: { value: new THREE.Color(n.b) },
        uSeed: { value: i * 3.7 + 1.3 },
        uTime: { value: 0 },
        uOpacity: { value: n.opacity },
        uDim: { value: 1 },
      })),
    [noiseTex],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const dim = 1 - afterProgress.get() * 0.72
    uniformSets.forEach((u) => {
      u.uTime.value = t
      u.uDim.value = dim
    })
  })

  return (
    <>
      {NEBULAE.map((n, i) => (
        <mesh key={i} position={n.pos} rotation={[0, 0, n.rot]}>
          <planeGeometry args={[n.scale, n.scale]} />
          <shaderMaterial
            vertexShader={NEBULA_VERT}
            fragmentShader={NEBULA_FRAG}
            uniforms={uniformSets[i]}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </>
  )
}

function Galaxy({ count = 4200 }: { count?: number }) {
  const spin = useRef<THREE.Group>(null!)

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const core = new THREE.Color('#ffd9a8')
    const mid = new THREE.Color('#c08adf')
    const edge = new THREE.Color('#5d86ff')
    const c = new THREE.Color()

    for (let i = 0; i < count; i++) {
      const t = Math.pow(Math.random(), 1.6)
      const arm = i % 3
      const angle = arm * ((Math.PI * 2) / 3) + t * 4.4 + (Math.random() - 0.5) * 0.45 * (1 - t * 0.6)
      const radius = t * 7.5
      const jitter = (1 - t) * 0.7
      positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * jitter
      positions[i * 3 + 1] = (Math.random() - 0.5) * (0.55 - t * 0.4)
      positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * jitter

      if (t < 0.3) c.copy(core).lerp(mid, t / 0.3)
      else c.copy(mid).lerp(edge, (t - 0.3) / 0.7)
      const v = 0.55 + Math.random() * 0.45
      colors[i * 3] = c.r * v
      colors[i * 3 + 1] = c.g * v
      colors[i * 3 + 2] = c.b * v
    }
    return { positions, colors }
  }, [count])

  useFrame((_, delta) => {
    spin.current.rotation.y += delta * 0.014
  })

  return (
    <group position={[-30, 11, -158]} rotation={[0.9, 0.2, 0.35]} scale={1.7}>
      <group ref={spin}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[colors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.055}
            sizeAttenuation
            vertexColors
            transparent
            opacity={0.9}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
        {/* core glow */}
        <sprite scale={[2.6, 2.6, 1]}>
          <spriteMaterial
            map={getSoftCircleTexture()}
            color="#ffe3b8"
            transparent
            opacity={0.75}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      </group>
    </group>
  )
}

function BlackHole() {
  const group = useRef<THREE.Group>(null!)
  const diskUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uInner: { value: 1.3 },
      uOuter: { value: 3.4 },
      uDim: { value: 1 },
      uIntensity: { value: 1.45 },
    }),
    [],
  )
  const ringUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uInner: { value: 1.32 },
      uOuter: { value: 1.85 },
      uDim: { value: 1 },
      uIntensity: { value: 2.1 },
    }),
    [],
  )
  const frag = useMemo(() => withNoise(DISK_FRAG, 3), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const dim = 1 - afterProgress.get() * 0.78
    diskUniforms.uTime.value = t
    ringUniforms.uTime.value = t * 0.7
    diskUniforms.uDim.value = dim
    ringUniforms.uDim.value = dim
    group.current.rotation.z = Math.sin(t * 0.05) * 0.04
  })

  return (
    <group ref={group} position={BLACKHOLE_POS} rotation={[0.42, 0.15, 0.12]}>
      {/* event horizon — pure black, occludes everything behind it */}
      <mesh renderOrder={1}>
        <sphereGeometry args={[1.04, 48, 48]} />
        <meshBasicMaterial color="#000000" toneMapped={false} />
      </mesh>

      {/* accretion disk in the equatorial plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <ringGeometry args={[1.3, 3.4, 96, 1]} />
        <shaderMaterial
          vertexShader={DISK_VERT}
          fragmentShader={frag}
          uniforms={diskUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* lensed photon ring standing over the horizon */}
      <mesh rotation={[0.12, 0.3, 0]} renderOrder={3}>
        <ringGeometry args={[1.32, 1.85, 96, 1]} />
        <shaderMaterial
          vertexShader={DISK_VERT}
          fragmentShader={frag}
          uniforms={ringUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ambient heat halo */}
      <sprite scale={[9, 9, 1]} renderOrder={0}>
        <spriteMaterial
          map={getSoftCircleTexture()}
          color="#ff8a3d"
          transparent
          opacity={0.13}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  )
}

function ExplorerShip() {
  const ship = useRef<THREE.Group>(null!)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const k = (t * 0.55) % 40
    // long slow flyby, re-entering from the right every ~70s of travel
    ship.current.position.set(8 - k * 0.4, -0.4 + Math.sin(t * 0.2) * 0.3, -111 + Math.sin(t * 0.13) * 1.4)
    ship.current.rotation.z = 0.08 + Math.sin(t * 0.2) * 0.05
    ship.current.rotation.y = -1.62
  })

  return (
    <group ref={ship} scale={0.36}>
      {/* hull */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.16, 1.7, 6, 16]} />
        <meshStandardMaterial color="#bfc7d4" metalness={0.8} roughness={0.35} />
      </mesh>
      {/* forward sensor dish */}
      <mesh position={[1.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.22, 0.3, 20, 1, true]} />
        <meshStandardMaterial color="#8d96a6" metalness={0.85} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* radiator fins */}
      {[0.38, -0.38].map((z) => (
        <mesh key={z} position={[-0.2, 0, z]}>
          <boxGeometry args={[1.2, 0.015, 0.6]} />
          <meshStandardMaterial color="#2b313d" metalness={0.6} roughness={0.5} emissive="#b8451f" emissiveIntensity={0.35} />
        </mesh>
      ))}
      {/* fusion drive */}
      <mesh position={[-1.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.14, 0.5, 16, 1, true]} />
        <meshStandardMaterial color="#3a414e" metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <sprite position={[-1.55, 0, 0]} scale={[1.5, 0.5, 1]}>
        <spriteMaterial
          map={getSoftCircleTexture()}
          color="#6fe3ff"
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <pointLight position={[-1.5, 0, 0]} intensity={4} distance={6} decay={2} color="#6fe3ff" />
      {/* blinking nav light */}
      <NavBeacon />
    </group>
  )
}

function NavBeacon() {
  const mat = useRef<THREE.MeshStandardMaterial>(null!)
  useFrame((state) => {
    mat.current.emissiveIntensity = Math.sin(state.clock.elapsedTime * 4) > 0.7 ? 4 : 0.15
  })
  return (
    <mesh position={[0.3, 0.22, 0]}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshStandardMaterial ref={mat} color="#fff" emissive="#ff4734" emissiveIntensity={2} />
    </mesh>
  )
}

export function DeepSpaceScene({ galaxyCount = 4200 }: { galaxyCount?: number }) {
  const group = useRef<THREE.Group>(null!)

  useFrame(() => {
    const p = scrollProgress.get()
    group.current.visible = p >= RANGES.deep.start
  })

  return (
    <group ref={group}>
      <Nebulae />
      <Galaxy count={galaxyCount} />
      <BlackHole />
      <ExplorerShip />
    </group>
  )
}
