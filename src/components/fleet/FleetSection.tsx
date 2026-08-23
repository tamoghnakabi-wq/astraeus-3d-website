import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, PresentationControls } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import * as THREE from 'three'
import { FLEET } from '@/data/content'
import { useCanvasInView } from '@/hooks/useCanvasInView'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { CRAFT_COMPONENTS } from './craft'

/** Eases the newly selected craft in with a scale/rotation settle. */
function CraftEntrance({ children, id }: { children: React.ReactNode; id: string }) {
  const group = useRef<THREE.Group>(null!)
  const born = useRef(0)

  useFrame((state, delta) => {
    if (born.current === 0) born.current = state.clock.elapsedTime
    const age = state.clock.elapsedTime - born.current
    const k = THREE.MathUtils.clamp(age / 0.7, 0, 1)
    const e = 1 - Math.pow(1 - k, 3)
    group.current.scale.setScalar(0.82 + 0.18 * e)
    group.current.position.y = (1 - e) * -0.25
    group.current.rotation.y += delta * 0.22
  })

  return (
    <group key={id} ref={group}>
      {children}
    </group>
  )
}

/**
 * Fleet hangar — one shared viewer, five vehicles. Selecting a craft swaps
 * the model with an entrance settle and crossfades its data sheet.
 */
export function FleetSection() {
  const [activeId, setActiveId] = useState(FLEET[0].id)
  const { ref, frameloop } = useCanvasInView<HTMLDivElement>()
  const craft = FLEET.find((c) => c.id === activeId)!
  const Model = CRAFT_COMPONENTS[activeId]

  return (
    <section id="fleet" className="relative px-6 py-28 md:px-12 lg:px-20 lg:py-36">
      <SectionHeading
        index="03"
        kicker="The Fleet"
        title="FIVE VEHICLES, ONE SUPPLY LINE"
        copy="From low-orbit logistics to the edge of the heliosphere — each vehicle hands its payload to the next, a relay stretching from the launch pad to interstellar space."
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-12">
        {/* ── craft selector ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:divide-y lg:divide-line/50 lg:border-y lg:border-line/50 lg:pb-0">
          {FLEET.map((c) => {
            const isActive = c.id === activeId
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`shrink-0 border px-4 py-3 text-left transition-colors duration-300 lg:flex lg:items-center lg:gap-4 lg:border-0 lg:px-2 lg:py-4 ${
                  isActive
                    ? 'border-ion/50 bg-nova/[0.08] lg:bg-nova/[0.07]'
                    : 'border-line/60 hover:border-fog/40 lg:hover:bg-star/[0.03]'
                }`}
              >
                <span className={`font-mono text-[10px] ${isActive ? 'text-ion' : 'text-dim'}`}>
                  {c.code}
                </span>
                <span className="block lg:inline">
                  <span
                    className={`font-display text-sm tracking-wider ${
                      isActive ? 'text-star' : 'text-fog'
                    }`}
                  >
                    {c.name}
                  </span>
                  <span className="ml-0 block text-[10px] uppercase tracking-[0.18em] text-dim lg:ml-0 lg:mt-0.5">
                    {c.role}
                  </span>
                </span>
                <span
                  className={`mt-1 hidden h-1.5 w-1.5 rounded-full lg:ml-auto lg:mt-0 lg:block ${
                    isActive ? 'bg-ion animate-pulse-dot' : 'bg-line'
                  }`}
                />
              </button>
            )
          })}
        </div>

        {/* ── viewer + data sheet ── */}
        <div>
          <div
            ref={ref}
            className="hud-frame relative h-[380px] overflow-hidden border border-line/60 bg-abyss/40 md:h-[460px]"
            style={{ touchAction: 'pan-y' }}
          >
            <Canvas
              frameloop={frameloop}
              dpr={[1, 1.75]}
              camera={{ position: [0, 0.4, 5.6], fov: 38 }}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            >
              <Environment resolution={256}>
                <Lightformer intensity={2.2} position={[4, 3, 5]} scale={[4, 4, 1]} color="#dfe9ff" />
                <Lightformer intensity={1.0} position={[-5, 1, -4]} scale={[3, 5, 1]} color="#4f86ff" />
              </Environment>
              <directionalLight position={[5, 4, 6]} intensity={1.8} />
              <directionalLight position={[-6, -1, -4]} intensity={0.9} color={craft.accent} />
              <PresentationControls
                global={false}
                cursor
                speed={1.4}
                polar={[-0.3, 0.35]}
                azimuth={[-Infinity, Infinity]}
                damping={0.16}
              >
                <CraftEntrance id={activeId} key={activeId}>
                  <Model />
                </CraftEntrance>
              </PresentationControls>
            </Canvas>

            <div className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] tracking-[0.25em] text-dim">
              HANGAR // {craft.code}
            </div>
            <div
              className="pointer-events-none absolute right-4 top-4 h-1.5 w-1.5 rounded-full animate-pulse-dot"
              style={{ background: craft.accent }}
            />
            <div className="pointer-events-none absolute bottom-4 left-4 font-mono text-[10px] tracking-[0.2em] text-dim">
              DRAG TO INSPECT
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={craft.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6"
            >
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h3 className="font-display text-2xl tracking-wide text-star">
                  {craft.code} {craft.name}
                </h3>
                <span className="font-mono text-[10px] tracking-[0.25em] text-dim">
                  {craft.role.toUpperCase()}
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fog">{craft.description}</p>
              <dl className="mt-5 grid grid-cols-2 gap-px border border-line/60 bg-line/40 md:grid-cols-4">
                {craft.specs.map((s) => (
                  <div key={s.label} className="bg-void/90 px-4 py-3.5">
                    <dt className="font-mono text-[9px] tracking-[0.2em] text-dim">{s.label}</dt>
                    <dd className="mt-1 font-mono text-sm" style={{ color: craft.accent }}>
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
