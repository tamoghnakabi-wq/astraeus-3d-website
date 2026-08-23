import { motion } from 'framer-motion'

interface SectionHeadingProps {
  index: string
  kicker: string
  title: string
  copy?: string
}

const ease = [0.22, 1, 0.36, 1] as const

export function SectionHeading({ index, kicker, title, copy }: SectionHeadingProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,420px)] lg:items-end lg:gap-16">
      <div>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.7, ease }}
          className="flex items-center gap-4"
        >
          <span className="kicker">
            {index} — {kicker}
          </span>
          <span className="hairline w-24" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.9, ease, delay: 0.08 }}
          className="mt-5 font-display text-[clamp(2.1rem,5vw,4.2rem)] font-medium leading-[1.02] tracking-tight text-star"
        >
          {title}
        </motion.h2>
      </div>
      {copy && (
        <motion.p
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.8, ease, delay: 0.18 }}
          className="max-w-md text-sm leading-relaxed text-fog lg:pb-2"
        >
          {copy}
        </motion.p>
      )}
    </div>
  )
}
