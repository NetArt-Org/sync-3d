import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` on the client, `useEffect` on the server.
 *
 * GSAP setup wants to run before the first paint so nothing flashes in its
 * pre-animation state, but `useLayoutEffect` warns during server rendering.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
