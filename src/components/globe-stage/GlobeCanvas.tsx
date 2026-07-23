"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { Globe } from "@/components/three/Globe";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { GlobeStageProvider } from "./globe-stage-context";

const CAMERA_FOV = 32;
const CAMERA_Z = 6;

/** Extra scale at the midpoint of the journey, so the globe swells as it travels. */
const TRAVEL_BULGE = 0.14;

type Placement = { x: number; y: number; scale: number };

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

type RigProps = {
  from: string;
  to?: string;
  progress: RefObject<number>;
  entrance: RefObject<number>;
  /** Reports the globe's screen footprint each frame, in CSS pixels. */
  onPlace: (centreX: number, centreY: number, diameter: number) => void;
  children?: ReactNode;
};

/**
 * Places the globe over whichever anchor the page is currently showing.
 *
 * Anchors are measured every frame rather than cached, so the globe rides along
 * with normal document scrolling — including Lenis's smoothed offsets — and
 * survives resizes, font loading and reflow without any invalidation logic.
 */
function GlobeRig({ from, to, progress, entrance, onPlace, children }: RigProps) {
  const group = useRef<THREE.Group>(null);
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);

  const fromEl = useRef<HTMLElement | null>(null);
  const toEl = useRef<HTMLElement | null>(null);

  const a = useRef<Placement>({ x: 0, y: 0, scale: 1 });
  const b = useRef<Placement>({ x: 0, y: 0, scale: 1 });

  // React context does not cross the react-three-fiber reconciler boundary, so
  // decorations get their handle on the stage from inside the canvas tree.
  const stage = useMemo(() => ({ progress }), [progress]);

  useEffect(() => {
    fromEl.current = document.querySelector<HTMLElement>(
      `[data-globe-anchor="${from}"]`,
    );
    toEl.current = to
      ? document.querySelector<HTMLElement>(`[data-globe-anchor="${to}"]`)
      : null;
  }, [from, to]);

  useFrame(() => {
    const target = group.current;
    if (!target) return;

    const perspective = camera as THREE.PerspectiveCamera;
    const visibleHeight =
      2 * Math.tan(THREE.MathUtils.degToRad(perspective.fov) / 2) * CAMERA_Z;
    const pxPerUnit = size.height / visibleHeight;

    // Read both anchors before writing anything, so one layout pass serves the
    // whole frame.
    const measure = (element: HTMLElement | null, into: Placement) => {
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      if (rect.width === 0) return false;
      into.x = (rect.left + rect.width / 2 - size.width / 2) / pxPerUnit;
      into.y = -(rect.top + rect.height / 2 - size.height / 2) / pxPerUnit;
      into.scale = rect.width / 2 / pxPerUnit;
      return true;
    };

    const hasFrom = measure(fromEl.current, a.current);
    const hasTo = measure(toEl.current, b.current);
    if (!hasFrom) return;

    const p = hasTo ? progress.current : 0;
    const eased = smoothstep(p);
    // Swells on the way out, settles smaller on arrival.
    const bulge = 1 + TRAVEL_BULGE * Math.sin(Math.PI * p);

    const x = a.current.x + (b.current.x - a.current.x) * eased;
    const y = a.current.y + (b.current.y - a.current.y) * eased;
    const scale =
      (a.current.scale + (b.current.scale - a.current.scale) * eased) *
      bulge *
      entrance.current;

    target.position.set(x, y, 0);
    target.scale.setScalar(scale);

    // Hand the footprint back so DOM-side dressing can follow along.
    onPlace(
      size.width / 2 + x * pxPerUnit,
      size.height / 2 - y * pxPerUnit,
      scale * 2 * pxPerUnit,
    );
  });

  return (
    <group ref={group}>
      {/*
        The reusable globe. Nothing here reaches inside it — the journey is
        driven entirely by the group above, which is exactly the seam `<Globe />`
        exposes through its `ref`.
      */}
      <Globe />
      <GlobeStageProvider value={stage}>{children}</GlobeStageProvider>
    </group>
  );
}

export type GlobeCanvasProps = {
  /** Anchor id the globe rests on before any scrolling. */
  from: string;
  /** Anchor id it travels to. Omit for a single-anchor page. */
  to?: string;
  /** Section the travel is scrubbed against, as a CSS selector. */
  trigger?: string;
  /** Decorations that ride along inside the globe's group. */
  children?: ReactNode;
};

export function GlobeCanvas({ from, to, trigger, children }: GlobeCanvasProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const entrance = useRef(1);
  const reducedMotion = useReducedMotion();

  // Keeps the contact shadow welded to the globe. Only a transform is written,
  // so this never invalidates the layout the rig just read.
  const place = useCallback(
    (centreX: number, centreY: number, diameter: number) => {
      const element = shadow.current;
      if (!element) return;
      element.style.transform = `translate3d(${centreX - diameter / 2}px, ${
        centreY - diameter / 2
      }px, 0) scale(${diameter / 100})`;
    },
    [],
  );

  useIsomorphicLayoutEffect(() => {
    // Scale lives on the 3D group rather than the canvas element, so the
    // entrance grows about the globe rather than the viewport.
    entrance.current = reducedMotion ? 1 : 0.88;

    const context = gsap.context(() => {
      if (!reducedMotion) {
        gsap.to(entrance, {
          current: 1,
          duration: 1.5,
          ease: "power2.out",
          delay: 0.1,
        });
        gsap.from(wrapper.current, {
          autoAlpha: 0,
          duration: 1.2,
          ease: "power2.out",
        });
      }

      if (!to || !trigger) return;

      ScrollTrigger.create({
        trigger,
        start: "top bottom",
        end: "top 22%",
        // A little scrub lag reads as weight; Lenis handles the rest.
        scrub: reducedMotion ? true : 0.8,
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });
    });

    return () => context.revert();
  }, [to, trigger, reducedMotion]);

  return (
    <div ref={wrapper} className="pointer-events-none fixed inset-0 z-0">
      {/*
        Soft contact shadow, positioned by the rig. Sized at 100px and scaled,
        so per-frame updates never touch layout.
      */}
      <div
        ref={shadow}
        aria-hidden="true"
        className="absolute top-0 left-0 size-[100px] origin-top-left rounded-full blur-[26px]"
        style={{
          background:
            "radial-gradient(circle, rgba(23,32,74,0.14) 52%, rgba(23,32,74,0) 74%)",
        }}
      />

      <Canvas
        flat
        dpr={[1, 2]}
        camera={{
          fov: CAMERA_FOV,
          position: [0, 0, CAMERA_Z],
          near: 0.1,
          far: 50,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ pointerEvents: "none" }}
      >
        {/*
          Near-flat lighting: just enough falloff to read as a sphere on white.
          Intensities look high because three's Lambert BRDF divides irradiance
          by PI, so ~3.0 of ambient is what lands on "white".
        */}
        <ambientLight intensity={2.83} />
        <directionalLight position={[-2, 3, 4]} intensity={0.32} />
        <directionalLight position={[3, -2, 1]} intensity={0.1} />

        <GlobeRig
          from={from}
          to={to}
          progress={progress}
          entrance={entrance}
          onPlace={place}
        >
          {children}
        </GlobeRig>
      </Canvas>
    </div>
  );
}

export default GlobeCanvas;
