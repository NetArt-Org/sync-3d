"use client";

import { useEffect, useRef, type RefObject } from "react";

export type Pointer = { x: number; y: number };

/**
 * Viewport-normalised pointer position in the range `[-1, 1]`, written into a
 * ref instead of state so that reading it inside a render loop never triggers a
 * React re-render.
 *
 * Tracking happens at the window level rather than on the canvas so the globe
 * keeps responding while the cursor is over the copy on the other side of the
 * hero.
 */
export function useWindowPointer(enabled = true): RefObject<Pointer> {
  const pointer = useRef<Pointer>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      pointer.current.x = 0;
      pointer.current.y = 0;
      return;
    }

    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled]);

  return pointer;
}
