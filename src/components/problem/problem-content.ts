import { ChartColumn, SquarePlay, Tv, type LucideIcon } from "lucide-react";

export type ProblemFeature = {
  id: string;
  icon: LucideIcon;
  text: string;
};

/** The three siloed-measurement rows, in reading order. */
export const PROBLEM_FEATURES: readonly ProblemFeature[] = [
  { id: "tv", icon: Tv, text: "TV measures TV." },
  { id: "meta", icon: ChartColumn, text: "Meta measures Meta." },
  { id: "youtube", icon: SquarePlay, text: "YouTube measures YouTube." },
];
