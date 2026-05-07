"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import {
  flashScrollTarget,
  prefersReducedMotion,
} from "@/lib/flash-scroll-target";

function decodeHashId(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function elementForHash(): HTMLElement | null {
  const raw = typeof window !== "undefined"
    ? window.location.hash.slice(1)
    : "";
  if (!raw) return null;
  return document.getElementById(decodeHashId(raw));
}

/** Same-page fragment from `href` (e.g. `#props`, `/vue#install` on `/vue`). */
function samePageHashFromHref(href: string): string | null {
  if (href.startsWith("#")) {
    const id = href.slice(1);
    return id ? id : null;
  }
  try {
    const url = new URL(href, window.location.href);
    if (url.pathname !== window.location.pathname) return null;
    const id = url.hash.slice(1);
    return id ? id : null;
  } catch {
    return null;
  }
}

export function DocScrollTargetFlash() {
  const pathname = usePathname();

  const flashFromHash = React.useCallback(() => {
    const raw = typeof window !== "undefined"
      ? window.location.hash.slice(1)
      : "";
    if (!raw) return;

    const reduced = prefersReducedMotion();
    let framesLeft = 30;

    const tick = () => {
      const el = elementForHash();
      if (el) {
        flashScrollTarget(el, { reducedMotion: reduced });
        return;
      }
      if (framesLeft <= 0) return;
      framesLeft -= 1;
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, []);

  React.useEffect(() => {
    flashFromHash();
  }, [pathname, flashFromHash]);

  React.useEffect(() => {
    const onHashChange = () => flashFromHash();
    window.addEventListener("hashchange", onHashChange);
    const onPopState = () => flashFromHash();
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onPopState);
    };
  }, [flashFromHash]);

  /** Next/App Router often updates the hash via history API without `hashchange`. */
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      const anchor = e.target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const id = samePageHashFromHref(anchor.getAttribute("href") ?? "");
      if (!id) return;

      const delayMs = prefersReducedMotion() ? 0 : 340;
      window.setTimeout(() => {
        const el = document.getElementById(decodeHashId(id));
        flashScrollTarget(el, {
          reducedMotion: prefersReducedMotion(),
        });
      }, delayMs);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
