import { create } from 'zustand'
import { motionValue } from 'framer-motion'
import type Lenis from 'lenis'

/**
 * High-frequency values (scroll, pointer) live in MotionValues so neither React
 * nor zustand re-renders on every frame — the R3F loop and framer transforms
 * read them directly.
 */

/** Normalized progress (0–1) through the 660vh journey. */
export const scrollProgress = motionValue(0)

/** 0–1 over the first ~1.5 viewport-heights *after* the journey — dims deep space. */
export const afterProgress = motionValue(0)

/** Pointer position normalized to [-1, 1]. Zero on touch devices. */
export const pointerX = motionValue(0)
export const pointerY = motionValue(0)

export type QualityTier = 'high' | 'low'

interface AppState {
  /** True once the WebGL scene has produced its first frame. */
  ready: boolean
  /** True once the loader has fully exited — gates the hero reveal. */
  booted: boolean
  quality: QualityTier
  lenis: Lenis | null
  setReady: (v: boolean) => void
  setBooted: (v: boolean) => void
  setQuality: (q: QualityTier) => void
  setLenis: (l: Lenis | null) => void
}

export const useStore = create<AppState>((set) => ({
  ready: false,
  booted: false,
  quality: 'high',
  lenis: null,
  setReady: (ready) => set({ ready }),
  setBooted: (booted) => set({ booted }),
  setQuality: (quality) => set({ quality }),
  setLenis: (lenis) => set({ lenis }),
}))
