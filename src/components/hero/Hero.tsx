"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ArrowUpRight, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { HeroConnectors } from "./HeroConnectors";
import { HeroLabels } from "./HeroLabels";

// WebGL has nothing useful to contribute to the server render, and skipping it
// keeps three.js out of the initial payload. The copy still renders on the
// server, so the hero is meaningful before the scene arrives.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (reducedMotion) return;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.9 },
      });

      timeline
        .from(".hero-eyebrow", { y: 16, autoAlpha: 0, duration: 0.6 })
        .from(
          ".hero-line",
          { y: 38, autoAlpha: 0, stagger: 0.09, duration: 0.95 },
          "-=0.35",
        )
        .from(".hero-lede", { y: 20, autoAlpha: 0, duration: 0.8 }, "-=0.6")
        .from(
          ".hero-cta",
          { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 },
          "-=0.55",
        )
        // The scene runs alongside the copy rather than after it, so the hero
        // reads as one entrance instead of two.
        .from(
          ".hero-connector",
          { strokeDashoffset: 1, duration: 0.9, stagger: 0.07, ease: "power2.inOut" },
          0.85,
        )
        .from(
          ".hero-dot",
          { scale: 0, autoAlpha: 0, transformOrigin: "center", stagger: 0.05, duration: 0.45 },
          1.1,
        )
        .from(
          ".hero-label",
          {
            autoAlpha: 0,
            x: (_index: number, target: Element) =>
              target.getAttribute("data-side") === "left" ? -14 : 14,
            stagger: 0.07,
            duration: 0.6,
          },
          1.15,
        );
    }, root);

    return () => context.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={root}
      className="relative w-full overflow-hidden bg-white"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto grid w-full max-w-[1512px] grid-cols-1 items-center gap-y-4 px-6 pt-16 pb-20 sm:px-10 lg:min-h-[min(100svh,900px)] lg:grid-cols-[minmax(0,34fr)_minmax(0,66fr)] lg:gap-6 lg:py-0 lg:pr-[3vw] lg:pl-[5.4vw]">
        <div className="relative z-10 max-w-[440px]">
          <div className="hero-eyebrow flex items-center gap-3.5 text-[11px] font-semibold tracking-[0.16em] text-brand uppercase">
            <span className="h-px w-8 bg-brand" aria-hidden="true" />
            <span>Cross-Media Measurement</span>
          </div>

          <h1
            id="hero-heading"
            className="display mt-8 font-bold text-[#0a0a0a]"
          >
            <span className="hero-line block">One view.</span>
            <span className="hero-line block">Every media.</span>
            <span className="hero-line block text-brand">Real impact.</span>
          </h1>

          <p className="hero-lede lede mt-7 max-w-[322px] text-zinc-600">
            SYNC unifies TV, OTT, YouTube, Meta and digital data to measure what
            matters and drive real business outcomes.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-9 gap-y-5">
            <button className="flex items-center hero-cta h-[50px] gap-2.5 rounded-lg bg-brand px-6 text-[15px] font-semibold text-white hover:bg-brand-strong focus-visible:ring-brand/40 [&_svg:not([class*='size-'])]:size-[18px]">
              Request Demo
              <ArrowUpRight strokeWidth={2.25} />
            </button>

            <button
              type="button"
              className="hero-cta group inline-flex items-center gap-3.5 rounded-full text-[15px] font-medium text-[#0a0a0a] outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              <span className="flex size-10 items-center justify-center rounded-full border border-zinc-300 transition-colors group-hover:border-brand">
                <Play className="size-3.5 fill-brand text-brand" />
              </span>
              Watch Overview
            </button>
          </div>
        </div>

        <div className="@container relative mx-auto aspect-square w-full max-w-[520px] md:max-w-[600px] lg:max-w-none">
          {/* Soft contact shadow. Offset so a crescent stays visible past the
              opaque shell rather than being hidden behind it. */}
          <div
            aria-hidden="true"
            className="hero-canvas absolute top-[24%] left-[21%] size-[62%] rounded-full blur-[26px]"
            style={{
              background:
                "radial-gradient(circle, rgba(23,32,74,0.14) 52%, rgba(23,32,74,0) 74%)",
            }}
          />

          <div className="hero-canvas absolute inset-0">
            <HeroScene />
          </div>

          <HeroConnectors />
          <HeroLabels />
        </div>
      </div>
    </section>
  );
}

export default Hero;
