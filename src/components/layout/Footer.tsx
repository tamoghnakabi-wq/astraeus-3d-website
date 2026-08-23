const COLUMNS = [
  {
    title: 'PROGRAMS',
    links: ['NOVA IX', 'Selene Station', 'Ares Base', 'Odyssey Probe', 'Meridian Gateway'],
  },
  {
    title: 'COMPANY',
    links: ['Mission', 'Careers', 'Press Kit', 'Suppliers', 'Safety'],
  },
  {
    title: 'CONNECT',
    links: ['X / Twitter', 'YouTube', 'Instagram', 'Flight Updates'],
  },
]

const noop = (e: React.MouseEvent) => e.preventDefault()

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line/60 px-6 pb-10 pt-20 md:px-12 lg:px-20">
      <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-8">
        <div>
          <span className="flex items-center gap-2.5">
            <svg className="h-5 w-5" viewBox="0 0 32 32" fill="none">
              <path d="M16 3 L18.6 13.4 L29 16 L18.6 18.6 L16 29 L13.4 18.6 L3 16 L13.4 13.4 Z" fill="#4f86ff" />
            </svg>
            <span className="font-display text-sm font-semibold tracking-[0.34em] text-star">ASTRAEUS</span>
          </span>
          <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-fog">
            Building the transportation, infrastructure and industry of a multiplanetary
            civilization — one routine launch at a time.
          </p>
          <div className="mt-7 flex items-center gap-3 font-mono text-[10px] tracking-[0.22em]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#43e87a] animate-pulse-dot" />
            <span className="text-[#43e87a]/90">ALL SYSTEMS NOMINAL</span>
            <span className="text-dim">· NEXT LAUNCH T−06:14:22</span>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="font-mono text-[10px] tracking-[0.3em] text-dim">{col.title}</div>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    onClick={noop}
                    className="text-[13px] text-fog transition-colors duration-300 hover:text-ion"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* giant ghost wordmark */}
      <div
        aria-hidden
        className="text-stroke pointer-events-none mt-16 select-none text-center font-display text-[clamp(4rem,14.5vw,15rem)] font-bold leading-none tracking-[0.08em]"
      >
        ASTRAEUS
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line/50 pt-7 text-center md:flex-row md:text-left">
        <div className="font-mono text-[10px] tracking-[0.2em] text-dim">
          © 2026 ASTRAEUS AEROSPACE — A FICTIONAL SHOWCASE
        </div>
        <div className="flex gap-7 font-mono text-[10px] tracking-[0.2em] text-dim">
          <a href="#" onClick={noop} className="transition-colors hover:text-fog">PRIVACY</a>
          <a href="#" onClick={noop} className="transition-colors hover:text-fog">TERMS</a>
          <a href="#" onClick={noop} className="transition-colors hover:text-fog">ITAR NOTICE</a>
        </div>
        <div className="font-mono text-[10px] tracking-[0.2em] text-dim">
          MADE FOR HUMANS, EVERYWHERE
        </div>
      </div>
    </footer>
  )
}
