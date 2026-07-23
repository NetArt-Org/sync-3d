import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Marks where the globe should sit within a section.
 *
 * The element's border box *is* the globe's circle: its centre becomes the
 * globe's centre and its width becomes the globe's diameter. It renders
 * nothing visible — the shared `<GlobeStage />` measures it every frame and
 * places the WebGL globe on top of it.
 *
 * Because placement is expressed as ordinary layout, a section positions the
 * globe with the same Tailwind classes it uses for everything else, and
 * responsive behaviour comes for free.
 */
export function GlobeAnchor({
  id,
  className,
  ...props
}: { id: string } & Omit<ComponentProps<"div">, "id">) {
  return (
    <div
      data-globe-anchor={id}
      aria-hidden="true"
      className={cn("pointer-events-none", className)}
      {...props}
    />
  );
}
