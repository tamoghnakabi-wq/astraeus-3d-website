import { useEffect, useRef } from 'react'

interface CountUpOptions {
  /** Animate when this flips to true (e.g. from useInView). */
  start: boolean
  duration?: number
  decimals?: number
  suffix?: string
  reducedMotion?: boolean
}

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

/**
 * Imperative count-up that writes straight to the DOM node —
 * no React re-renders at 60fps.
 */
export function useCountUp(target: number, options: CountUpOptions) {
  const { start, duration = 2200, decimals = 0, suffix = '', reducedMotion = false } = options
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const fmt = (v: number) =>
      v.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) + suffix

    if (!start) {
      el.textContent = fmt(0)
      return
    }
    if (reducedMotion) {
      el.textContent = fmt(target)
      return
    }

    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      el.textContent = fmt(target * easeOutExpo(t))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, target, duration, decimals, suffix, reducedMotion])

  return ref
}
