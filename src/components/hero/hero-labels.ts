/**
 * Callout geometry for the hero, expressed in a 1000×1000 overlay space that is
 * pinned to the globe stage. The globe renders centred at (500, 500) with a
 * visual radius of ~306, so every coordinate below scales with the stage and
 * the composition holds at any width.
 *
 * Both the SVG connectors and the DOM labels read from this one list, which
 * keeps the text and the line it hangs off from ever drifting apart.
 */

export type HeroLabel = {
  id: string;
  text: string;
  /** Which side of its anchor dot the text sits on. */
  side: "left" | "right";
  /** Small dot the text hangs off. */
  anchor: { x: number; y: number };
  /** Optional dot partway along the run. */
  via?: { x: number; y: number };
  /** Glowing dot where the connector meets the globe. */
  end: { x: number; y: number };
  /** Length of the straight run leaving the anchor, before the curve. */
  lead: number;
};

export const HERO_LABELS: readonly HeroLabel[] = [
  {
    id: "tv",
    text: "TV",
    side: "left",
    anchor: { x: 104, y: 190 },
    end: { x: 264, y: 203 },
    lead: 56,
  },
  {
    id: "ott",
    text: "OTT",
    side: "right",
    anchor: { x: 864, y: 187 },
    end: { x: 684, y: 197 },
    lead: 52,
  },
  {
    id: "digital",
    text: "Digital",
    side: "left",
    anchor: { x: 74, y: 573 },
    via: { x: 132, y: 573 },
    end: { x: 161, y: 567 },
    lead: 30,
  },
  {
    id: "youtube",
    text: "YouTube",
    side: "right",
    anchor: { x: 905, y: 582 },
    end: { x: 837, y: 582 },
    lead: 26,
  },
  {
    id: "meta",
    text: "Meta",
    side: "right",
    anchor: { x: 616, y: 808 },
    end: { x: 425, y: 768 },
    lead: 46,
  },
];

/** Gap between an anchor dot and the first letter of its label. */
export const LABEL_GAP = 17;

/**
 * Connector path: a straight run out of the anchor that eases into a curve.
 * The control point shares the anchor's `y`, so the curve leaves the straight
 * segment tangentially and never kinks.
 */
export function labelPath(label: HeroLabel): string {
  const direction = label.side === "left" ? 1 : -1;
  const turn = { x: label.anchor.x + label.lead * direction, y: label.anchor.y };
  const controlX = turn.x + (label.end.x - turn.x) * 0.55;

  return [
    `M ${label.anchor.x} ${label.anchor.y}`,
    `L ${turn.x} ${turn.y}`,
    `Q ${controlX} ${turn.y} ${label.end.x} ${label.end.y}`,
  ].join(" ");
}
