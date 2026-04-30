"use client";

import * as React from "react";

export const SCROLL_EDGE_EPS = 4;

/** Shared stops: opaque at the “inner” edge of the fade, transparent at the scroll edge. */
export const SCROLL_FADE_STOPS =
  [
    "hsl(0, 0%, 100%) 0%",
    "hsla(0, 0%, 100%, 0.94) 6.2%",
    "hsla(0, 0%, 100%, 0.873) 11.1%",
    "hsla(0, 0%, 100%, 0.801) 15%",
    "hsla(0, 0%, 100%, 0.724) 18.2%",
    "hsla(0, 0%, 100%, 0.645) 21%",
    "hsla(0, 0%, 100%, 0.564) 23.8%",
    "hsla(0, 0%, 100%, 0.484) 26.9%",
    "hsla(0, 0%, 100%, 0.404) 30.6%",
    "hsla(0, 0%, 100%, 0.328) 35.1%",
    "hsla(0, 0%, 100%, 0.255) 41%",
    "hsla(0, 0%, 100%, 0.188) 48.4%",
    "hsla(0, 0%, 100%, 0.127) 57.6%",
    "hsla(0, 0%, 100%, 0.075) 69.1%",
    "hsla(0, 0%, 100%, 0.032) 83.1%",
    "hsla(0, 0%, 100%, 0) 100%",
  ].join(", ");

export const SCROLL_FADE_TOP = `linear-gradient(to bottom, ${SCROLL_FADE_STOPS})`;
export const SCROLL_FADE_BOTTOM = `linear-gradient(to top, ${SCROLL_FADE_STOPS})`;

/**
 * Eased scroll-edge fades (opacity) matching the main docs table demo — attach `scrollRef`
 * to the scrollable element (same node that receives scroll events).
 */
export function useScrollEdgeFade(
  scrollRef: React.RefObject<HTMLElement | null>,
): { showTopFade: boolean; showBottomFade: boolean } {
  const [showTopFade, setShowTopFade] = React.useState(false);
  const [showBottomFade, setShowBottomFade] = React.useState(false);

  const updateScrollFades = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setShowTopFade(scrollTop > SCROLL_EDGE_EPS);
    setShowBottomFade(
      scrollTop + clientHeight < scrollHeight - SCROLL_EDGE_EPS,
    );
  }, [scrollRef]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollFades();

    el.addEventListener("scroll", updateScrollFades, { passive: true });
    const ro = new ResizeObserver(updateScrollFades);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollFades);
      ro.disconnect();
    };
  }, [updateScrollFades]);

  return { showTopFade, showBottomFade };
}
