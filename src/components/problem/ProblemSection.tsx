"use client";

import { useRef } from "react";
import { ArrowUpRight, Play } from "lucide-react";

import { GlobeAnchor } from "@/components/globe-stage/GlobeAnchor";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { PROBLEM_FEATURES } from "./problem-content";

export function ProblemSection() {
  const root = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (reducedMotion) return;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.9 },
        scrollTrigger: {
          trigger: root.current,
          // Late enough that the globe is already on its way in, so the copy
          // arrives with it rather than ahead of it.
          start: "top 68%",
          once: true,
        },
      });

      timeline
        .from(".problem-eyebrow", { y: 14, autoAlpha: 0, duration: 0.55 })
        .from(
          ".problem-line",
          { y: 32, autoAlpha: 0, stagger: 0.09, duration: 0.9 },
          "-=0.3",
        )
        .from(".problem-lede", { y: 20, autoAlpha: 0, duration: 0.8 }, "-=0.55")
        .from(
          ".problem-feature",
          { y: 18, autoAlpha: 0, stagger: 0.11, duration: 0.7 },
          "-=0.5",
        )
        .from(
          ".problem-highlight",
          { y: 14, autoAlpha: 0, duration: 0.7 },
          "-=0.35",
        )
        .from(
          ".problem-cta",
          { y: 14, autoAlpha: 0, stagger: 0.1, duration: 0.6 },
          "-=0.4",
        );
    }, root);

    return () => context.revert();
  }, [reducedMotion]);

  return (
    <section
      id="problem"
      ref={root}
      // Transparent: the shared globe layer sits behind the sections.
      className="relative z-10 w-full overflow-hidden"
      aria-labelledby="problem-heading"
    >
      <div className="mx-auto grid w-full max-w-[1512px] grid-cols-1 items-center gap-y-6 px-6 pt-12 pb-24 sm:px-10 lg:min-h-[min(100svh,900px)] lg:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] lg:gap-10 lg:py-0 lg:pr-[5.4vw] lg:pl-[3vw]">
        <div className="relative mx-auto aspect-square w-full max-w-[460px] md:max-w-[560px] lg:max-w-[620px]">
          {/* Where the shared globe settles once this section is in view. */}
          <GlobeAnchor id="problem" className="absolute inset-[22%]" />
        </div>

        <div className="relative max-w-[420px]">
          <div className="problem-eyebrow text-[11px] font-semibold tracking-[0.16em] text-brand uppercase">
            The Problem
          </div>

          <h2
            id="problem-heading"
            className="section-title mt-5 font-bold text-[#0a0a0a]"
          >
            <span className="problem-line block">Most media</span>
            <span className="problem-line block">measurement</span>
            <span className="problem-line block">
              still lives <span className="text-brand">in silos.</span>
            </span>
          </h2>

          <p className="problem-lede lede mt-6 max-w-[365px] text-zinc-600">
            Every platform tells a different story. Fragmented data leads to
            duplicate reach, inflated numbers and zero clarity on what actually
            drives impact.
          </p>

          <ul className="mt-9 max-w-[370px]">
            {PROBLEM_FEATURES.map(({ id, icon: Icon, text }, index) => (
              <li key={id} className="problem-feature flex items-center gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                  <Icon className="size-[18px] text-brand" strokeWidth={1.9} />
                </span>
                <span
                  // The rule hangs off the text, not the icon — it stops short
                  // on the last row so the list does not read as closed off.
                  className={`flex min-h-[70px] flex-1 items-center text-[15px] text-[#0a0a0a] ${
                    index < PROBLEM_FEATURES.length - 1
                      ? "border-b border-zinc-200/80"
                      : ""
                  }`}
                >
                  {text}
                </span>
              </li>
            ))}
          </ul>

          <p className="problem-highlight mt-7 text-[18px] font-bold text-brand">
            Nobody measures people.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
            <button
              type="button"
              className="problem-cta flex h-11 items-center gap-2.5 rounded-lg bg-brand px-5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:ring-3 focus-visible:ring-brand/40 focus-visible:outline-none [&_svg:not([class*='size-'])]:size-4"
            >
              Request Demo
              <ArrowUpRight strokeWidth={2.25} />
            </button>

            <button
              type="button"
              className="problem-cta group inline-flex items-center gap-3 rounded-full text-[14px] font-medium text-[#0a0a0a] outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              <span className="flex size-9 items-center justify-center rounded-full border border-zinc-300 transition-colors group-hover:border-brand">
                <Play className="size-3 fill-brand text-brand" />
              </span>
              Watch Overview
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProblemSection;
