"use client";

import dynamic from "next/dynamic";

import type { GlobeCanvasProps } from "./GlobeCanvas";

// One WebGL context for the whole page, loaded on the client only. Keeping
// three.js out of the server render also keeps it out of the initial payload —
// the sections' copy is meaningful long before the scene arrives.
const GlobeCanvas = dynamic(() => import("./GlobeCanvas"), { ssr: false });

/**
 * The page-level globe layer.
 *
 * A single `<Globe />` lives here, fixed behind the content, and is placed over
 * whichever `<GlobeAnchor />` the reader is currently looking at. That is what
 * makes the globe read as one continuous object travelling down the page rather
 * than a separate instance per section — there is only ever one of them.
 *
 * Sections stay declarative: they drop an anchor where the globe belongs and
 * never touch the scene. Section-specific decorations are passed as children
 * and render inside the globe's moving group.
 */
export function GlobeStage(props: GlobeCanvasProps) {
  return <GlobeCanvas {...props} />;
}

export default GlobeStage;
