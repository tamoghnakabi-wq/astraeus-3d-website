import { useState } from 'react'
import { motion, useMotionValueEvent, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { OVERLAYS } from '@/data/journey'
import type { JourneyOverlay } from '@/types'
import { afterProgress, scrollProgress } from '@/store/useStore'

function OverlayBlock({ overlay }: { overlay: JourneyOverlay }) {
  const [i0, i1, o0, o1] = overlay.window
  const opacity = useTransform(scrollProgress, [i0, i1, o0, o1], [0, 1, 1, 0])
  const yIn = useTransform(scrollProgress, [i0, i1, o0, o1], [44, 0, 0, -44])

  const alignment =
    overlay.align === 'left'
      ? 'items-start text-left md:pl-[7vw]'
      : overlay.align === 'right'
        ? 'items-end text-right md:pr-[7vw]'
        : 'items-center text-center'

  return (
    <motion.div
      style={{ opacity, y: yIn }}
      className={`pointer-events-none fixed inset-0 z-10 flex flex-col justify-center px-6 ${alignment}`}
    >
      <div className="max-w-xl">
        <div className="kicker">{overlay.phase}</div>
        <h2 className="mt-4 font-display text-[clamp(1.9rem,4.6vw,3.9rem)] font-medium leading-[1.04] tracking-tight text-star">
          {overlay.title}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-fog md:text-base">{overlay.copy}</p>
        <div
          className={`mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t border-line/70 pt-4 ${
            overlay.align === 'right' ? 'justify-end' : overlay.align === 'center' ? 'justify-center' : ''
          }`}
        >
          {overlay.data.map((d) => (
            <div key={d.label}>
              <div className="font-mono text-[9px] tracking-[0.22em] text-dim">{d.label}</div>
              <div className="mt-1 font-mono text-sm text-ion">{d.value}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

const STATIONS = [
  { p: 0.02, label: 'EARTH' },
  { p: 0.24, label: 'ORBIT' },
  { p: 0.46, label: 'ASCENT' },
  { p: 0.65, label: 'LUNA' },
  { p: 0.82, label: 'MARS' },
  { p: 0.97, label: 'DEEP SPACE' },
]

function StationDot({ p, progress }: { p: number; progress: MotionValue<number> }) {
  const glow = useTransform(progress, [p - 0.09, p, p + 0.09], [0, 1, 0])
  const scale = useTransform(glow, [0, 1], [1, 1.9])
  const background = useTransform(glow, [0, 1], ['#2a3552', '#6fe3ff'])
  return <motion.span style={{ scale, background }} className="block h-1.5 w-1.5 rounded-full" />
}

/** Right-edge progress rail: six stations, live phase label, fill line. */
function JourneyRail() {
  const [label, setLabel] = useState('EARTH')
  const scaleY = useTransform(scrollProgress, [0, 1], [0, 1])
  const railOpacity = useTransform(afterProgress, [0, 0.12], [1, 0])

  useMotionValueEvent(scrollProgress, 'change', (v) => {
    let best = STATIONS[0]
    for (const s of STATIONS) if (Math.abs(s.p - v) < Math.abs(best.p - v)) best = s
    setLabel(best.label)
  })

  return (
    <motion.div
      style={{ opacity: railOpacity }}
      className="pointer-events-none fixed right-7 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex"
    >
      <span
        className="font-mono text-[9px] tracking-[0.3em] text-ion"
        style={{ writingMode: 'vertical-rl' }}
      >
        {label}
      </span>
      <div className="relative flex h-56 flex-col items-center">
        <div className="absolute inset-y-0 w-px bg-line" />
        <motion.div style={{ scaleY }} className="absolute inset-y-0 w-px origin-top bg-ion/80" />
        <div className="relative flex h-full flex-col justify-between py-0.5">
          {STATIONS.map((s) => (
            <StationDot key={s.label} p={s.p} progress={scrollProgress} />
          ))}
        </div>
      </div>
      <span className="font-mono text-[9px] tracking-[0.3em] text-dim" style={{ writingMode: 'vertical-rl' }}>
        MISSION PROFILE
      </span>
    </motion.div>
  )
}

/** All scroll-synced narrative overlays for the journey + the progress rail. */
export function JourneyOverlays() {
  return (
    <>
      {OVERLAYS.map((o) => (
        <OverlayBlock key={o.id} overlay={o} />
      ))}
      <JourneyRail />
    </>
  )
}
