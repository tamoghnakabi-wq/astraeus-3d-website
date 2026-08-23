import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Html, Lightformer, Line, PresentationControls } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ROCKET_PARTS } from '@/data/content'
import { getSoftCircleTexture } from '@/lib/textures'
import { RocketModel } from '@/components/three/RocketModel'

/** Local Y anchor for each part's annotation callout. */
const PART_ANCHORS: Record<string, number> = {
  fairing: 2.85,
  payload: 1.95,
  avionics: 1.62,
  stage2: 1.1,
  interstage: 0.58,
  stage1: -0.9,
  engines: -2.45,
  legs: -1.9,
}

const NOVA = new THREE.Color('#4f86ff')

interface ShowcaseSceneProps {
  selected: string | null
  hovered: string | null
  exploded: boolean
  zoom: number
  autoRotate: boolean
  onHover: (id: string | null) => void
  onSelect: (id: string | null) => void
}

function ZoomRig({ z }: { z: number }) {
  useFrame((state, delta) => {
    const cam = state.camera
    cam.position.z = THREE.MathUtils.damp(cam.position.z, z, 4, Math.min(delta, 0.05))
    cam.lookAt(0, 0.1, 0)
  })
  return null
}

function circlePoints(radius: number): [number, number, number][] {
  return Array.from({ length: 65 }, (_, i) => {
    const a = (i / 64) * Math.PI * 2
    return [Math.cos(a) * radius, 0, Math.sin(a) * radius] as [number, number, number]
  })
}

/**
 * The engineering hologram: NOVA IX over a polar grid. Drag to rotate,
 * hover/click to inspect parts; exploded view tweens every stage apart.
 */
export function ShowcaseScene({
  selected,
  hovered,
  exploded,
  zoom,
  autoRotate,
  onHover,
  onSelect,
}: ShowcaseSceneProps) {
  // materials are collected once at registration — the per-frame highlight
  // loop iterates flat arrays instead of traversing the scene graph
  const parts = useRef<Map<string, { group: THREE.Group; mats: THREE.MeshStandardMaterial[] }>>(
    new Map(),
  )
  const spinner = useRef<THREE.Group>(null!)

  const registerPart = useCallback((id: string, g: THREE.Group | null) => {
    if (!g) {
      parts.current.delete(id)
      return
    }
    const mats: THREE.MeshStandardMaterial[] = []
    g.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const m = mesh.material as THREE.MeshStandardMaterial
      m.userData.base = { emissive: m.emissive.clone(), intensity: m.emissiveIntensity }
      mats.push(m)
    })
    parts.current.set(id, { group: g, mats })
  }, [])

  /* explode / collapse */
  useEffect(() => {
    const tweens: gsap.core.Tween[] = []
    ROCKET_PARTS.forEach((part, i) => {
      const entry = parts.current.get(part.id)
      if (!entry) return
      tweens.push(
        gsap.to(entry.group.position, {
          y: exploded ? part.explode : 0,
          duration: 1.05,
          ease: 'power3.inOut',
          delay: i * 0.045,
        }),
      )
    })
    return () => tweens.forEach((t) => t.kill())
  }, [exploded])

  /* highlight / dim — runs on cached materials, no React, no traversal */
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const active = hovered ?? selected
    if (autoRotate && !active) spinner.current.rotation.y += dt * 0.16

    parts.current.forEach(({ group, mats }, id) => {
      const targetOp = active ? (id === active ? 1 : 0.13) : 1
      const targetK = active === id ? 1 : 0
      const ud = group.userData as { k?: number }
      ud.k = THREE.MathUtils.damp(ud.k ?? 0, targetK, 10, dt)
      const k = (ud.k ?? 0) * 0.8

      for (const m of mats) {
        m.opacity = THREE.MathUtils.damp(m.opacity, targetOp, 10, dt)
        const dimmed = m.opacity < 0.985
        m.transparent = dimmed
        m.depthWrite = !dimmed

        const base = m.userData.base as { emissive: THREE.Color; intensity: number }
        m.emissive.copy(base.emissive).lerp(NOVA, k)
        m.emissiveIntensity = base.intensity + k * 0.7
      }
    })
  })

  const activeForCallout = hovered ?? selected
  const activePart = ROCKET_PARTS.find((p) => p.id === activeForCallout)

  const callout = useMemo(() => {
    if (!activePart) return undefined
    return {
      id: activePart.id,
      node: (
        <Html
          position={[0.62, PART_ANCHORS[activePart.id] ?? 0, 0]}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[30, 0]}
        >
          <div className="flex items-center gap-2 -translate-y-1/2 whitespace-nowrap">
            <span className="block h-px w-10 bg-ion/70" />
            <span className="border border-ion/30 bg-void/85 px-3 py-1.5 font-mono text-[10px] tracking-[0.22em] text-ion backdrop-blur-sm">
              {activePart.name.toUpperCase()}
            </span>
          </div>
        </Html>
      ),
    }
  }, [activePart])

  return (
    <>
      <ZoomRig z={zoom} />

      {/* studio lighting built from local lightformers — no HDR fetch */}
      <Environment resolution={256}>
        <Lightformer intensity={2.4} position={[4, 3, 5]} scale={[4, 4, 1]} color="#dfe9ff" />
        <Lightformer intensity={1.1} position={[-5, 2, -3]} scale={[3, 5, 1]} color="#4f86ff" />
        <Lightformer intensity={0.7} position={[0, -4, 2]} scale={[6, 2, 1]} color="#27344f" />
      </Environment>
      <directionalLight position={[5, 4, 6]} intensity={1.9} color="#ffffff" />
      <directionalLight position={[-6, 1, -5]} intensity={1.0} color="#4f86ff" />
      <directionalLight position={[0, -3, 4]} intensity={0.35} color="#9db8e8" />

      <PresentationControls
        global={false}
        cursor
        speed={1.5}
        polar={[-0.25, 0.3]}
        azimuth={[-Infinity, Infinity]}
        damping={0.16}
      >
        <group ref={spinner} rotation={[0, 0.6, 0]} scale={0.92} position={[0, 0.15, 0]}>
          <RocketModel
            interactive
            registerPart={registerPart}
            callout={callout}
            onPartOver={(id) => onHover(id)}
            onPartOut={() => onHover(null)}
            onPartClick={(id) => onSelect(selected === id ? null : id)}
          />
        </group>
      </PresentationControls>

      {/* holographic deck */}
      <group position={[0, -3.2, 0]}>
        {[1.5, 2.15, 2.8].map((r, i) => (
          <Line
            key={r}
            points={circlePoints(r)}
            color="#4f86ff"
            transparent
            opacity={0.16 - i * 0.04}
            lineWidth={1}
          />
        ))}
        <sprite scale={[6.5, 6.5, 1]} position={[0, -0.1, 0]}>
          <spriteMaterial
            map={getSoftCircleTexture()}
            color="#16264a"
            transparent
            opacity={0.5}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      </group>
    </>
  )
}
