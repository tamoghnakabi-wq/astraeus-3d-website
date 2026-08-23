import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CAMERA_KEYS, LAUNCH_ANIM } from '@/data/journey'
import { pointerX, pointerY, scrollProgress } from '@/store/useStore'
import { easeInOutCubic, range } from '@/lib/math'

const BASE_FOV = 42

/**
 * Flies the camera along the journey keyframes.
 * Per-segment smoothstep easing gives a gentle stop at every station;
 * exponential damping on top absorbs fast scrolling; pointer parallax and a
 * touch of hand-held drift keep the frame alive while dwelling.
 */
export function CameraRig({ parallax = true }: { parallax?: boolean }) {
  const pos = useRef(new THREE.Vector3(...CAMERA_KEYS[0].pos))
  const tgt = useRef(new THREE.Vector3(...CAMERA_KEYS[0].tgt))
  const goalPos = useRef(new THREE.Vector3())
  const goalTgt = useRef(new THREE.Vector3())
  const a = useRef(new THREE.Vector3())
  const b = useRef(new THREE.Vector3())
  const lastPos = useRef(new THREE.Vector3(...CAMERA_KEYS[0].pos))
  const fov = useRef(BASE_FOV)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20)
    const p = scrollProgress.get()
    const t = state.clock.elapsedTime

    // locate the active keyframe segment
    let i = 0
    while (i < CAMERA_KEYS.length - 2 && p > CAMERA_KEYS[i + 1].p) i++
    const k0 = CAMERA_KEYS[i]
    const k1 = CAMERA_KEYS[i + 1]
    const local = easeInOutCubic(range(p, k0.p, k1.p))

    goalPos.current.copy(a.current.set(...k0.pos).lerp(b.current.set(...k1.pos), local))
    goalTgt.current.copy(a.current.set(...k0.tgt).lerp(b.current.set(...k1.tgt), local))

    const lambda = 5.2
    pos.current.x = THREE.MathUtils.damp(pos.current.x, goalPos.current.x, lambda, dt)
    pos.current.y = THREE.MathUtils.damp(pos.current.y, goalPos.current.y, lambda, dt)
    pos.current.z = THREE.MathUtils.damp(pos.current.z, goalPos.current.z, lambda, dt)
    tgt.current.x = THREE.MathUtils.damp(tgt.current.x, goalTgt.current.x, lambda, dt)
    tgt.current.y = THREE.MathUtils.damp(tgt.current.y, goalTgt.current.y, lambda, dt)
    tgt.current.z = THREE.MathUtils.damp(tgt.current.z, goalTgt.current.z, lambda, dt)

    const cam = state.camera as THREE.PerspectiveCamera
    cam.position.copy(pos.current)

    // hand-held drift
    cam.position.x += Math.sin(t * 0.31) * 0.02
    cam.position.y += Math.sin(t * 0.43 + 1.7) * 0.016

    // pointer parallax
    if (parallax) {
      cam.position.x += pointerX.get() * 0.16
      cam.position.y += -pointerY.get() * 0.1
    }

    // ascent shake while the booster burns past us
    const burn = range(p, LAUNCH_ANIM.start, LAUNCH_ANIM.end)
    if (burn > 0 && burn < 1) {
      const amp = 0.022 * Math.sin(burn * Math.PI)
      cam.position.x += (Math.sin(t * 71.0) + Math.sin(t * 47.3)) * amp * 0.5
      cam.position.y += (Math.sin(t * 63.7) + Math.sin(t * 41.1)) * amp * 0.5
    }

    cam.lookAt(tgt.current)

    // subtle FOV kick during fast transits — reads as warp speed
    const speed = lastPos.current.distanceTo(pos.current) / Math.max(dt, 1e-4)
    lastPos.current.copy(pos.current)
    const targetFov = BASE_FOV + Math.min(13, speed * 0.55)
    fov.current = THREE.MathUtils.damp(fov.current, targetFov, 3.2, dt)
    if (Math.abs(cam.fov - fov.current) > 0.01) {
      cam.fov = fov.current
      cam.updateProjectionMatrix()
    }
  })

  return null
}
