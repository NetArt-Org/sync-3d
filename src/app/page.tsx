import { GlobeStage } from "@/components/globe-stage/GlobeStage";
import { Hero } from "@/components/hero/Hero";
import { OrbitRings } from "@/components/hero/OrbitRings";
import { ProblemSection } from "@/components/problem/ProblemSection";
import { SmoothScroll } from "@/components/SmoothScroll";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col">
      <SmoothScroll />

      {/*
        One globe for the whole page. It starts on the hero's anchor and is
        carried to the problem section's anchor as that section scrolls in, so
        it reads as a single object travelling rather than one per section.
        The hero's orbit rings ride along and fade out on the way.
      */}
      <GlobeStage from="hero" to="problem" trigger="#problem">
        <OrbitRings />
      </GlobeStage>

      <Hero />
      <ProblemSection />
    </main>
  );
}
