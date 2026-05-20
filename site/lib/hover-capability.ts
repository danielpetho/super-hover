"use client";

import { useSyncExternalStore } from "react";

export const HOVER_CAPABLE_MEDIA_QUERY = "(hover: hover) and (pointer: fine)";

export function canUseHover() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(HOVER_CAPABLE_MEDIA_QUERY).matches
  );
}

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia(HOVER_CAPABLE_MEDIA_QUERY);

  media.addEventListener("change", onStoreChange);

  return () => {
    media.removeEventListener("change", onStoreChange);
  };
}

function getServerSnapshot() {
  return false;
}

export function useCanUseHover() {
  return useSyncExternalStore(subscribe, canUseHover, getServerSnapshot);
}
