"use client";

import { createContext, useContext, type RefObject } from "react";

export type GlobeStageValue = {
  /**
   * How far the globe has travelled between anchors, 0–1. Held in a ref and
   * read inside render loops, so decorations can react to scroll without
   * re-rendering React on every frame.
   */
  progress: RefObject<number>;
};

const GlobeStageContext = createContext<GlobeStageValue | null>(null);

export const GlobeStageProvider = GlobeStageContext.Provider;

/** Returns the stage value, or `null` when rendered outside a stage. */
export function useGlobeStage(): GlobeStageValue | null {
  return useContext(GlobeStageContext);
}
