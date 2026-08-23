import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { STATS } from '@/data/content'
import type { StatItem } from '@/types'
import { useCountUp } from '@/hooks/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'

function StatBlock({ stat, started, index }: { stat: StatItem; started: boolean; index: number }) {
  const reduced = usePrefersReducedMotion()
  const ref = useCountUp(stat.value, {
    start: started,
    decimals: stat.decimals,
    suffix: stat.suffix,
    duration: 2100 + index * 160,
    reducedMotion: reduced,
  })

  // decorative gauge fill per stat
  const fill = [0.78, 0.62, 0.9, 0.71][index % 4]
  const C = 2 * Math.PI * 30

  return (
    <div className="relative bg-void/90 px-6 py-8 md:px-8 md:py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[9px] tracking-[0.26em] text-dim">
            {String(index + 1).padStart(2, '0')} / {stat.label.toUpperCase()}
          </div>
          <div className="mt-4 font-display text-[clamp(2.4rem,4.4vw,3.9rem)] font-medium leading-none tracking-tight text-star">
            <span ref={ref}>0</span>
          </div>
          <div className="mt-3 text-xs text-fog">{stat.note}</div>
        </div>
        <svg className="mt-1 h-[68px] w-[68px] -rotate-90 shrink-0" viewBox="0 0 68 68">
          <circle cx="34" cy="34" r="30" fill="none" stroke="#1a2438" strokeWidth="1.5" />
          <motion.circle
            cx="34"
            cy="34"
            r="30"
            fill="none"
            stroke="#4f86ff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={started ? { strokeDashoffset: C * (1 - fill) } : {}}
            transition={{ duration: 1.9, ease: [0.22, 1, 0.36, 1], delay: 0.25 + index * 0.12 }}
          />
          <circle cx="64" cy="34" r="1.6" className="fill-ion" />
        </svg>
      </div>
    </div>
  )
}

/** Fake live downlink waveform under the counters. */
function Waveform({ started }: { started: boolean }) {
  const points = useRef<string>(
    Array.from({ length: 60 }, (_, i) => {
      const x = (i / 59) * 600
      const y =
        26 -
        Math.sin(i * 0.55) * 8 * Math.sin(i * 0.13) -
        Math.max(0, Math.sin(i * 1.7) * 10 * (i % 17 === 0 ? 1 : 0.18))
      return `${x},${y.toFixed(1)}`
    }).join(' '),
  )

  return (
    <div className="relative overflow-hidden border-t border-line/60 bg-void/90 px-6 py-5 md:px-8">
      <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.26em] text-dim">
        <span className="h-1.5 w-1.5 rounded-full bg-ion animate-pulse-dot" />
        LIVE DOWNLINK // DSN-4 CANBERRA
        <span className="ml-auto hidden text-dim md:block">SIGNAL −112 DBM · LOCK 99.2%</span>
      </div>
      <svg className="mt-3 h-12 w-full" viewBox="0 0 600 36" preserveAspectRatio="none">
        <motion.polyline
          points={points.current}
          fill="none"
          stroke="#6fe3ff"
          strokeWidth="1"
          strokeOpacity="0.75"
          initial={{ pathLength: 0 }}
          animate={started ? { pathLength: 1 } : {}}
          transition={{ duration: 2.6, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  )
}

/** Mission telemetry dashboard — animated counters and gauges. */
export function Stats() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-18%' })

  return (
    <section className="relative px-6 py-20 md:px-12 lg:px-20 lg:py-28">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden border border-line/60"
      >
        <div className="flex items-center justify-between border-b border-line/60 bg-abyss/70 px-6 py-3.5 md:px-8">
          <span className="kicker">MISSION TELEMETRY</span>
          <span className="font-mono text-[9px] tracking-[0.22em] text-dim">
            UPDATED CONTINUOUSLY // EPOCH 2026.44
          </span>
        </div>
        <div className="grid gap-px bg-line/40 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <StatBlock key={s.id} stat={s} started={inView} index={i} />
          ))}
        </div>
        <Waveform started={inView} />
      </motion.div>
    </section>
  )
}
