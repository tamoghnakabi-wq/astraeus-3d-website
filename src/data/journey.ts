import type { CameraKeyframe, JourneyOverlay, SceneRange, Vec3 } from '@/types'

/**
 * Single source of truth for the scroll-driven space journey.
 * World layout: scenes are stationed along -Z and the camera flies between them.
 */

/** Total scroll height of the journey, in viewport-heights. */
export const JOURNEY_VH = 660

/* ── Scene world positions ──────────────────────────────────────────── */
export const EARTH_POS: Vec3 = [0, -2.1, 0]
export const EARTH_RADIUS = 1.55

export const LAUNCH_POS: Vec3 = [10, -1, -16]

export const MOON_POS: Vec3 = [-9, 0.6, -46]
export const MOON_RADIUS = 2.6

export const MARS_POS: Vec3 = [8.5, -0.8, -78]
export const MARS_RADIUS = 3.2

export const BLACKHOLE_POS: Vec3 = [-2, 0.4, -118]

/** Sun direction (normalized-ish, from surface toward the sun). Shared by all scenes. */
export const SUN_DIR: Vec3 = [-0.74, 0.28, -0.62]
export const SUN_POS: Vec3 = [-90, 36, -76]

/* ── Camera flight path ─────────────────────────────────────────────── */
export const CAMERA_KEYS: CameraKeyframe[] = [
  // Hero — Earth's limb arcs across the lower frame, night side facing us
  { p: 0.0, pos: [0, 0.05, 3.85], tgt: [0, -0.52, 0] },
  { p: 0.11, pos: [0.18, 0.12, 3.68], tgt: [0, -0.5, 0] },
  // Pull back into low orbit — satellites, station, comm bursts
  { p: 0.2, pos: [2.7, 0.9, 4.8], tgt: [0, -2.1, 0] },
  { p: 0.3, pos: [3.5, 1.15, 3.8], tgt: [0, -2.1, 0] },
  // Fly to the ascent corridor — NOVA IX climbing
  { p: 0.4, pos: [10.9, -0.9, -12.6], tgt: [10, -0.5, -16] },
  { p: 0.52, pos: [11.05, 0.7, -12.3], tgt: [10, 1.15, -16] },
  // Translunar — arrive over Selene Station, drifting toward the Mars-side limb
  { p: 0.6, pos: [-7.6, 2.05, -39.2], tgt: [-9, 0.75, -46] },
  { p: 0.7, pos: [-6.2, 1.8, -40.0], tgt: [-9, 0.5, -46] },
  // Mars approach — Ares Base on the sunward face
  { p: 0.78, pos: [10.2, 1.3, -69.5], tgt: [8.5, -0.7, -78] },
  { p: 0.86, pos: [12.0, 0.9, -70.5], tgt: [8.5, -0.9, -78] },
  // Swing wide of Mars and run for deep space
  { p: 0.905, pos: [14.6, 1.7, -83], tgt: [-2, 0.4, -118] },
  { p: 0.96, pos: [1.5, 0.6, -101], tgt: [-2, 0.4, -118] },
  { p: 1.0, pos: [-0.9, 0.4, -109.6], tgt: [-2, 0.4, -118] },
]

/* ── Scene visibility windows (with margins for transitions) ────────── */
export const RANGES: Record<string, SceneRange> = {
  earth: { start: -0.01, end: 0.58 },
  satellites: { start: -0.01, end: 0.44 },
  launch: { start: 0.3, end: 0.62 },
  moon: { start: 0.5, end: 0.76 },
  mars: { start: 0.66, end: 0.94 },
  deep: { start: 0.8, end: 10 }, // stays alive behind the post-journey sections
}

/** Local animation window for the rocket ascent. */
export const LAUNCH_ANIM: SceneRange = { start: 0.36, end: 0.55 }

/* ── Narrative overlays ─────────────────────────────────────────────── */
export const OVERLAYS: JourneyOverlay[] = [
  {
    id: 'orbit',
    phase: 'PHASE 01 // LOW EARTH ORBIT',
    title: 'A LIVING NETWORK ABOVE US',
    copy: 'Over 1,300 ASTRAEUS satellites and orbital platforms move in constant formation — relaying data, refueling vehicles in flight, and watching the planet breathe in real time.',
    data: [
      { label: 'ALTITUDE', value: '420 KM' },
      { label: 'VELOCITY', value: '7.66 KM/S' },
      { label: 'ASSETS', value: '1,348' },
    ],
    align: 'left',
    window: [0.155, 0.19, 0.295, 0.33],
  },
  {
    id: 'ascent',
    phase: 'PHASE 02 // ASCENT',
    title: 'LEAVING EARTH, ROUTINELY',
    copy: 'NOVA IX lifts 24 tonnes to orbit, lands itself, and flies again within 48 hours. Two hundred and fourteen missions in — ascent is no longer an event. It is a schedule.',
    data: [
      { label: 'THRUST', value: '7.6 MN' },
      { label: 'MECO', value: 'T+02:38' },
      { label: 'REUSE', value: 'FLIGHT 25' },
    ],
    align: 'right',
    window: [0.385, 0.42, 0.525, 0.56],
  },
  {
    id: 'moon',
    phase: 'PHASE 03 // LUNA',
    title: 'THE EIGHTH CONTINENT',
    copy: 'Selene Station mines water ice at the lunar south pole and prints habitats from regolith. The Moon is no longer a destination — it is industrial ground, three days from home.',
    data: [
      { label: 'OUTPOST', value: 'SELENE STATION' },
      { label: 'CREW', value: '18 PERMANENT' },
      { label: 'ISRU OUTPUT', value: '40 T/MO' },
    ],
    align: 'left',
    window: [0.585, 0.62, 0.715, 0.75],
  },
  {
    id: 'mars',
    phase: 'PHASE 04 // MARS',
    title: 'A SECOND HOME FOR HUMANITY',
    copy: 'Ares Base shelters 214 settlers under pressurized domes. Atmospheric processors run day and night — the first centimeters of a sky that will take centuries to build.',
    data: [
      { label: 'MISSION CLOCK', value: 'SOL 1,247' },
      { label: 'POPULATION', value: '214' },
      { label: 'O₂ FARMS', value: 'ONLINE' },
    ],
    align: 'right',
    window: [0.765, 0.8, 0.875, 0.905],
  },
  {
    id: 'deep',
    phase: 'PHASE 05 // INTERSTELLAR',
    title: 'INTO THE DARK BETWEEN STARS',
    copy: 'Fusion-driven vessels chart the outer system, and probes already coast toward other suns. Past the event horizon of what we know, the journey has only begun.',
    data: [
      { label: 'TARGET', value: 'PROXIMA b' },
      { label: 'PROBE ETA', value: '2071' },
    ],
    align: 'center',
    window: [0.925, 0.955, 0.985, 1.0],
  },
]
