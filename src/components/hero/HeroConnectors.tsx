"use client";

import { HERO_LABELS, labelPath } from "./hero-labels";

/**
 * Hairline connectors running from each callout to a glowing marker at the edge
 * of the globe. Drawn in the same 1000×1000 space as the labels and pinned to
 * the globe stage, so the whole diagram scales as one.
 *
 * `pathLength={1}` normalises every path, which lets a single dash-offset tween
 * draw them all in regardless of their real length.
 */
export function HeroConnectors() {
  return (
    <svg
      viewBox="0 0 1000 1000"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      aria-hidden="true"
      fill="none"
    >
      {HERO_LABELS.map((label) => (
        <g key={label.id}>
          <path
            className="hero-connector"
            d={labelPath(label)}
            pathLength={1}
            stroke="#aeb6cc"
            strokeWidth={1}
            strokeDasharray={1}
            strokeDashoffset={0}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          <circle
            className="hero-dot"
            cx={label.anchor.x}
            cy={label.anchor.y}
            r={4}
            fill="#1b44e0"
          />

          {label.via ? (
            <circle
              className="hero-dot"
              cx={label.via.x}
              cy={label.via.y}
              r={3.4}
              fill="#1b44e0"
            />
          ) : null}

          <circle
            className="hero-dot"
            cx={label.end.x}
            cy={label.end.y}
            r={12}
            fill="#1b44e0"
            opacity={0.1}
          />
          <circle
            className="hero-dot"
            cx={label.end.x}
            cy={label.end.y}
            r={4.6}
            fill="#1b44e0"
          />
        </g>
      ))}
    </svg>
  );
}
