"use client";

import { useSyncExternalStore } from "react";
import { Callout } from "@/components/callout";

/** Tailwind `md` breakpoint minus 1px — align with `max-md` layouts */
const NARROW_MAX_PX = 767;

function subscribe(onStoreChange: () => void) {
  const mqNarrow = window.matchMedia(`(max-width: ${NARROW_MAX_PX}px)`);
  const mqHover = window.matchMedia("(hover: hover)");
  const mqFinePointer = window.matchMedia("(pointer: fine)");

  const listener = () => onStoreChange();
  mqNarrow.addEventListener("change", listener);
  mqHover.addEventListener("change", listener);
  mqFinePointer.addEventListener("change", listener);

  return () => {
    mqNarrow.removeEventListener("change", listener);
    mqHover.removeEventListener("change", listener);
    mqFinePointer.removeEventListener("change", listener);
  };
}

function readsFineHover(): boolean {
  return (
    window.matchMedia("(hover: hover)").matches &&
    window.matchMedia("(pointer: fine)").matches
  );
}

function readsNarrow(): boolean {
  return window.matchMedia(`(max-width: ${NARROW_MAX_PX}px)`).matches;
}

function getSnapshot(): boolean {
  return readsNarrow() && !readsFineHover();
}

function getServerSnapshot(): boolean {
  return false;
}

export function DocMobileHoverNotice() {
  const show = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!show) return null;

  return (
    <Callout variant="neutral" badge={{ type: "icon" }}>
      <p>
        This library and the live demos work best on desktop with a mouse or trackpad.
      </p>
    </Callout>
  );
}
