import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { TECH_CARDS } from '@/data/content'
import type { TechCard } from '@/types'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { SectionHeading } from '@/components/ui/SectionHeading'

function TechIcon({ icon }: { icon: TechCard['icon'] }) {
  const common = {
    className: 'h-7 w-7 stroke-ion transition-all duration-500 group-hover:drop-shadow-[0_0_8px_rgba(111,227,255,0.9)]',
    viewBox: '0 0 24 24',
    fill: 'none',
    strokeWidth: 1.1,
    strokeLinecap: 'round' as const,
  }
  switch (icon) {
    case 'cycle':
      return (
        <svg {...common}>
          <path d="M19 12a7 7 0 1 1-2-4.9" />
          <path d="M17 3v4.5h-4.5" />
          <path d="M12 8.5v4l2.5 1.5" opacity="0.55" />
        </svg>
      )
    case 'neural':
      return (
        <svg {...common}>
          <circle cx="5" cy="12" r="1.7" />
          <circle cx="12" cy="5" r="1.7" />
          <circle cx="12" cy="19" r="1.7" />
          <circle cx="19" cy="12" r="1.7" />
          <path d="M6.5 10.8 10.5 6.3M6.6 13 10.4 17.8M13.6 6.3l4 4.5M13.5 17.8l4-4.6" opacity="0.7" />
        </svg>
      )
    case 'quantum':
      return (
        <svg {...common}>
          <circle cx="8.5" cy="12" r="4.5" />
          <circle cx="15.5" cy="12" r="4.5" />
          <circle cx="12" cy="12" r="0.9" fill="currentColor" className="fill-ion" stroke="none" />
        </svg>
      )
    case 'forge':
      return (
        <svg {...common}>
          <path d="M12 3l6 3.5v7L12 17l-6-3.5v-7L12 3z" />
          <path d="M12 3v7m0 0l6 3.5M12 10l-6 3.5" opacity="0.6" />
          <path d="M12 17v4" opacity="0.6" />
        </svg>
      )
    case 'orbit':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2" />
          <ellipse cx="12" cy="12" rx="9" ry="3.6" />
          <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" opacity="0.6" />
          <circle cx="20.4" cy="10.6" r="1" fill="currentColor" className="fill-ion" stroke="none" />
        </svg>
      )
    case 'fusion':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="1.4" />
          <ellipse cx="12" cy="12" rx="8.5" ry="3.2" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="8.5" ry="3.2" transform="rotate(-30 12 12)" opacity="0.7" />
          <ellipse cx="12" cy="12" rx="8.5" ry="3.2" transform="rotate(90 12 12)" opacity="0.45" />
        </svg>
      )
    case 'probe':
      return (
        <svg {...common}>
          <path d="M12 7l4 5-4 5-4-5 4-5z" />
          <path d="M12 7V3M9 3h6" />
          <path d="M5.5 14.5L3 17M18.5 14.5L21 17" opacity="0.6" />
        </svg>
      )
  }
}

function TiltCard({ card, index, tiltEnabled }: { card: TechCard; index: number; tiltEnabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rx = useSpring(useTransform(my, [0, 1], [5.5, -5.5]), { stiffness: 220, damping: 24 })
  const ry = useSpring(useTransform(mx, [0, 1], [-6.5, 6.5]), { stiffness: 220, damping: 24 })
  const sheenX = useTransform(mx, [0, 1], ['-30%', '130%'])

  const onMove = (e: React.PointerEvent) => {
    if (!tiltEnabled || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  const onLeave = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.1 }}
      className={card.wide ? 'md:col-span-2' : ''}
      style={{ perspective: 900 }}
    >
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={tiltEnabled ? { rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' } : undefined}
        className="group relative flex h-full flex-col overflow-hidden border border-line/70 bg-panel/55 p-6 backdrop-blur-md transition-colors duration-500 hover:border-nova/45 md:p-7"
      >
        {/* moving sheen */}
        <motion.span
          style={{ left: sheenX }}
          className="pointer-events-none absolute top-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-star/[0.045] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <div className="flex items-start justify-between">
          <TechIcon icon={card.icon} />
          <span className="font-mono text-[9px] tracking-[0.25em] text-dim">{card.trl}</span>
        </div>
        <h3 className="mt-5 font-display text-lg tracking-wide text-star md:text-xl">{card.title}</h3>
        <p className="mt-3 text-[13px] leading-relaxed text-fog">{card.body}</p>
        <div className="mt-auto flex items-center gap-3 pt-6">
          <span className="h-1 w-1 rounded-full bg-ion animate-pulse-dot" />
          <span className="font-mono text-[9px] tracking-[0.28em] text-dim group-hover:text-ion transition-colors duration-500">
            {card.status}
          </span>
          <span className="hairline ml-auto w-10 opacity-60" />
        </div>
      </motion.div>
    </motion.div>
  )
}

/** Floating bento grid of the core technology programs. */
export function Technology() {
  const canHover = useMediaQuery('(hover: hover)')

  return (
    <section id="systems" className="relative px-6 py-28 md:px-12 lg:px-20 lg:py-36">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="relative">
        <SectionHeading
          index="02"
          kicker="Core Systems"
          title="TECHNOLOGY BUILT FOR THE VOID"
          copy="Seven programs, one architecture: every system designed to be reused, refueled, repaired and replicated — anywhere between here and the heliopause."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {TECH_CARDS.map((card, i) => (
            <TiltCard key={card.id} card={card} index={i} tiltEnabled={canHover} />
          ))}
        </div>
      </div>
    </section>
  )
}
