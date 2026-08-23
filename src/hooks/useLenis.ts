import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { afterProgress, pointerX, pointerY, scrollProgress, useStore } from '@/store/useStore'
import { clamp } from '@/lib/math'
import { JOURNEY_VH } from '@/data/journey'

gsap.registerPlugin(ScrollTrigger)

/**
 * Boots Lenis smooth scrolling, drives it from the GSAP ticker, and publishes
 * normalized journey progress + pointer position into shared MotionValues.
 */
export function useLenis(reducedMotion: boolean) {
  const setLenis = useStore((s) => s.setLenis)

  useEffect(() => {
    const lenis = new Lenis({
      duration: reducedMotion ? 0.01 : 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reducedMotion,
      touchMultiplier: 1.4,
    })
    setLenis(lenis)
    // QA / debug handle (used by automated visual tests)
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis

    const update = () => {
      const vh = window.innerHeight
      const journeyPx = (JOURNEY_VH / 100) * vh
      const scrollable = journeyPx - vh
      // window.scrollY is the ground truth — Lenis's own emitter is rAF-driven
      // and goes quiet in hidden tabs even when the scroll position changes.
      const y = window.scrollY
      scrollProgress.set(clamp(y / scrollable))
      afterProgress.set(clamp((y - scrollable) / (1.5 * vh)))
    }

    lenis.on('scroll', () => {
      ScrollTrigger.update()
      update()
    })

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, { passive: true })
    update()

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      pointerX.set((e.clientX / window.innerWidth) * 2 - 1)
      pointerY.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update)
      window.removeEventListener('pointermove', onPointer)
      gsap.ticker.remove(raf)
      lenis.destroy()
      setLenis(null)
    }
  }, [reducedMotion, setLenis])
}
