import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getSoftCircleTexture } from '@/lib/textures'

/**
 * The ASTRAEUS fleet — five procedural spacecraft, one component each.
 * All are normalized to roughly a 3-unit bounding box for the shared viewer.
 */

const HULL = { color: '#dde2ec', metalness: 0.45, roughness: 0.4 } as const
const METAL = { color: '#8d96a6', metalness: 0.85, roughness: 0.35 } as const
const DARK = { color: '#23272f', metalness: 0.7, roughness: 0.45 } as const
const PANEL = {
  color: '#16305c',
  metalness: 0.55,
  roughness: 0.3,
  emissive: '#234b8f',
  emissiveIntensity: 0.55,
} as const

function EngineGlow({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  return (
    <sprite position={position} scale={[0.8 * scale, 0.8 * scale, 1]}>
      <spriteMaterial
        map={getSoftCircleTexture()}
        color={color}
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  )
}

/* ── AS-7 ATLAS · cargo vehicle ─────────────────────────────────────── */
export function AtlasCargo() {
  return (
    <group rotation={[0.06, 0, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.46, 0.46, 1.9, 32]} />
        <meshStandardMaterial {...HULL} />
      </mesh>
      {/* docking nose */}
      <mesh position={[1.12, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.38, 0.35, 24]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      <mesh position={[1.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.2, 0.035, 10, 24]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      {/* service module */}
      <mesh position={[-1.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.34, 0.5, 28]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      {/* cargo band */}
      <mesh position={[0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.465, 0.465, 0.06, 32]} />
        <meshStandardMaterial color="#0a1020" emissive="#6fe3ff" emissiveIntensity={0.9} />
      </mesh>
      {/* solar wings */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[-1.1, 0, s * 0.95]} rotation={[0.25 * s, 0, 0]}>
          <boxGeometry args={[0.55, 0.015, 1.25]} />
          <meshStandardMaterial {...PANEL} />
        </mesh>
      ))}
      {/* RCS pods */}
      {[0.5, -0.5].map((y) => (
        <mesh key={y} position={[0.9, y * 0.42, 0]}>
          <boxGeometry args={[0.1, 0.06, 0.1]} />
          <meshStandardMaterial {...METAL} />
        </mesh>
      ))}
      <EngineGlow position={[-1.5, 0, 0]} color="#6fe3ff" scale={0.7} />
    </group>
  )
}

/* ── AC-2 AURORA · crew capsule ─────────────────────────────────────── */
export function AuroraCapsule() {
  return (
    <group rotation={[0, 0, -0.5]} scale={1.15}>
      {/* capsule cone */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.34, 0.78, 0.85, 36]} />
        <meshStandardMaterial color="#e8ebf2" metalness={0.5} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <sphereGeometry args={[0.345, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#dfe3ec" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* heat shield */}
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.79, 0.72, 0.12, 36]} />
        <meshStandardMaterial color="#54382a" metalness={0.2} roughness={0.85} />
      </mesh>
      {/* windows */}
      {[-0.35, 0, 0.35].map((a) => (
        <mesh key={a} position={[Math.sin(a) * 0.52, 0.42, Math.cos(a) * 0.52]} rotation={[0, a, 0]}>
          <boxGeometry args={[0.09, 0.07, 0.02]} />
          <meshStandardMaterial color="#0a1422" emissive="#6fe3ff" emissiveIntensity={1.6} />
        </mesh>
      ))}
      {/* trunk */}
      <mesh position={[0, -0.75, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 1.0, 36, 1, true]} />
        <meshStandardMaterial {...DARK} side={THREE.DoubleSide} />
      </mesh>
      {/* trunk solar skin */}
      <mesh position={[0, -0.75, 0]}>
        <cylinderGeometry args={[0.725, 0.725, 0.8, 36, 1, true]} />
        <meshStandardMaterial {...PANEL} side={THREE.DoubleSide} />
      </mesh>
      {/* abort thrusters */}
      {[0, 1.57, 3.14, 4.71].map((a) => (
        <mesh key={a} position={[Math.sin(a) * 0.66, 0.05, Math.cos(a) * 0.66]} rotation={[0, a, 0.5]}>
          <coneGeometry args={[0.06, 0.16, 12]} />
          <meshStandardMaterial {...METAL} />
        </mesh>
      ))}
    </group>
  )
}

/* ── SL-4 SELENE · lunar lander ─────────────────────────────────────── */
export function SeleneLander() {
  return (
    <group position={[0, -0.3, 0]} scale={1.05}>
      {/* descent stage — gold-wrapped octagon */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.62, 0.66, 0.5, 8]} />
        <meshStandardMaterial color="#b9913f" metalness={0.9} roughness={0.38} />
      </mesh>
      {/* ascent module */}
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.34, 0.42, 0.5, 8]} />
        <meshStandardMaterial {...HULL} />
      </mesh>
      <mesh position={[0, 0.98, 0]}>
        <sphereGeometry args={[0.26, 20, 14]} />
        <meshStandardMaterial color="#cfd5e0" metalness={0.4} roughness={0.45} />
      </mesh>
      {/* hatch + window */}
      <mesh position={[0, 0.62, 0.41]}>
        <boxGeometry args={[0.18, 0.22, 0.03]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      <mesh position={[0.12, 1.0, 0.21]}>
        <boxGeometry args={[0.08, 0.06, 0.03]} />
        <meshStandardMaterial color="#0a1422" emissive="#ffd9a0" emissiveIntensity={1.7} />
      </mesh>
      {/* legs */}
      {[0.785, 2.36, 3.93, 5.5].map((a) => (
        <group key={a} rotation={[0, a, 0]}>
          <mesh position={[0.72, -0.18, 0]} rotation={[0, 0, 0.65]}>
            <cylinderGeometry args={[0.025, 0.035, 0.85, 10]} />
            <meshStandardMaterial {...METAL} />
          </mesh>
          <mesh position={[0.98, -0.48, 0]}>
            <cylinderGeometry args={[0.13, 0.15, 0.04, 16]} />
            <meshStandardMaterial {...DARK} />
          </mesh>
        </group>
      ))}
      {/* engines */}
      {[0.4, -0.4].map((x) => (
        <mesh key={x} position={[x, -0.22, 0]}>
          <coneGeometry args={[0.1, 0.22, 16, 1, true]} />
          <meshStandardMaterial {...METAL} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <EngineGlow position={[0, -0.42, 0]} color="#ffd9a0" scale={0.55} />
    </group>
  )
}

/* ── MT-1 ARES CLIPPER · Mars transport ─────────────────────────────── */
export function AresClipper() {
  const ring = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    ring.current.rotation.x += delta * 0.3
  })

  return (
    <group rotation={[0.1, 0, 0]} scale={0.92}>
      {/* spine */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 3.4, 12]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      {/* gravity ring — spins for partial g */}
      <mesh ref={ring} position={[0.85, 0, 0]}>
        <torusGeometry args={[0.85, 0.11, 14, 48]} />
        <meshStandardMaterial {...HULL} />
      </mesh>
      <mesh position={[0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.5, 20]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      {/* command module */}
      <mesh position={[1.78, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.24, 0.5, 20]} />
        <meshStandardMaterial {...HULL} />
      </mesh>
      {/* tank cluster */}
      {[0, 2.094, 4.189].map((a) => (
        <mesh
          key={a}
          position={[-0.85, Math.sin(a) * 0.26, Math.cos(a) * 0.26]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <capsuleGeometry args={[0.17, 0.9, 6, 16]} />
          <meshStandardMaterial color="#c9cfdc" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
      {/* radiators */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[-0.1, s * 0.55, 0]}>
          <boxGeometry args={[1.3, 0.015, 0.4]} />
          <meshStandardMaterial color="#2b313d" metalness={0.6} roughness={0.5} emissive="#b8451f" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* engines */}
      {[0.13, -0.13].map((y) => (
        <mesh key={y} position={[-1.66, y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.12, 0.3, 16, 1, true]} />
          <meshStandardMaterial {...DARK} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <EngineGlow position={[-1.88, 0, 0]} color="#ff9a4d" scale={0.8} />
    </group>
  )
}

/* ── DSE-X ODYSSEY · deep space explorer ────────────────────────────── */
export function OdysseyExplorer() {
  return (
    <group rotation={[0.12, 0.2, -0.08]} scale={0.95}>
      {/* hexagonal hull */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.26, 0.32, 2.6, 6]} />
        <meshStandardMaterial color="#aeb6c4" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* sensor dish */}
      <mesh position={[1.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.42, 0.35, 24, 1, true]} />
        <meshStandardMaterial {...METAL} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[1.42, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      {/* radiator cross */}
      {[0, Math.PI / 2].map((a) => (
        <mesh key={a} position={[-0.35, 0, 0]} rotation={[a, 0, 0]}>
          <boxGeometry args={[1.0, 0.015, 1.5]} />
          <meshStandardMaterial color="#262c38" metalness={0.6} roughness={0.5} emissive="#b8451f" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {/* fusion torus */}
      <mesh position={[-1.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.3, 0.09, 14, 32]} />
        <meshStandardMaterial color="#3a414e" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[-1.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.3, 0.03, 10, 32]} />
        <meshStandardMaterial color="#0d2b2e" emissive="#43e8d8" emissiveIntensity={2.4} />
      </mesh>
      {/* magnetic nozzle */}
      <mesh position={[-1.62, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.26, 0.4, 20, 1, true]} />
        <meshStandardMaterial {...METAL} side={THREE.DoubleSide} />
      </mesh>
      <EngineGlow position={[-1.9, 0, 0]} color="#43e8d8" />
      {/* instrument booms */}
      {[0.5, -0.5].map((z) => (
        <group key={z}>
          <mesh position={[0.7, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, Math.abs(z) * 2, 6]} />
            <meshStandardMaterial {...METAL} />
          </mesh>
          <mesh position={[0.7, 0, z * 2]}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial color="#1c2a4a" emissive="#9d7bff" emissiveIntensity={1.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export const CRAFT_COMPONENTS: Record<string, () => React.JSX.Element> = {
  atlas: AtlasCargo,
  aurora: AuroraCapsule,
  selene: SeleneLander,
  ares: AresClipper,
  odyssey: OdysseyExplorer,
}
