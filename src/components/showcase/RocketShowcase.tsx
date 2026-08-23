import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AnimatePresence, motion } from 'framer-motion'
import { ROCKET_PARTS } from '@/data/content'
import { useCanvasInView } from '@/hooks/useCanvasInView'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ShowcaseScene } from './ShowcaseScene'

const VEHICLE_STATS = [
  { label: 'HEIGHT', value: '62 M' },
  { label: 'DIAMETER', value: '5.2 M' },
  { label: 'LIFTOFF THRUST', value: '7.6 MN' },
  { label: 'PAYLOAD · LEO', value: '24 T' },
]

/**
 * Interactive engineering view of NOVA IX — drag to rotate, hover or pick a
 * component to inspect it, blow the whole stack apart with one switch.
 */
export function RocketShowcase() {
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [exploded, setExploded] = useState(false)
  const [zoom, setZoom] = useState(9.6)
  const { ref, frameloop } = useCanvasInView<HTMLDivElement>()

  const activeId = hovered ?? selected
  const active = ROCKET_PARTS.find((p) => p.id === activeId)

  const toggleExploded = () => {
    setExploded((v) => {
      setZoom(v ? 9.6 : 13.2)
      return !v
    })
  }

  return (
    <section id="vehicle" className="relative px-6 py-28 md:px-12 lg:px-20 lg:py-36">
      <SectionHeading
        index="01"
        kicker="The Vehicle"
        title="NOVA IX"
        copy="A fully reusable heavy-lift launch system. Nine full-flow staged-combustion engines, a stainless airframe rated for twenty-five flights, and a turnaround measured in hours — not months."
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        {/* ── 3D viewport ── */}
        <div
          ref={ref}
          className="hud-frame relative h-[460px] overflow-hidden border border-line/60 bg-abyss/40 md:h-[560px] lg:h-[680px]"
          style={{ touchAction: 'pan-y', cursor: hovered ? 'pointer' : 'grab' }}
        >
          <Canvas
            frameloop={frameloop}
            dpr={[1, 1.75]}
            camera={{ position: [0, 0.25, 9.6], fov: 35 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            <ShowcaseScene
              selected={selected}
              hovered={hovered}
              exploded={exploded}
              zoom={zoom}
              autoRotate
              onHover={setHovered}
              onSelect={setSelected}
            />
          </Canvas>

          {/* viewport chrome */}
          <div className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] tracking-[0.25em] text-dim">
            ENG-VIEW // HOLOGRAPHIC
          </div>
          <div className="pointer-events-none absolute bottom-4 left-4 font-mono text-[10px] tracking-[0.2em] text-dim">
            DRAG TO ROTATE · CLICK A SYSTEM
          </div>

          {/* controls */}
          <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
            <button
              onClick={toggleExploded}
              className={`border px-3.5 py-2 font-mono text-[10px] tracking-[0.22em] transition-colors duration-300 ${
                exploded
                  ? 'border-ion/60 bg-ion/10 text-ion'
                  : 'border-line bg-void/60 text-fog hover:border-nova/50 hover:text-star'
              }`}
            >
              {exploded ? 'ASSEMBLE' : 'EXPLODED VIEW'}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setZoom((z) => Math.max(7, z - 1.2))}
                aria-label="Zoom in"
                className="border border-line bg-void/60 px-3 py-2 font-mono text-[11px] text-fog transition-colors hover:border-nova/50 hover:text-star"
              >
                +
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(12.6, z + 1.2))}
                aria-label="Zoom out"
                className="border border-line bg-void/60 px-3 py-2 font-mono text-[11px] text-fog transition-colors hover:border-nova/50 hover:text-star"
              >
                −
              </button>
              <button
                onClick={() => {
                  setExploded(false)
                  setSelected(null)
                  setZoom(9.6)
                }}
                className="border border-line bg-void/60 px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-fog transition-colors hover:border-nova/50 hover:text-star"
              >
                RESET
              </button>
            </div>
          </div>
        </div>

        {/* ── systems list + spec readout ── */}
        <div className="flex flex-col">
          <div className="font-mono text-[10px] tracking-[0.3em] text-dim">FLIGHT SYSTEMS</div>
          <ul className="mt-4 divide-y divide-line/50 border-y border-line/50">
            {ROCKET_PARTS.map((part, i) => {
              const isActive = activeId === part.id
              return (
                <li key={part.id}>
                  <button
                    onMouseEnter={() => setHovered(part.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelected(selected === part.id ? null : part.id)}
                    className={`group flex w-full items-center gap-4 px-2 py-3 text-left transition-colors duration-300 ${
                      isActive ? 'bg-nova/[0.07]' : 'hover:bg-star/[0.03]'
                    }`}
                  >
                    <span className={`font-mono text-[10px] ${isActive ? 'text-ion' : 'text-dim'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`font-display text-sm tracking-wide transition-colors ${
                        isActive ? 'text-star' : 'text-fog group-hover:text-star'
                      }`}
                    >
                      {part.name}
                    </span>
                    <span
                      className={`ml-auto h-px w-6 transition-all duration-300 ${
                        isActive ? 'w-10 bg-ion' : 'bg-line'
                      }`}
                    />
                  </button>
                </li>
              )
            })}
          </ul>

          {/* spec panel */}
          <div className="relative mt-6 min-h-[190px]">
            <AnimatePresence mode="wait">
              {active ? (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-panel p-5"
                >
                  <div className="kicker">{active.name}</div>
                  <p className="mt-2.5 text-sm leading-relaxed text-fog">{active.blurb}</p>
                  <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line/60 pt-4">
                    {active.specs.map((s) => (
                      <div key={s.label}>
                        <dt className="font-mono text-[9px] tracking-[0.18em] text-dim">{s.label}</dt>
                        <dd className="mt-1 font-mono text-xs text-star">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full min-h-[190px] items-center justify-center border border-dashed border-line/60 p-5 text-center"
                >
                  <p className="max-w-[26ch] font-mono text-[10px] leading-relaxed tracking-[0.2em] text-dim">
                    SELECT A FLIGHT SYSTEM TO PULL ITS ENGINEERING DATA
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* vehicle stats strip */}
          <div className="mt-auto grid grid-cols-2 gap-px border border-line/60 bg-line/40 pt-px md:grid-cols-4">
            {VEHICLE_STATS.map((s) => (
              <div key={s.label} className="bg-void/90 px-4 py-3.5">
                <div className="font-mono text-[9px] tracking-[0.2em] text-dim">{s.label}</div>
                <div className="mt-1 font-display text-lg text-star">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
