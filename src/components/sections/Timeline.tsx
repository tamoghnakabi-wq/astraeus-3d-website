import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { TIMELINE } from '@/data/content'
import type { TimelineEvent } from '@/types'
import { SectionHeading } from '@/components/ui/SectionHeading'

const STATUS_STYLE: Record<TimelineEvent['status'], string> = {
  ACTIVE: 'border-ion/50 text-ion',
  'IN DEVELOPMENT': 'border-nova/50 text-nova',
  PLANNED: 'border-fog/40 text-fog',
  CONCEPT: 'border-dim/50 text-dim',
  VISION: 'border-[#9d7bff]/50 text-[#9d7bff]',
}

function TimelineRow({ event }: { event: TimelineEvent }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-14%' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      className="relative grid gap-3 pb-16 pl-12 last:pb-0 md:grid-cols-[180px_1fr] md:gap-10 md:pl-20"
    >
      {/* node */}
      <span className="absolute left-[21px] top-[10px] h-3.5 w-3.5 -translate-x-1/2 border border-ion/60 bg-void md:left-[29px]">
        <span className="absolute inset-[3px] bg-ion/70" />
      </span>

      <div>
        <div className="font-display text-[clamp(1.9rem,3.4vw,3rem)] font-medium leading-none tracking-tight text-star/90">
          {event.year}
        </div>
        <span
          className={`mt-3 inline-block border px-2.5 py-1 font-mono text-[9px] tracking-[0.22em] ${STATUS_STYLE[event.status]}`}
        >
          {event.status}
        </span>
      </div>

      <div className="md:pt-1.5">
        <h3 className="font-display text-xl tracking-wide text-star">{event.title}</h3>
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-fog">{event.body}</p>
        <div className="mt-4 inline-flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] text-dim">
          <span className="h-px w-7 bg-ion/50" />
          {event.metric}
        </div>
      </div>
    </motion.div>
  )
}

/** Scroll-driven mission roadmap — the rail fills as the future approaches. */
export function Timeline() {
  const railRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ['start 0.72', 'end 0.6'],
  })
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.6 })

  return (
    <section id="roadmap" className="relative px-6 py-28 md:px-12 lg:px-20 lg:py-36">
      <SectionHeading
        index="04"
        kicker="Mission Roadmap"
        title="THE NEXT THIRTY YEARS"
        copy="Every era unlocks the one after it: orbit funds the Moon, the Moon fuels Mars, Mars teaches us to live anywhere. This is the sequence."
      />

      <div ref={railRef} className="relative mt-16">
        {/* rail */}
        <div className="absolute bottom-2 left-[21px] top-2 w-px bg-line md:left-[29px]" />
        <motion.div
          style={{ scaleY }}
          className="absolute bottom-2 left-[21px] top-2 w-px origin-top bg-gradient-to-b from-ion via-nova to-[#9d7bff] md:left-[29px]"
        />
        <div>
          {TIMELINE.map((event) => (
            <TimelineRow key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  )
}
