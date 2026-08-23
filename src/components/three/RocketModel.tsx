import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'

/**
 * NOVA IX — fully procedural launch vehicle (no model assets).
 * Each named part lives in its own group so the showcase can explode the
 * stack, highlight components, and dim the rest. Every mesh gets its own
 * material instance (created by JSX), so per-part fades never bleed.
 */

export const ROCKET_NOZZLE_Y = -3.02
export const ROCKET_HEIGHT = 6.1

const WHITE = { color: '#e8ebf2', metalness: 0.25, roughness: 0.38 } as const
const DARK = { color: '#20242d', metalness: 0.85, roughness: 0.42 } as const
const TITANIUM = { color: '#9aa0ab', metalness: 0.9, roughness: 0.35 } as const
const BELL = { color: '#2e333d', metalness: 0.95, roughness: 0.3, side: THREE.DoubleSide } as const

export interface RocketPartHandlers {
  onPartOver?: (id: string, e: ThreeEvent<PointerEvent>) => void
  onPartOut?: (id: string, e: ThreeEvent<PointerEvent>) => void
  onPartClick?: (id: string, e: ThreeEvent<MouseEvent>) => void
  registerPart?: (id: string, group: THREE.Group | null) => void
}

interface RocketModelProps extends RocketPartHandlers {
  interactive?: boolean
  /** Rendered inside the matching part group — follows it through the exploded view. */
  callout?: { id: string; node: React.ReactNode }
}

function Part({
  id,
  children,
  interactive,
  onPartOver,
  onPartOut,
  onPartClick,
  registerPart,
  callout,
}: { id: string; children: React.ReactNode } & RocketModelProps) {
  const handlers = interactive
    ? {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          onPartOver?.(id, e)
        },
        onPointerOut: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          onPartOut?.(id, e)
        },
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          onPartClick?.(id, e)
        },
      }
    : {}

  return (
    <group ref={(g) => registerPart?.(id, g)} userData={{ partId: id }} {...handlers}>
      {children}
      {callout?.id === id ? callout.node : null}
    </group>
  )
}

export function RocketModel(props: RocketModelProps) {
  // ring of 8 outer engines + 1 center
  const enginePositions = useMemo(() => {
    const out: [number, number][] = [[0, 0]]
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      out.push([Math.cos(a) * 0.165, Math.sin(a) * 0.165])
    }
    return out
  }, [])

  const legAngles = useMemo(() => [0.4, 1.97, 3.54, 5.11], [])
  const finAngles = useMemo(() => [0.79, 2.36, 3.93, 5.5], [])

  // geometries reused across the repeated elements (9 bells, 4 legs, 4 fins,
  // 10 avionics windows) — one buffer each instead of one per mesh
  const shared = useMemo(
    () => ({
      bell: new THREE.CylinderGeometry(0.042, 0.095, 0.26, 20, 1, true),
      bellCap: new THREE.CylinderGeometry(0.03, 0.042, 0.06, 12),
      leg: new THREE.BoxGeometry(0.05, 1.62, 0.11),
      pad: new THREE.BoxGeometry(0.16, 0.05, 0.14),
      fin: new THREE.BoxGeometry(0.17, 0.022, 0.27),
      finMount: new THREE.BoxGeometry(0.05, 0.04, 0.06),
      dot: new THREE.BoxGeometry(0.008, 0.05, 0.028),
    }),
    [],
  )
  useEffect(() => () => Object.values(shared).forEach((g) => g.dispose()), [shared])

  return (
    // recenter the stack so the model origin sits at its visual middle
    <group position={[0, -0.385, 0]}>
      {/* ── First stage ── */}
      <Part id="stage1" {...props}>
        <mesh position={[0, -0.9, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 2.6, 48]} />
          <meshStandardMaterial {...WHITE} />
        </mesh>
        {/* cable raceway */}
        <mesh position={[0.265, -0.9, 0]}>
          <boxGeometry args={[0.045, 2.45, 0.07]} />
          <meshStandardMaterial {...DARK} />
        </mesh>
        {/* plumbing rings */}
        {[-1.95, -0.25].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.262, 0.007, 8, 48]} />
            <meshStandardMaterial {...DARK} />
          </mesh>
        ))}
        {/* wordmark band */}
        <mesh position={[0, -1.45, 0]}>
          <cylinderGeometry args={[0.262, 0.262, 0.05, 48]} />
          <meshStandardMaterial color="#0a1020" emissive="#4f86ff" emissiveIntensity={0.55} metalness={0.4} roughness={0.4} />
        </mesh>
      </Part>

      {/* ── Engine section ── */}
      <Part id="engines" {...props}>
        <mesh position={[0, -2.32, 0]}>
          <cylinderGeometry args={[0.27, 0.275, 0.28, 48]} />
          <meshStandardMaterial {...DARK} />
        </mesh>
        {enginePositions.map(([x, z], i) => (
          <group key={i} position={[x, -2.58, z]}>
            <mesh geometry={shared.bell}>
              <meshStandardMaterial {...BELL} />
            </mesh>
            <mesh position={[0, 0.14, 0]} geometry={shared.bellCap}>
              <meshStandardMaterial {...TITANIUM} />
            </mesh>
          </group>
        ))}
      </Part>

      {/* ── Landing system (legs + base heat shield) ── */}
      <Part id="legs" {...props}>
        <mesh position={[0, -2.475, 0]}>
          <cylinderGeometry args={[0.272, 0.255, 0.07, 48]} />
          <meshStandardMaterial color="#15181f" metalness={0.6} roughness={0.55} />
        </mesh>
        {legAngles.map((a) => (
          <group key={a} rotation={[0, a, 0]}>
            <mesh position={[0.285, -1.62, 0]} rotation={[0, 0, -0.1]} geometry={shared.leg}>
              <meshStandardMaterial {...DARK} />
            </mesh>
            <mesh position={[0.36, -2.41, 0]} geometry={shared.pad}>
              <meshStandardMaterial {...TITANIUM} />
            </mesh>
          </group>
        ))}
      </Part>

      {/* ── Interstage + grid fins ── */}
      <Part id="interstage" {...props}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.262, 0.262, 0.38, 48]} />
          <meshStandardMaterial color="#14171d" metalness={0.7} roughness={0.5} />
        </mesh>
        {finAngles.map((a) => (
          <group key={a} rotation={[0, a, 0]}>
            <mesh position={[0.345, 0.62, 0]} geometry={shared.fin}>
              <meshStandardMaterial {...TITANIUM} />
            </mesh>
            <mesh position={[0.275, 0.62, 0]} geometry={shared.finMount}>
              <meshStandardMaterial {...DARK} />
            </mesh>
          </group>
        ))}
      </Part>

      {/* ── Second stage ── */}
      <Part id="stage2" {...props}>
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.9, 48]} />
          <meshStandardMaterial {...WHITE} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.045, 0.1, 0.16, 20, 1, true]} />
          <meshStandardMaterial {...BELL} />
        </mesh>
      </Part>

      {/* ── Avionics / GNC ring ── */}
      <Part id="avionics" {...props}>
        <mesh position={[0, 1.62, 0]}>
          <cylinderGeometry args={[0.266, 0.266, 0.14, 48]} />
          <meshStandardMaterial color="#181c25" metalness={0.8} roughness={0.35} />
        </mesh>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.267, 1.62, Math.sin(a) * 0.267]}
              rotation={[0, -a, 0]}
              geometry={shared.dot}
            >
              <meshStandardMaterial color="#0c1322" emissive="#6fe3ff" emissiveIntensity={1.6} />
            </mesh>
          )
        })}
      </Part>

      {/* ── Payload bay ── */}
      <Part id="payload" {...props}>
        <mesh position={[0, 1.95, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.52, 48]} />
          <meshStandardMaterial {...WHITE} />
        </mesh>
        <mesh position={[0, 1.79, 0]}>
          <cylinderGeometry args={[0.2615, 0.2615, 0.022, 48]} />
          <meshStandardMaterial color="#0a1020" emissive="#4f86ff" emissiveIntensity={1.4} />
        </mesh>
      </Part>

      {/* ── Fairing ── */}
      <Part id="fairing" {...props}>
        <mesh position={[0, 2.36, 0]}>
          <cylinderGeometry args={[0.3, 0.26, 0.32, 48]} />
          <meshStandardMaterial {...WHITE} />
        </mesh>
        {/* ogive nose built from a lathe profile for a smooth aero curve */}
        <mesh position={[0, 2.52, 0]}>
          <latheGeometry
            args={[
              Array.from({ length: 14 }, (_, i) => {
                const t = i / 13
                // circular-arc ogive: radius eases from 0.3 to 0
                const r = 0.3 * Math.cos(t * Math.PI * 0.5)
                return new THREE.Vector2(r, t * 0.95)
              }),
              48,
            ]}
          />
          <meshStandardMaterial {...WHITE} />
        </mesh>
        <mesh position={[0, 2.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.301, 0.005, 8, 48]} />
          <meshStandardMaterial {...DARK} />
        </mesh>
      </Part>
    </group>
  )
}
