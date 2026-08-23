import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LAUNCH_ANIM, LAUNCH_POS, RANGES } from '@/data/journey'
import { scrollProgress } from '@/store/useStore'
import { range } from '@/lib/math'
import { getSoftCircleTexture } from '@/lib/textures'
import { RocketModel, ROCKET_NOZZLE_Y } from '../RocketModel'
import { PLUME_FRAG, PLUME_VERT } from '../shaders'

const SMOKE_COUNT = 170
const ROCKET_SCALE = 0.52

interface SmokeParticle {
  life: number
  maxLife: number
  pos: THREE.Vector3
  vel: THREE.Vector3
  size: number
}

/**
 * Scene 02 — NOVA IX climbing through the ascent corridor.
 * Scroll drives altitude; the plume, exhaust pool and camera shake sell thrust.
 */
export function LaunchScene() {
  const group = useRef<THREE.Group>(null!)
  const rocket = useRef<THREE.Group>(null!)
  const plume = useRef<THREE.Group>(null!)
  const light = useRef<THREE.PointLight>(null!)
  const smoke = useRef<THREE.Points>(null!)

  const innerUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorCore: { value: new THREE.Color('#fff7e8') },
      uColorEdge: { value: new THREE.Color('#7fa8ff') },
      uIntensity: { value: 1 },
    }),
    [],
  )
  const outerUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorCore: { value: new THREE.Color('#ffc26b') },
      uColorEdge: { value: new THREE.Color('#ff7a2d') },
      uIntensity: { value: 0.55 },
    }),
    [],
  )

  const particles = useMemo<SmokeParticle[]>(
    () =>
      Array.from({ length: SMOKE_COUNT }, () => ({
        life: Math.random(),
        maxLife: 1.6 + Math.random() * 1.8,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        size: 0,
      })),
    [],
  )
  const smokeGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SMOKE_COUNT * 3), 3))
    return geo
  }, [])

  const respawn = (sp: SmokeParticle, nozzle: THREE.Vector3) => {
    sp.life = 0
    sp.maxLife = 1.6 + Math.random() * 1.8
    const a = Math.random() * Math.PI * 2
    const r = Math.random() * 0.08
    sp.pos.set(nozzle.x + Math.cos(a) * r, nozzle.y, nozzle.z + Math.sin(a) * r)
    sp.vel.set(
      Math.cos(a) * (0.25 + Math.random() * 0.3),
      -(1.4 + Math.random() * 1.3),
      Math.sin(a) * (0.25 + Math.random() * 0.3),
    )
  }

  const nozzleWorld = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const p = scrollProgress.get()
    group.current.visible = p >= RANGES.launch.start && p <= RANGES.launch.end
    if (!group.current.visible) return

    const t = state.clock.elapsedTime
    const burn = range(p, LAUNCH_ANIM.start, LAUNCH_ANIM.end)

    // ascent: rises ~6 units through the scene with a slight gravity-turn tilt
    rocket.current.position.y = -2.2 + burn * 6.4
    rocket.current.rotation.z = -burn * 0.12
    rocket.current.rotation.y = t * 0.04

    // nozzle position in scene-local space (rocket is scaled)
    nozzleWorld
      .set(0, ROCKET_NOZZLE_Y * ROCKET_SCALE, 0)
      .applyEuler(rocket.current.rotation)
      .add(rocket.current.position)

    plume.current.position.copy(nozzleWorld)
    plume.current.rotation.copy(rocket.current.rotation)
    const flick = 1 + Math.sin(t * 53.0) * 0.05 + Math.sin(t * 31.7) * 0.04
    plume.current.scale.set(1, flick, 1)

    innerUniforms.uTime.value = t
    outerUniforms.uTime.value = t

    light.current.position.copy(nozzleWorld).y -= 0.3
    light.current.intensity = 26 * flick

    // exhaust trail
    const posAttr = smokeGeo.getAttribute('position') as THREE.BufferAttribute
    particles.forEach((sp, i) => {
      sp.life += delta
      if (sp.life > sp.maxLife) respawn(sp, nozzleWorld)
      sp.pos.addScaledVector(sp.vel, delta)
      sp.vel.multiplyScalar(1 - delta * 0.55) // drag
      posAttr.setXYZ(i, sp.pos.x, sp.pos.y, sp.pos.z)
    })
    posAttr.needsUpdate = true
  })

  return (
    <group ref={group} position={LAUNCH_POS}>
      <group ref={rocket} scale={ROCKET_SCALE}>
        <RocketModel />
      </group>

      {/* engine plume — nested additive cones, uv.y = 1 at the nozzle */}
      <group ref={plume}>
        <mesh position={[0, -0.55, 0]}>
          <coneGeometry args={[0.16, 1.1, 24, 8, true]} />
          <shaderMaterial
            vertexShader={PLUME_VERT}
            fragmentShader={PLUME_FRAG}
            uniforms={innerUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, -0.95, 0]}>
          <coneGeometry args={[0.3, 1.9, 24, 8, true]} />
          <shaderMaterial
            vertexShader={PLUME_VERT}
            fragmentShader={PLUME_FRAG}
            uniforms={outerUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      <pointLight ref={light} color="#ffb066" intensity={22} distance={14} decay={2} />
      {/* cold rim fill so the airframe reads against black */}
      <directionalLight position={[6, 3, 8]} intensity={1.1} color="#9db8e8" />
      <directionalLight position={[-4, 1, -6]} intensity={0.5} color="#33405e" />

      <points ref={smoke}>
        <primitive object={smokeGeo} attach="geometry" />
        <pointsMaterial
          map={getSoftCircleTexture()}
          color="#aab2c0"
          size={0.85}
          sizeAttenuation
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </points>
    </group>
  )
}
