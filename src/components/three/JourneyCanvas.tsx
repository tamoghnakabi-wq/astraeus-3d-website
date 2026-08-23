import { Suspense, useEffect, useRef, useState } from 'react'
import type * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { useMotionValueEvent } from 'framer-motion'
import { afterProgress, useStore } from '@/store/useStore'
import { SUN_POS } from '@/data/journey'
import { CameraRig } from './CameraRig'
import { Starfield } from './Starfield'
import { SunFlare } from './SunFlare'
import { Effects } from './Effects'
import { EarthScene } from './scenes/EarthScene'
import { Satellites } from './scenes/Satellites'
import { LaunchScene } from './scenes/LaunchScene'
import { MoonScene } from './scenes/MoonScene'
import { MarsScene } from './scenes/MarsScene'
import { DeepSpaceScene } from './scenes/DeepSpaceScene'

interface JourneyCanvasProps {
  isMobile: boolean
  isTouch: boolean
}

/**
 * Renders every scene once with culling disabled while the loader still
 * covers the screen — compiles all programs and uploads all buffers up
 * front, so no station causes a first-visit frame spike mid-scroll.
 */
function WarmUp() {
  const { gl, scene, camera } = useThree()
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true
    const saved: [THREE.Object3D, boolean, boolean][] = []
    scene.traverse((o) => {
      saved.push([o, o.visible, o.frustumCulled])
      o.visible = true
      o.frustumCulled = false
    })
    gl.render(scene, camera)
    saved.forEach(([o, visible, culled]) => {
      o.visible = visible
      o.frustumCulled = culled
    })
  }, [gl, scene, camera])

  return null
}

/**
 * Render stages for the background canvas:
 *  - live:   journey on screen — full pipeline.
 *  - dim:    post-journey sections cover most of it — skip the composer.
 *  - frozen: sections fully cover it — stop the frame loop entirely.
 * Hysteresis between thresholds prevents flapping at the boundaries.
 */
type Stage = 'live' | 'dim' | 'frozen'

function nextStage(prev: Stage, v: number): Stage {
  switch (prev) {
    case 'live':
      return v >= 0.25 ? 'dim' : 'live'
    case 'dim':
      if (v >= 0.985) return 'frozen'
      return v <= 0.05 ? 'live' : 'dim'
    case 'frozen':
      return v <= 0.9 ? 'dim' : 'frozen'
  }
}

/**
 * The fixed full-screen canvas behind the entire page.
 * Scroll position (via MotionValues) drives the camera through five scenes;
 * each scene gates its own visibility so off-screen stations cost nothing.
 */
export function JourneyCanvas({ isMobile, isTouch }: JourneyCanvasProps) {
  const quality = useStore((s) => s.quality)
  const setQuality = useStore((s) => s.setQuality)
  const setReady = useStore((s) => s.setReady)
  const [stage, setStage] = useState<Stage>('live')

  useMotionValueEvent(afterProgress, 'change', (v) => {
    setStage((prev) => nextStage(prev, v))
  })

  const effectsOn = !isMobile && quality === 'high'
  // 1.75 is visually indistinguishable from native 2× here (bloom + AA soften
  // the result anyway) and cuts fragment work by ~23% on Retina displays.
  const dpr: [number, number] = isMobile ? [1, 1.5] : quality === 'high' ? [1, 1.75] : [1, 1.25]

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
      <Canvas
        dpr={dpr}
        frameloop={stage === 'frozen' ? 'never' : 'always'}
        camera={{ fov: 42, near: 0.1, far: 400, position: [0, 0.05, 3.85] }}
        gl={{
          antialias: !effectsOn,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#02040a')
          if (import.meta.env.DEV) (window as unknown as { __gl: unknown }).__gl = gl
          setReady(true)
        }}
      >
        <Suspense fallback={null}>
          <PerformanceMonitor onDecline={() => setQuality('low')} flipflops={2} factor={1}>
            {/* global key light — the sun, consistent across every station */}
            <directionalLight position={SUN_POS} intensity={2.6} color="#fff4e2" />
            <ambientLight intensity={0.06} color="#22304e" />
            <hemisphereLight intensity={0.12} color="#36456b" groundColor="#0a0d16" />

            <CameraRig parallax={!isTouch} />
            <Starfield count={isMobile ? 3200 : 6500} />
            <SunFlare />

            <EarthScene bakeSize={isMobile ? 1024 : 2048} />
            <Satellites />
            <LaunchScene />
            <MoonScene detail={isMobile ? 96 : 128} />
            <MarsScene detail={isMobile ? 80 : 112} />
            <DeepSpaceScene galaxyCount={isMobile ? 2200 : 4200} />

            <Effects enabled={effectsOn} active={stage === 'live'} />
            <WarmUp />
          </PerformanceMonitor>
        </Suspense>
      </Canvas>
    </div>
  )
}
