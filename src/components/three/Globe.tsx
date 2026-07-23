"use client";

import { useEffect, useMemo, useRef, type Ref } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { buildLandDots } from "@/lib/world-map";
import { useWindowPointer } from "@/lib/use-pointer";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Dots are drawn with `depthTest: false` and shaded by their facing direction
 * instead of being occluded by the sphere. That keeps the far hemisphere
 * faintly visible through the shell — the translucent, "scanned" look of the
 * reference — in a single draw call.
 */
const DOT_VERTEX = /* glsl */ `
  uniform float uSize;
  uniform float uViewportHeight;
  varying float vFacing;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vec3 viewNormal = normalize(normalMatrix * normalize(position));
    vFacing = dot(viewNormal, normalize(-mvPosition.xyz));

    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = max(
      1.0,
      uSize * projectionMatrix[1][1] / -mvPosition.z * uViewportHeight * 0.5
    );
  }
`;

const DOT_FRAGMENT = /* glsl */ `
  uniform vec3 uFrontColor;
  uniform vec3 uBackColor;
  uniform float uBackOpacity;
  varying float vFacing;

  void main() {
    float dist = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.36, dist);
    if (alpha <= 0.001) discard;

    // Soften the hand-off across the limb so dots do not pop as they wrap.
    float front = smoothstep(-0.06, 0.06, vFacing);
    vec3 color = mix(uBackColor, uFrontColor, front);

    // Near the limb the far hemisphere compresses into a dense, dark band.
    // Fading the ghosts out as they approach the silhouette keeps that edge
    // clean while still showing the landmasses deeper on the back side.
    float backFade = smoothstep(-0.03, -0.30, vFacing);
    float opacity = mix(uBackOpacity * backFade, 1.0, front);

    gl_FragColor = vec4(color, alpha * opacity);
  }
`;

export type GlobeProps = {
  /** Sphere radius in world units. */
  radius?: number;
  /** Angular spacing between land dots, in degrees. Lower is denser. */
  dotStep?: number;
  /** Dot diameter in world units. */
  dotSize?: number;
  /** Colour of dots on the hemisphere facing the camera. */
  dotColor?: string;
  /** Colour of dots showing through from the far hemisphere. */
  dotBackColor?: string;
  dotBackOpacity?: number;
  /** Colour of the shell the dots sit on. */
  shellColor?: string;
  /** Faint meridian arcs that read as sphere volume. */
  meridians?: number;
  meridianColor?: string;
  /** Longitude, in degrees, facing the camera on the first frame. */
  initialLongitude?: number;
  /** Axial tilt on screen, radians. */
  tilt?: number;
  /** Idle spin, in radians per second. */
  autoRotateSpeed?: number;
  /** How far the cursor can push the globe, in radians. `0` disables it. */
  pointerStrength?: number;
  /** Damping rate for the cursor follow. Higher is snappier. */
  pointerDamping?: number;
  /** Vertical drift amplitude in world units. */
  floatAmplitude?: number;
  /**
   * Ref to the outermost group. Nothing inside the component writes to this
   * group's transform, so a parent section can hand it to GSAP (to move, scale
   * or re-home the globe on scroll) without touching this file.
   */
  ref?: Ref<THREE.Group>;
};

/**
 * The reusable dotted globe: a shell, its land dots, and the idle + cursor
 * motion that keeps it alive. Section-specific dressing (orbit rings, nodes,
 * labels) is deliberately *not* part of this component — compose it alongside.
 *
 * Transforms are split across three nested groups so they never fight:
 *
 *   outer  — owned by the parent, untouched here (GSAP-safe)
 *   float  — idle drift
 *   spin   — auto-rotation blended with the cursor offset
 */
export function Globe({
  radius = 1,
  dotStep = 1.5,
  dotSize = 0.016,
  dotColor = "#1b44e0",
  dotBackColor = "#a3adc7",
  dotBackOpacity = 0.15,
  shellColor = "#ffffff",
  meridians = 8,
  meridianColor = "#d5dae8",
  initialLongitude = 20,
  tilt = -0.22,
  autoRotateSpeed = 0.08,
  pointerStrength = 0.32,
  pointerDamping = 1.8,
  floatAmplitude = 0.03,
  ref,
}: GlobeProps) {
  const floatGroup = useRef<THREE.Group>(null);
  const spinGroup = useRef<THREE.Group>(null);
  const dotMaterial = useRef<THREE.ShaderMaterial>(null);

  const reducedMotion = useReducedMotion();
  const pointer = useWindowPointer(pointerStrength > 0 && !reducedMotion);

  // Idle rotation is accumulated separately from the cursor offset so the two
  // can be blended without the pointer damping eating the auto-rotation.
  // `buildLandDots` puts longitude L at angle (L + 180)°, and the point facing
  // the camera sits at 90°, hence the offset below.
  const spin = useRef(Math.PI / 2 - ((initialLongitude + 180) * Math.PI) / 180);
  const offset = useRef({ x: 0, y: 0 });

  const dotGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = buildLandDots(radius, dotStep);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.computeBoundingSphere();
    return geometry;
  }, [radius, dotStep]);

  const dotUniforms = useMemo(
    () => ({
      uSize: { value: dotSize },
      uViewportHeight: { value: 1000 },
      uFrontColor: { value: new THREE.Color(dotColor) },
      uBackColor: { value: new THREE.Color(dotBackColor) },
      uBackOpacity: { value: dotBackOpacity },
    }),
    [dotSize, dotColor, dotBackColor, dotBackOpacity],
  );

  const meridianGeometry = useMemo(() => {
    const segments = 96;
    const points: number[] = [];

    for (let i = 0; i < meridians; i++) {
      // Each full circle contributes two visible arcs, 180° apart.
      const angle = (i / meridians) * Math.PI;
      const ax = Math.cos(angle);
      const az = Math.sin(angle);
      let previous: [number, number, number] | null = null;

      for (let s = 0; s <= segments; s++) {
        const t = (s / segments) * Math.PI * 2;
        const current: [number, number, number] = [
          Math.cos(t) * ax * radius,
          Math.sin(t) * radius,
          Math.cos(t) * az * radius,
        ];
        if (previous) points.push(...previous, ...current);
        previous = current;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(points), 3),
    );
    return geometry;
  }, [meridians, radius]);

  // The geometries are created here rather than by the renderer, so release
  // them here too when the props that built them change or the globe unmounts.
  useEffect(() => () => dotGeometry.dispose(), [dotGeometry]);
  useEffect(() => () => meridianGeometry.dispose(), [meridianGeometry]);

  useFrame((state, delta) => {
    // Guard against tab-switch stalls producing a single huge step.
    const dt = Math.min(delta, 0.05);

    if (spinGroup.current) {
      if (!reducedMotion) spin.current += autoRotateSpeed * dt;

      const targetY = pointer.current.x * pointerStrength;
      const targetX = pointer.current.y * pointerStrength * 0.6;
      offset.current.x = THREE.MathUtils.damp(
        offset.current.x,
        targetX,
        pointerDamping,
        dt,
      );
      offset.current.y = THREE.MathUtils.damp(
        offset.current.y,
        targetY,
        pointerDamping,
        dt,
      );

      spinGroup.current.rotation.y = spin.current + offset.current.y;
      spinGroup.current.rotation.x = offset.current.x;
    }

    if (floatGroup.current && !reducedMotion) {
      const t = state.clock.elapsedTime;
      floatGroup.current.position.y = Math.sin(t * 0.5) * floatAmplitude;
      floatGroup.current.rotation.z = Math.sin(t * 0.34) * 0.012;
    }

    // Dot size is specified in world units, so the shader needs the current
    // drawing-buffer height to convert it. Reading it every frame keeps
    // resizes and DPR changes correct without an extra effect.
    if (dotMaterial.current) {
      dotMaterial.current.uniforms.uViewportHeight.value =
        state.size.height * state.viewport.dpr;
    }
  });

  return (
    <group ref={ref}>
      <group ref={floatGroup}>
        {/* Axial tilt. Only `x`/`y` are driven per frame, so `z` stays put. */}
        <group ref={spinGroup} rotation={[0, 0, tilt]}>
          <mesh>
            <sphereGeometry args={[radius * 0.995, 64, 64]} />
            <meshStandardMaterial
              color={shellColor}
              roughness={1}
              metalness={0}
            />
          </mesh>

          <lineSegments geometry={meridianGeometry}>
            <lineBasicMaterial
              color={meridianColor}
              transparent
              opacity={0.55}
            />
          </lineSegments>

          <points geometry={dotGeometry} renderOrder={2}>
            <shaderMaterial
              ref={dotMaterial}
              vertexShader={DOT_VERTEX}
              fragmentShader={DOT_FRAGMENT}
              uniforms={dotUniforms}
              transparent
              depthTest={false}
              depthWrite={false}
            />
          </points>
        </group>
      </group>
    </group>
  );
}

export default Globe;
