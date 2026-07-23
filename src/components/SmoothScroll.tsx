"use client";

import { useEffect } from "react";
import Lenis from "lenis";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Lenis smooth scrolling, driven by GSAP's ticker.
 *
 * Sharing one clock is what keeps scroll-scrubbed animation in lockstep with
 * the scroll position: Lenis advances inside the same frame GSAP renders, and
 * `ScrollTrigger.update` runs on every Lenis scroll event rather than on the
 * browser's native (and now lagging) scroll event.
 *
 * Renders nothing — it only installs the behaviour.
 */
export function SmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      // Gentle exponential ease-out: fast to respond, slow to settle.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    const update = () => ScrollTrigger.update();
    lenis.on("scroll", update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    // Lenis integrates its own delta, so GSAP's lag smoothing would fight it.
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", update);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return null;
}

export default SmoothScroll;
