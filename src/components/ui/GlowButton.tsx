interface GlowButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost'
  className?: string
}

export function GlowButton({ children, onClick, variant = 'primary', className = '' }: GlowButtonProps) {
  const base =
    'group relative inline-flex items-center gap-3 overflow-hidden px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.28em] transition-all duration-500'
  const styles =
    variant === 'primary'
      ? 'border border-nova/60 bg-nova/10 text-star hover:bg-nova/25 hover:shadow-[0_0_36px_-6px_rgba(79,134,255,0.55)]'
      : 'border border-line text-fog hover:border-fog/60 hover:text-star'

  return (
    <button onClick={onClick} className={`${base} ${styles} ${className}`}>
      {/* sweep highlight */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative">{children}</span>
      <svg
        className="relative h-3 w-3 transition-transform duration-500 group-hover:translate-x-1"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M1 6h10M7 2l4 4-4 4" />
      </svg>
    </button>
  )
}
