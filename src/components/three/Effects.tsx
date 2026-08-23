import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'

interface EffectsProps {
  /** Mounts the composer at all (off on mobile / low-quality tier). */
  enabled: boolean
  /**
   * Runs the composer this frame. Toggled off (without unmounting, so no
   * shader recompile hitch) once the DOM sections cover the canvas.
   */
  active: boolean
}

/**
 * Cinematic grade: soft mip-blurred bloom for emissives (plumes, city lights,
 * the accretion disk) and a vignette to pull the eye center-frame.
 * Multisampling 2 — with the mip blur on top, 4× brings no visible gain.
 */
export function Effects({ enabled, active }: EffectsProps) {
  if (!enabled) return null
  return (
    <EffectComposer multisampling={2} enabled={active}>
      <Bloom intensity={0.85} luminanceThreshold={0.32} luminanceSmoothing={0.22} mipmapBlur radius={0.72} />
      <Vignette eskil={false} offset={0.16} darkness={0.82} />
    </EffectComposer>
  )
}
