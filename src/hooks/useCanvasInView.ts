import { useEffect, useRef, useState } from 'react'

/**
 * Pauses a secondary <Canvas> when its section scrolls offscreen.
 * Attach `ref` to the canvas wrapper and pass `frameloop` to the Canvas.
 */
export function useCanvasInView<T extends HTMLElement = HTMLDivElement>(rootMargin = '300px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  return { ref, inView, frameloop: (inView ? 'always' : 'never') as 'always' | 'never' }
}
