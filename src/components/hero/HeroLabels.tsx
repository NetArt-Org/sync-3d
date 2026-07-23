"use client";

import { HERO_LABELS, LABEL_GAP } from "./hero-labels";

/**
 * The floating channel callouts. Kept as DOM text rather than SVG `<text>` so
 * they stay selectable, inherit the page font, and are readable by assistive
 * tech — while their positions still come from the shared 1000×1000 overlay
 * space, so they track the connectors exactly.
 *
 * Sizing uses container query units against the globe stage: the callouts grow
 * and shrink with the diagram instead of stepping at breakpoints.
 *
 * Each callout is two elements — an outer node that owns the placement
 * transform and an inner `.hero-label` that the entrance timeline animates — so
 * GSAP never has to overwrite the positioning transform.
 */
export function HeroLabels() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {HERO_LABELS.map((label) => {
        const isLeft = label.side === "left";
        const x = isLeft
          ? label.anchor.x - LABEL_GAP
          : label.anchor.x + LABEL_GAP;

        return (
          <div
            key={label.id}
            className="absolute"
            style={{
              left: `${x / 10}%`,
              top: `${label.anchor.y / 10}%`,
              transform: `translate(${isLeft ? "-100%" : "0"}, -50%)`,
            }}
          >
            <div
              className="hero-label text-[clamp(10px,1.62cqw,15px)] leading-none font-medium whitespace-nowrap text-zinc-700"
              data-side={label.side}
            >
              {label.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
