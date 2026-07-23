"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";

import { useGlobeStage } from "@/components/globe-stage/globe-stage-context";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { OrbitNode } from "./OrbitNode";

type Orbit = {
  /** Ring radius in world units, relative to a globe of radius 1. */
  radius: number;
  /** Tilt toward the camera, radians. `PI/2` is face-on. */
  tiltX: number;
  /** Roll of the ellipse on screen, radians. */
  tiltZ: number;
  /** Seconds for one full revolution. */
  duration: number;
  direction: 1 | -1;
  /** Angles, in turns, at which nodes ride this ring. */
  nodes: number[];
};

const ORBITS: readonly Orbit[] = [
  {
    radius: 1.04,
    tiltX: 1.34,
    tiltZ: 0.42,
    duration: 46,
    direction: 1,
    nodes: [0.08, 0.62],
  },
  {
    radius: 1.11,
    tiltX: 1.16,
    tiltZ: -0.5,
    duration: 68,
    direction: -1,
    nodes: [0.2, 0.55, 0.86],
  },
  {
    radius: 1.18,
    tiltX: 1.42,
    tiltZ: 0.93,
    duration: 88,
    direction: 1,
    nodes: [0.34, 0.78],
  },
];

const SEGMENTS = 160;

function useRingGeometry(radius: number) {
  const geometry = useMemo(() => {
    const points: number[] = [];
    for (let i = 0; i < SEGMENTS; i++) {
      const t = (i / SEGMENTS) * Math.PI * 2;
      // Built in the XZ plane so the ring spins about its own axis on `rotation.y`.
      points.push(Math.cos(t) * radius, 0, Math.sin(t) * radius);
    }
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(points), 3),
    );
    return buffer;
  }, [radius]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return geometry;
}

function OrbitRing({ orbit, color }: { orbit: Orbit; color: string }) {
  const spin = useRef<THREE.Group>(null);
  const geometry = useRingGeometry(orbit.radius);
  const reducedMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (reducedMotion || !spin.current) return;

    const context = gsap.context(() => {
      gsap.to(spin.current!.rotation, {
        y: Math.PI * 2 * orbit.direction,
        duration: orbit.duration,
        ease: "none",
        repeat: -1,
      });
    });

    return () => context.revert();
  }, [orbit.direction, orbit.duration, reducedMotion]);

  return (
    // Tilt is split across nested groups so the continuous spin stays purely
    // in the ring's own plane, independent of Euler order.
    <group rotation-z={orbit.tiltZ}>
      <group rotation-x={orbit.tiltX}>
        <group ref={spin}>
          <lineLoop geometry={geometry}>
            <lineBasicMaterial color={color} transparent opacity={0.95} />
          </lineLoop>

          {orbit.nodes.map((turn) => (
            <OrbitNode
              key={turn}
              angle={turn * Math.PI * 2}
              radius={orbit.radius}
              phase={turn}
            />
          ))}
        </group>
      </group>
    </group>
  );
}

/**
 * Hero-only dressing: thin rings sweeping around the globe, each carrying a few
 * glowing nodes. Rendered as a sibling of `<Globe />` rather than a child, so
 * the reusable globe stays free of section-specific decoration.
 *
 * The rings travel with the globe but belong to the hero, so they fade out as
 * it leaves — later sections bring their own dressing.
 */
export function OrbitRings({ color = "#b7c0d8" }: { color?: string }) {
  const group = useRef<THREE.Group>(null);
  const stage = useGlobeStage();
  const baseOpacity = useRef(new WeakMap<THREE.Material, number>());

  useFrame(() => {
    const root = group.current;
    if (!root || !stage) return;

    const fade = 1 - stage.progress.current;
    root.visible = fade > 0.01;
    if (!root.visible) return;

    root.traverse((object) => {
      const material = (object as THREE.Mesh).material as
        | THREE.Material
        | undefined;
      if (!material || Array.isArray(material)) return;

      // Record each material's authored opacity once, then scale from it —
      // reading the live value would compound the fade every frame.
      let base = baseOpacity.current.get(material);
      if (base === undefined) {
        base = material.opacity;
        baseOpacity.current.set(material, base);
      }

      material.transparent = true;
      material.opacity = base * fade;
    });
  });

  return (
    <group ref={group}>
      {ORBITS.map((orbit) => (
        <OrbitRing key={orbit.radius} orbit={orbit} color={color} />
      ))}
    </group>
  );
}
