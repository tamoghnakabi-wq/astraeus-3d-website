import { useEffect, useRef } from 'react'
import { motion, useTransform } from 'framer-motion'
import gsap from 'gsap'
import { scrollProgress, useStore } from '@/store/useStore'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { GlowButton } from '@/components/ui/GlowButton'

const LINE_1 = ['EXPLORING', 'THE', 'FUTURE']
const LINE_2 = ['BEYOND', 'EARTH']

/** Fake live telemetry — writes straight to the DOM, no re-renders. */
function TelemetryTicker() {
  const alt = useRef<HTMLSpanElement>(null)
  const vel = useRef<HTMLSpanElement>(null)
  const clock = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let raf = 0
    let last = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (now - last < 120) return
      last = now
      const t = (now - t0) / 1000
      if (alt.current) alt.current.textContent = (417.4 + Math.sin(t * 0.4) * 2.1).toFixed(1)
      if (vel.current) vel.current.textContent = (7.66 + Math.sin(t * 0.9) * 0.012).toFixed(3)
      if (clock.current) {
        const s = Math.floor(t)
        const h = String(Math.floor(s / 3600)).padStart(2, '0')
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
        const ss = String(s % 60).padStart(2, '0')
        clock.current.textContent = `T+${h}:${m}:${ss}`
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="flex gap-7 font-mono text-[10px] tracking-[0.18em] text-dim">
      <span>
        ALT <span ref={alt} className="text-fog">417.4</span> KM
      </span>
      <span>
        VEL <span ref={vel} className="text-fog">7.660</span> KM/S
      </span>
      <span ref={clock} className="text-fog">
        T+00:00:00
      </span>
    </div>
  )
}

/**
 * The opening frame: Earth's night side below, headline above,
 * word-by-word GSAP reveal once the loader exits.
 */
export function Hero() {
  const booted = useStore((s) => s.booted)
  const lenis = useStore((s) => s.lenis)
  const reduced = usePrefersReducedMotion()
  const root = useRef<HTMLDivElement>(null)

  const opacity = useTransform(scrollProgress, [0.045, 0.105], [1, 0])
  const y = useTransform(scrollProgress, [0.045, 0.105], [0, -70])
  const pointerEvents = useTransform(opacity, (o) => (o < 0.35 ? 'none' : 'auto'))

  useEffect(() => {
    if (!booted || !root.current) return
    // GSAP must own every animated style here via inline writes — React leaves
    // the style attribute alone as long as the JSX has no `style`/offset class
    // on these nodes, so the final state survives later re-renders.
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('[data-hero-title]', { opacity: 1 })
        gsap.set('[data-hero-word]', { yPercent: 0 })
        gsap.set('[data-hero-fade]', { opacity: 1, y: 0 })
        return
      }
      gsap.set('[data-hero-word]', { yPercent: 118 })
      gsap.set('[data-hero-title]', { opacity: 1 })
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.to('[data-hero-word]', { yPercent: 0, duration: 1.15, stagger: 0.07 }, 0.1).fromTo(
        '[data-hero-fade]',
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' },
        0.75,
      )
    }, root)
    return () => ctx.revert()
  }, [booted, reduced])

  const scrollToJourney = () => lenis?.scrollTo(window.innerHeight * 1.35, { duration: 2.2 })
  const scrollToFleet = () => lenis?.scrollTo('#fleet', { duration: 2.6 })

  return (
    <motion.div
      ref={root}
      style={{ opacity, y, pointerEvents }}
      className="fixed inset-0 z-10 flex flex-col"
    >
      {/* top spacer under navbar */}
      <div className="flex-1" />

      <div className="px-6 text-center md:px-12">
        <div data-hero-fade className="kicker opacity-0">
          ASTRAEUS AEROSPACE // FLIGHT PROGRAM 2026
        </div>

        <h1
          data-hero-title
          className="mx-auto mt-7 max-w-6xl font-display font-medium leading-[0.98] tracking-tight opacity-0 drop-shadow-[0_4px_28px_rgba(2,4,10,0.95)]"
        >
          <span className="block overflow-hidden pb-1">
            {LINE_1.map((w) => (
              <span key={w} className="inline-block overflow-hidden align-top">
                <span
                  data-hero-word
                  className="inline-block px-[0.14em] text-[clamp(2.6rem,7.2vw,6.8rem)] text-star"
                >
                  {w}
                </span>
              </span>
            ))}
          </span>
          <span className="block overflow-hidden pb-2">
            {LINE_2.map((w, i) => (
              <span key={w} className="inline-block overflow-hidden align-top">
                <span
                  data-hero-word
                  className={`inline-block px-[0.14em] text-[clamp(2.6rem,7.2vw,6.8rem)] ${
                    i === LINE_2.length - 1
                      ? 'bg-gradient-to-r from-nova via-ion to-nova bg-clip-text text-transparent'
                      : 'text-star'
                  }`}
                >
                  {w}
                </span>
              </span>
            ))}
          </span>
        </h1>

        <p
          data-hero-fade
          className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-fog opacity-0 md:text-base"
        >
          Reusable rockets. Lunar industry. A settlement on Mars. Scroll to fly the route
          humanity is building through the solar system — and past its edge.
        </p>

        <div data-hero-fade className="mt-10 flex flex-wrap items-center justify-center gap-4 opacity-0">
          <GlowButton onClick={scrollToJourney}>Begin The Journey</GlowButton>
          <GlowButton variant="ghost" onClick={scrollToFleet}>
            Explore The Fleet
          </GlowButton>
        </div>
      </div>

      {/* lower HUD strip */}
      <div className="flex flex-[1.2] items-end">
        <div
          data-hero-fade
          className="flex w-full items-end justify-between px-6 pb-8 opacity-0 md:px-12"
        >
          <div className="hidden md:block">
            <TelemetryTicker />
          </div>
          <div className="flex flex-col items-center gap-3 md:absolute md:left-1/2 md:-translate-x-1/2">
            <span className="font-mono text-[9px] tracking-[0.4em] text-dim">SCROLL</span>
            <div className="relative h-12 w-px overflow-hidden bg-line">
              <motion.span
                className="absolute left-0 top-0 h-4 w-px bg-ion"
                animate={{ y: [-16, 48] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
          <div className="hidden font-mono text-[10px] tracking-[0.18em] text-dim md:block">
            28.5729° N — 80.6490° W
          </div>
        </div>
      </div>
    </motion.div>
  )
}
