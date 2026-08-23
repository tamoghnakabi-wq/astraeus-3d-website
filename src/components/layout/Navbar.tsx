import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NAV_LINKS } from '@/data/content'
import { useStore } from '@/store/useStore'

function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <svg className="h-5 w-5" viewBox="0 0 32 32" fill="none">
        <path d="M16 3 L18.6 13.4 L29 16 L18.6 18.6 L16 29 L13.4 18.6 L3 16 L13.4 13.4 Z" fill="#4f86ff" />
      </svg>
      <span className="font-display text-sm font-semibold tracking-[0.34em] text-star">ASTRAEUS</span>
    </span>
  )
}

export function Navbar() {
  const booted = useStore((s) => s.booted)
  const lenis = useStore((s) => s.lenis)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (open) lenis?.stop()
    else lenis?.start()
  }, [open, lenis])

  const goTo = (id: string) => {
    setOpen(false)
    // let the menu close before the flight
    requestAnimationFrame(() => lenis?.scrollTo(`#${id}`, { duration: 2.2, offset: -10 }))
  }

  return (
    <>
      <motion.header
        initial={{ y: -72, opacity: 0 }}
        animate={booted ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          scrolled ? 'border-b border-line/60 bg-void/70 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <nav className="flex h-16 items-center justify-between px-6 md:h-[72px] md:px-12">
          <button onClick={() => lenis?.scrollTo(0, { duration: 2.2 })} aria-label="Back to top">
            <Wordmark />
          </button>

          <div className="hidden items-center gap-9 md:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => goTo(link.id)}
                className="group font-mono text-[10px] tracking-[0.28em] text-fog transition-colors hover:text-star"
              >
                <span className="text-nova/80">{link.index}</span>
                <span className="ml-2 uppercase">{link.label}</span>
                <span className="mt-1 block h-px w-0 bg-ion transition-all duration-400 group-hover:w-full" />
              </button>
            ))}
          </div>

          <div className="hidden md:block">
            <button className="border border-line px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.28em] text-fog transition-all duration-400 hover:border-ion/60 hover:text-ion hover:shadow-[0_0_24px_-8px_rgba(111,227,255,0.6)]">
              Initiate Contact
            </button>
          </div>

          {/* mobile burger */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="relative flex h-9 w-9 items-center justify-center md:hidden"
          >
            <span
              className={`absolute h-px w-5 bg-star transition-all duration-300 ${
                open ? 'rotate-45' : '-translate-y-[4px]'
              }`}
            />
            <span
              className={`absolute h-px w-5 bg-star transition-all duration-300 ${
                open ? '-rotate-45' : 'translate-y-[4px]'
              }`}
            />
          </button>
        </nav>
      </motion.header>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-30 flex flex-col justify-center bg-void/95 px-8 backdrop-blur-xl md:hidden"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.button
                key={link.id}
                initial={{ opacity: 0, x: -26 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ delay: 0.08 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => goTo(link.id)}
                className="flex items-baseline gap-4 border-b border-line/50 py-5 text-left"
              >
                <span className="font-mono text-[10px] tracking-[0.2em] text-nova">{link.index}</span>
                <span className="font-display text-3xl tracking-wide text-star">{link.label}</span>
              </motion.button>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 font-mono text-[10px] tracking-[0.3em] text-dim"
            >
              EXPLORING THE FUTURE BEYOND EARTH
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
