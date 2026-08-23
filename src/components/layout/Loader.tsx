import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/store/useStore'

const PHASES = [
  'INITIALIZING GUIDANCE',
  'ALIGNING STAR TRACKERS',
  'PRESSURIZING TANKS',
  'POLLING RANGE SAFETY',
  'GO FOR LAUNCH',
]

const LETTERS = 'ASTRAEUS'.split('')

/**
 * Boot screen — covers WebGL shader compilation, then slides away and
 * hands off to the hero reveal via the `booted` flag.
 */
export function Loader() {
  const ready = useStore((s) => s.ready)
  const setBooted = useStore((s) => s.setBooted)
  const [minDone, setMinDone] = useState(false)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), 2100)
    const p = setInterval(() => setPhase((v) => Math.min(v + 1, PHASES.length - 1)), 430)
    return () => {
      clearTimeout(t)
      clearInterval(p)
    }
  }, [])

  const done = ready && minDone

  // Hand off to the hero reveal once the exit slide finishes.
  // (Timer fallback in addition to onExitComplete — StrictMode double-mounts
  // can swallow AnimatePresence's exit callback.)
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setBooted(true), 1000)
    return () => clearTimeout(t)
  }, [done, setBooted])

  return (
    <AnimatePresence onExitComplete={() => setBooted(true)}>
      {!done && (
        <motion.div
          exit={{ y: '-100%' }}
          transition={{ duration: 0.95, ease: [0.83, 0, 0.17, 1] }}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-void"
        >
          <div className="flex items-center gap-[0.5em] overflow-hidden">
            {LETTERS.map((l, i) => (
              <motion.span
                key={i}
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.055, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-2xl font-medium tracking-[0.3em] text-star md:text-3xl"
              >
                {l}
              </motion.span>
            ))}
          </div>

          <div className="relative mt-8 h-px w-56 overflow-hidden bg-line md:w-72">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: ready ? 1 : 0.86 }}
              transition={
                ready
                  ? { duration: 0.4, ease: 'easeOut' }
                  : { duration: 1.9, ease: [0.22, 1, 0.36, 1] }
              }
              className="h-full w-full origin-left bg-gradient-to-r from-nova to-ion"
            />
          </div>

          <div className="mt-5 flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] text-dim">
            <motion.span
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
              className="h-1 w-1 rounded-full bg-ion"
            />
            {PHASES[phase]}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
