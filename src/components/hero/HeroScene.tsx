"use client";

import { Canvas } from "@react-three/fiber";

import { Globe } from "@/components/three/Globe";
import { OrbitRings } from "./OrbitRings";

/**
 * WebGL layer of the hero: the reusable globe plus this section's orbit rings.
 *
 * The camera is framed so a globe of radius 1 fills 61% of the square stage,
 * which is what puts the callout coordinates in `hero-labels.ts` on the right
 * part of the sphere. Changing `fov` or the camera distance will shift that
 * relationship, so keep the two in step.
 */
export function HeroScene() {
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      camera={{ fov: 32, position: [0, 0, 5.7], near: 0.1, far: 20 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      // Pointer tracking is done at the window level, so the canvas itself
      // never needs to intercept events.
      style={{ pointerEvents: "none" }}
    >
      {/*
        Near-flat lighting: just enough falloff to read as a sphere on white.
        Intensities look high because three's Lambert BRDF divides irradiance by
        PI, so ~3.0 of ambient is what lands on "white".
      */}
      <ambientLight intensity={2.83} />
      <directionalLight position={[-2, 3, 4]} intensity={0.32} />
      <directionalLight position={[3, -2, 1]} intensity={0.1} />

      <Globe />
      <OrbitRings />
    </Canvas>
  );
}

export default HeroScene;
