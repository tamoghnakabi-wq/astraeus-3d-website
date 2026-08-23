# ASTRAEUS — Exploring The Future Beyond Earth

A cinematic, scroll-driven 3D website for a fictional aerospace company. One continuous
camera flight takes the visitor from Earth's night side through low orbit, a rocket
ascent, the Moon, Mars, and finally deep space — then hands off to interactive product
sections: an exploded-view rocket showcase, a technology grid, a telemetry dashboard,
a five-vehicle fleet hangar, and a mission roadmap.

Everything you see is **procedurally generated** — Earth, the Moon, Mars, the nebulae,
the black hole, and every spacecraft are built from code and shaders. The project ships
zero texture or model assets.

## Stack

| Layer | Tech |
| --- | --- |
| Framework | React 19 + TypeScript + Vite |
| 3D | three.js, @react-three/fiber, @react-three/drei, @react-three/postprocessing |
| Animation | GSAP (timelines, exploded view), Framer Motion (scroll-linked UI), Lenis (smooth scroll) |
| Styling | Tailwind CSS v4 (`@theme` design tokens) |
| State | zustand (app flags) + Framer MotionValues (per-frame scroll/pointer bus) |

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build → dist/
npm run preview    # serve the production build
```

## How the journey works

- `src/data/journey.ts` is the single source of truth: camera keyframes, scene world
  positions, visibility windows, and overlay copy all live there.
- `useLenis` publishes normalized scroll progress (0–1 across a 660vh runway) into a
  shared `MotionValue`. Nothing re-renders per frame — the R3F loop and Framer
  transforms read it directly.
- `CameraRig` interpolates between keyframes with per-segment easing (so the camera
  *dwells* at each station), then layers damping, pointer parallax, hand-held drift,
  launch shake, and a speed-based FOV kick on top.
- Each scene (`src/components/three/scenes/`) gates its own `visible` flag from the
  same progress value, so off-screen stations cost nothing.

## Performance notes

- **Earth is baked, not computed**: the procedural surface (continents, biomes, ice,
  city lights) renders once at startup into two equirect textures
  (`lib/earthBake.ts`). The per-frame planet shader is two texture taps + lighting —
  zero noise evaluation — instead of ~36 simplex calls per pixel.
- **The background canvas has three render stages**: full pipeline during the journey;
  composer bypassed (no recompile) once the DOM sections cover most of it; frame loop
  fully stopped once they cover it completely. Hysteresis prevents flapping.
- **Warm-up pre-render**: every scene is drawn once with culling disabled while the
  loader still covers the screen, so all programs compile and buffers upload up front —
  no first-visit frame spike mid-scroll.
- DPR is capped at **1.75** on Retina (≈23% fewer fragments than native 2×,
  indistinguishable under bloom + AA); composer multisampling is 2.
- The showcase and fleet viewers are separate canvases that **pause completely** when
  scrolled off-screen (`useCanvasInView`); their highlight loop runs on cached material
  arrays, not scene-graph traversal.
- `PerformanceMonitor` drops the quality tier (disables post-processing, caps DPR at
  1.25) if the frame rate declines; mobile starts with a 1024px bake, reduced particle
  counts, lower planet tessellation, and no post-processing.
- Planet terrain is displaced once on the CPU at mount; repeated rocket elements share
  geometry buffers; all per-frame work is uniform updates and matrix writes.
- High-frequency state (scroll, pointer) lives in MotionValues — zero React re-renders
  per frame anywhere on the page.

## Accessibility

- `prefers-reduced-motion` disables smooth scrolling, parallax, and the hero
  word-reveal (content appears immediately; counters snap to final values).
- The journey overlays are plain DOM text — selectable, zoomable, SEO-visible.

## Project structure

```
src/
├── data/            journey keyframes + all site copy/specs
├── store/           zustand store + MotionValue bus
├── hooks/           lenis bootstrap, media queries, count-up, canvas pausing
├── lib/             math, CPU noise, procedural sprite textures
└── components/
    ├── three/       journey canvas, camera rig, shaders, five scenes, rocket model
    ├── showcase/    interactive NOVA IX engineering view (exploded view, part specs)
    ├── fleet/       five procedural spacecraft + hangar viewer
    ├── sections/    hero, journey overlays, technology, stats, timeline, CTA
    ├── layout/      navbar, footer, boot loader
    └── ui/          section headings, glow buttons
```

## QA hooks

`window.__lenis` exposes the Lenis instance in all builds —
`__lenis.scrollTo(document.body.scrollHeight * 0.4, { immediate: true })` jumps the
journey to any phase for visual testing.

---

ASTRAEUS is a fictional company; all specifications are invented for this showcase.
