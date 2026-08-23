import type { FleetCraft, RocketPart, StatItem, TechCard, TimelineEvent } from '@/types'

/* ── Navigation ─────────────────────────────────────────────────────── */
export const NAV_LINKS = [
  { id: 'vehicle', index: '01', label: 'Vehicle' },
  { id: 'systems', index: '02', label: 'Systems' },
  { id: 'fleet', index: '03', label: 'Fleet' },
  { id: 'roadmap', index: '04', label: 'Roadmap' },
] as const

/* ── Statistics ─────────────────────────────────────────────────────── */
export const STATS: StatItem[] = [
  {
    id: 'missions',
    label: 'Orbital Missions',
    value: 214,
    decimals: 0,
    suffix: '',
    note: '98.6% success rate',
  },
  {
    id: 'satellites',
    label: 'Satellites Deployed',
    value: 1348,
    decimals: 0,
    suffix: '',
    note: 'across 14 constellations',
  },
  {
    id: 'distance',
    label: 'Kilometers Traveled',
    value: 4.7,
    decimals: 1,
    suffix: 'B',
    note: 'cumulative fleet distance',
  },
  {
    id: 'payload',
    label: 'Tonnes To Orbit',
    value: 12400,
    decimals: 0,
    suffix: '',
    note: 'delivered payload mass',
  },
]

/* ── Core technology cards ──────────────────────────────────────────── */
export const TECH_CARDS: TechCard[] = [
  {
    id: 'reusable',
    title: 'Reusable Launch Systems',
    body: 'Boosters that land themselves and refly within 48 hours. Full-flow staged combustion, deep-throttle landing burns, and airframes rated for 25+ flights drop cost-to-orbit below $200/kg.',
    trl: 'TRL 9',
    status: 'OPERATIONAL',
    icon: 'cycle',
    wide: true,
  },
  {
    id: 'ai-nav',
    title: 'AI Flight Intelligence',
    body: 'Onboard neural guidance replans trajectories mid-flight, manages engine-out scenarios, and docks autonomously — no ground loop required.',
    trl: 'TRL 8',
    status: 'OPERATIONAL',
    icon: 'neural',
  },
  {
    id: 'quantum',
    title: 'Quantum Communications',
    body: 'Entanglement-secured links between ground, orbit, and Luna. Unbreakable key distribution across 400,000 km of vacuum.',
    trl: 'TRL 6',
    status: 'FLIGHT TEST',
    icon: 'quantum',
  },
  {
    id: 'manufacturing',
    title: 'Orbital Manufacturing',
    body: 'Zero-g foundries grow flawless fiber optics, print structural trusses, and assemble spacecraft too large to ever launch whole.',
    trl: 'TRL 7',
    status: 'PILOT LINE',
    icon: 'forge',
  },
  {
    id: 'infrastructure',
    title: 'Orbital Infrastructure',
    body: 'Propellant depots, autonomous tugs, and the Meridian Gateway — a permanent logistics web from LEO to lunar orbit.',
    trl: 'TRL 7',
    status: 'DEPLOYING',
    icon: 'orbit',
  },
  {
    id: 'fusion',
    title: 'Fusion Propulsion',
    body: 'Magneto-inertial D–He3 drives delivering continuous thrust for months. Mars in 45 days; the outer planets in a single crew rotation.',
    trl: 'TRL 4',
    status: 'PROTOTYPE',
    icon: 'fusion',
  },
  {
    id: 'autonomous',
    title: 'Autonomous Deep-Space Craft',
    body: 'Self-repairing probes that navigate by pulsar map, manage their own power budgets, and make science decisions light-hours from Earth.',
    trl: 'TRL 5',
    status: 'IN BUILD',
    icon: 'probe',
    wide: true,
  },
]

/* ── Mission roadmap ────────────────────────────────────────────────── */
export const TIMELINE: TimelineEvent[] = [
  {
    id: 'now',
    year: '2026',
    title: 'Orbital Operations',
    body: 'A reusable fleet flying 200+ missions a year. Constellation services, orbital refueling, and crewed rotations are routine commerce.',
    status: 'ACTIVE',
    metric: '214 MISSIONS FLOWN',
  },
  {
    id: 'luna',
    year: '2029',
    title: 'Lunar Expansion',
    body: 'Selene Station scales to 50 crew. Polar ice becomes propellant; regolith becomes habitats. The Earth–Moon economy comes online.',
    status: 'IN DEVELOPMENT',
    metric: '40 T/MO ISRU TARGET',
  },
  {
    id: 'mars',
    year: '2033',
    title: 'Mars Settlement',
    body: 'First thousand-day crewed campaign at Ares Base. Closed-loop life support, food production, and the first child of two worlds.',
    status: 'PLANNED',
    metric: 'CREW 24 → 214',
  },
  {
    id: 'asteroids',
    year: '2037',
    title: 'Asteroid Mining',
    body: 'Psyche-class extractors return platinum-group metals and water from near-Earth asteroids — industry that never touches a gravity well.',
    status: 'CONCEPT',
    metric: '10⁴ T RESOURCE FLOW',
  },
  {
    id: 'fusion-era',
    year: '2042',
    title: 'Fusion Transit Era',
    body: 'Continuous-thrust fusion liners cut the solar system down to weeks. The Belt opens. Titan and Europa get permanent science settlements.',
    status: 'CONCEPT',
    metric: 'MARS IN 45 DAYS',
  },
  {
    id: 'interstellar',
    year: '2050+',
    title: 'Deep-Space Civilization',
    body: 'A million people living off Earth. Interstellar precursors coasting past the heliopause, carrying our questions toward other suns.',
    status: 'VISION',
    metric: 'PROXIMA PROBE EN ROUTE',
  },
]

/* ── Fleet ──────────────────────────────────────────────────────────── */
export const FLEET: FleetCraft[] = [
  {
    id: 'atlas',
    code: 'AS-7',
    name: 'ATLAS',
    role: 'Cargo Vehicle',
    description:
      'The workhorse of low orbit. Pressurized and unpressurized holds, autonomous berthing, and a 30-mission service life keep stations and depots supplied.',
    specs: [
      { label: 'PAYLOAD', value: '24,000 KG' },
      { label: 'LENGTH', value: '14.2 M' },
      { label: 'PROPULSION', value: 'METHALOX RCS' },
      { label: 'STATUS', value: 'OPERATIONAL' },
    ],
    accent: '#6fe3ff',
  },
  {
    id: 'aurora',
    code: 'AC-2',
    name: 'AURORA',
    role: 'Crewed Capsule',
    description:
      'Seven seats, thirty days of free flight, and a flawless abort record. Aurora carries crews to orbit, Gateway, and home through 7 km/s of fire.',
    specs: [
      { label: 'CREW', value: '7' },
      { label: 'ENDURANCE', value: '30 DAYS' },
      { label: 'HEAT SHIELD', value: 'PICA-3' },
      { label: 'STATUS', value: 'OPERATIONAL' },
    ],
    accent: '#4f86ff',
  },
  {
    id: 'selene',
    code: 'SL-4',
    name: 'SELENE',
    role: 'Lunar Lander',
    description:
      'A single-stage lunar shuttle moving 15 tonnes between orbit and the surface. Precision landing on unprepared terrain, refueled from polar ice.',
    specs: [
      { label: 'SURFACE CARGO', value: '15,000 KG' },
      { label: 'ENGINES', value: '4× K2-VAC' },
      { label: 'LANDING ACC.', value: '< 10 M' },
      { label: 'STATUS', value: 'FLIGHT QUAL' },
    ],
    accent: '#c9d4ea',
  },
  {
    id: 'ares',
    code: 'MT-1',
    name: 'ARES CLIPPER',
    role: 'Mars Transport',
    description:
      'An interplanetary liner built in orbit and never meant to land. Spins for partial gravity, shields its crew through deep space, and aerobrakes at Mars.',
    specs: [
      { label: 'TMI PAYLOAD', value: '120 T' },
      { label: 'CREW', value: '24' },
      { label: 'TRANSIT', value: '~120 DAYS' },
      { label: 'STATUS', value: 'IN DEVELOPMENT' },
    ],
    accent: '#ff9a4d',
  },
  {
    id: 'odyssey',
    code: 'DSE-X',
    name: 'ODYSSEY',
    role: 'Deep Space Explorer',
    description:
      'The prototype fusion explorer. Twelve years of autonomous endurance, a pulsar navigation suite, and instruments built for worlds without names.',
    specs: [
      { label: 'DRIVE', value: 'D–HE3 FUSION' },
      { label: 'ENDURANCE', value: '12 YEARS' },
      { label: 'ΔV BUDGET', value: '140 KM/S' },
      { label: 'STATUS', value: 'PROTOTYPE' },
    ],
    accent: '#9d7bff',
  },
]

/* ── NOVA IX rocket parts (showcase) ────────────────────────────────── */
export const ROCKET_PARTS: RocketPart[] = [
  {
    id: 'fairing',
    name: 'Payload Fairing',
    blurb: 'Carbon-composite ogive shielding the payload through max-Q, recovered and reflown.',
    specs: [
      { label: 'DIAMETER', value: '5.2 M' },
      { label: 'MATERIAL', value: 'CARBON COMPOSITE' },
      { label: 'JETTISON', value: 'T+03:12' },
    ],
    explode: 1.15,
  },
  {
    id: 'payload',
    name: 'Payload Bay',
    blurb: 'Universal adapter ring and dispenser stack — 24 tonnes to LEO, 9 to translunar injection.',
    specs: [
      { label: 'LEO CAPACITY', value: '24,000 KG' },
      { label: 'TLI CAPACITY', value: '9,200 KG' },
      { label: 'VOLUME', value: '145 M³' },
    ],
    explode: 0.85,
  },
  {
    id: 'avionics',
    name: 'GNC Avionics Ring',
    blurb: 'Triple-redundant flight computers running the ASTRA autonomous guidance stack.',
    specs: [
      { label: 'COMPUTERS', value: '3× VOTING' },
      { label: 'NAV', value: 'AI + GNSS + STELLAR' },
      { label: 'ABORT AUTHORITY', value: 'FULL AUTO' },
    ],
    explode: 0.65,
  },
  {
    id: 'stage2',
    name: 'Second Stage',
    blurb: 'Single vacuum-optimized K2-VAC engine; restartable for precision multi-orbit insertion.',
    specs: [
      { label: 'ENGINE', value: '1× K2-VAC' },
      { label: 'THRUST', value: '980 KN' },
      { label: 'RESTARTS', value: 'UP TO 6' },
    ],
    explode: 0.42,
  },
  {
    id: 'interstage',
    name: 'Interstage + Grid Fins',
    blurb: 'Titanium grid fins steer the booster home through hypersonic re-entry.',
    specs: [
      { label: 'FINS', value: '4× TITANIUM' },
      { label: 'CONTROL', value: 'MACH 8 → 0.6' },
      { label: 'SEPARATION', value: 'PNEUMATIC' },
    ],
    explode: 0.2,
  },
  {
    id: 'stage1',
    name: 'First Stage Tankage',
    blurb: 'Common-dome methalox tanks in flight-proven stainless; rated for 25 flights.',
    specs: [
      { label: 'PROPELLANT', value: 'CH₄ / LOX' },
      { label: 'CAPACITY', value: '410 T' },
      { label: 'REUSE RATING', value: '25 FLIGHTS' },
    ],
    explode: 0,
  },
  {
    id: 'engines',
    name: 'K2 Engine Cluster',
    blurb: 'Nine full-flow staged-combustion engines; lands on the center three.',
    specs: [
      { label: 'ENGINES', value: '9× K2-SL' },
      { label: 'LIFTOFF THRUST', value: '7.6 MN' },
      { label: 'THROTTLE', value: '40–100%' },
    ],
    explode: -0.6,
  },
  {
    id: 'legs',
    name: 'Landing System',
    blurb: 'Four carbon-fiber legs and a regeneratively cooled base heat shield for propulsive return.',
    specs: [
      { label: 'LEGS', value: '4× DEPLOYABLE' },
      { label: 'TOUCHDOWN', value: '< 2 M/S' },
      { label: 'SHIELD', value: 'REGEN-COOLED' },
    ],
    explode: -0.32,
  },
]
