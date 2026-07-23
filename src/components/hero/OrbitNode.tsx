"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { getGlowTexture } from "./glow-texture";

export type OrbitNodeProps = {
  /** Position on the parent ring, in radians. */
  angle: number;
  /** Ring radius, in world units. */
  radius: number;
  /** Core dot radius, in world units. */
  size?: number;
  color?: string;
  /** Seconds per pulse cycle. `0` holds the node steady. */
  pulse?: number;
  /** Offsets the pulse so nodes do not breathe in unison. */
  phase?: number;
};

/**
 * A single glowing marker sitting on an orbit ring. It has no motion of its
 * own — travel along the path comes from the parent ring group's rotation, so
 * the node stays welded to the orbit no matter how the ring is animated.
 */
export function OrbitNode({
  angle,
  radius,
  size = 0.017,
  color = "#1b44e0",
  pulse = 2.6,
  phase = 0,
}: OrbitNodeProps) {
  const glow = useRef<THREE.Sprite>(null);
  const texture = useMemo(() => getGlowTexture(), []);

  const position = useMemo<[number, number, number]>(
    () => [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
    [angle, radius],
  );

  useFrame((state) => {
    if (!glow.current || pulse <= 0) return;
    const t = state.clock.elapsedTime / pulse + phase;
    const scale = size * 6 * (1 + Math.sin(t * Math.PI * 2) * 0.16);
    glow.current.scale.setScalar(scale);
  });

  return (
    <group position={position}>
      <sprite ref={glow} scale={size * 6}>
        <spriteMaterial
          map={texture}
          transparent
          depthWrite={false}
          opacity={0.9}
        />
      </sprite>
      <mesh>
        <sphereGeometry args={[size, 12, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}
