"use client";

import { useSyncExternalStore } from "react";
import { Callout } from "@/components/callout";
import { useCanUseHover } from "@/lib/hover-capability";

/** Tailwind `md` breakpoint minus 1px — align with `max-md` layouts */
const NARROW_MAX_PX = 767;

function subscribe(onStoreChange: () => void) {
  const mqNarrow = window.matchMedia(`(max-width: ${NARROW_MAX_PX}px)`);

  mqNarrow.addEventListener("change", onStoreChange);

  return () => {
    mqNarrow.removeEventListener("change", onStoreChange);
  };
}

function readsNarrow(): boolean {
  return window.matchMedia(`(max-width: ${NARROW_MAX_PX}px)`).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function DocMobileHoverNotice() {
  const isNarrow = useSyncExternalStore(
    subscribe,
    readsNarrow,
    getServerSnapshot,
  );
  const canHover = useCanUseHover();
  const show = isNarrow && !canHover;

  if (!show) return null;

  return (
    <Callout variant="neutral" badge={{ type: "icon" }}>
      <p>
        This library and the live demos work best on desktop with a mouse or trackpad.
      </p>
    </Callout>
  );
}
