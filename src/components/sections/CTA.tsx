import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { GlowButton } from '@/components/ui/GlowButton'

/** Closing call-to-action over a rising planetary limb glow. */
export function CTA() {
  const lenis = useStore((s) => s.lenis)

  return (
    <section className="relative overflow-hidden px-6 pb-40 pt-32 text-center md:px-12 lg:pt-44">
      {/* planetary limb */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-full h-[60vw] w-[140vw] -translate-x-1/2 -translate-y-[16%] rounded-[50%]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(79,134,255,0.32) 0%, rgba(79,134,255,0.08) 28%, rgba(2,4,10,0) 55%)',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-full h-[58vw] w-[136vw] -translate-x-1/2 -translate-y-[12%] rounded-[50%] bg-void shadow-[0_-1px_40px_rgba(111,227,255,0.22)]" />

      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-14%' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div className="kicker">CREW APPLICATIONS // CYCLE 27 OPEN</div>
        <h2 className="mx-auto mt-6 max-w-4xl font-display text-[clamp(2.2rem,5.6vw,4.8rem)] font-medium leading-[1.02] tracking-tight text-star">
          THE NEXT GIANT LEAP
          <br />
          <span className="bg-gradient-to-r from-nova via-ion to-nova bg-clip-text text-transparent">
            ALREADY HAS A LAUNCH DATE
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-fog md:text-base">
          Engineers, pilots, physicians, builders — the off-world workforce is hiring.
          Earth is the training ground.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <GlowButton>Join The Mission</GlowButton>
          <GlowButton variant="ghost" onClick={() => lenis?.scrollTo(0, { duration: 2.4 })}>
            Replay The Journey
          </GlowButton>
        </div>
      </motion.div>
    </section>
  )
}
