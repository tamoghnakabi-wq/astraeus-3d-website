/** Shared domain types for the ASTRAEUS site. */

export type Vec3 = [number, number, number]

export interface CameraKeyframe {
  /** Normalized journey progress (0–1) at which this keyframe applies. */
  p: number
  pos: Vec3
  tgt: Vec3
}

export interface SceneRange {
  start: number
  end: number
}

export interface JourneyOverlay {
  id: string
  phase: string
  title: string
  copy: string
  data: { label: string; value: string }[]
  /** Horizontal placement of the text block on desktop. */
  align: 'left' | 'right' | 'center'
  /** Opacity window: [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd] over journey progress. */
  window: [number, number, number, number]
}

export interface TechCard {
  id: string
  title: string
  body: string
  trl: string
  status: string
  icon: 'cycle' | 'neural' | 'quantum' | 'forge' | 'orbit' | 'fusion' | 'probe'
  wide?: boolean
}

export interface StatItem {
  id: string
  label: string
  value: number
  decimals: number
  suffix: string
  note: string
}

export interface TimelineEvent {
  id: string
  year: string
  title: string
  body: string
  status: 'ACTIVE' | 'IN DEVELOPMENT' | 'PLANNED' | 'CONCEPT' | 'VISION'
  metric: string
}

export interface FleetCraft {
  id: string
  code: string
  name: string
  role: string
  description: string
  specs: { label: string; value: string }[]
  accent: string
}

export interface RocketPart {
  id: string
  name: string
  blurb: string
  specs: { label: string; value: string }[]
  /** Vertical offset applied in exploded view (model units). */
  explode: number
}
