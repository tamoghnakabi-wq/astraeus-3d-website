import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SUN_POS } from '@/data/journey'
import { getFlareTexture } from '@/lib/textures'

/**
 * The distant sun — a billboarded flare sprite with an anamorphic streak.
 * Cheap, but with bloom it reads as a proper lens flare when it enters frame.
 */
export function SunFlare() {
  const sprite = useRef<THREE.Sprite>(null!)

  useFrame((state) => {
    // gentle pulsing; bloom turns this into a breathing halo
    const s = 26 + Math.sin(state.clock.elapsedTime * 0.7) * 0.8
    sprite.current.scale.set(s, s, 1)
  })

  return (
    <group position={SUN_POS}>
      <sprite ref={sprite}>
        <spriteMaterial
          map={getFlareTexture()}
          color="#fff3dd"
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  )
}
