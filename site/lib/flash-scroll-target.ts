/** Matches `--scroll-target-flash-duration` in globals.css (ms fallback). */
const FLASH_FALLBACK_MS = 2000;

/** Ignore duplicate flashes for the same node (e.g. pathname effect + hashchange). */
const FLASH_DEBOUNCE_MS = 600;

const lastFlashAt = new WeakMap<HTMLElement, number>();

export const SCROLL_TARGET_FLASH_CLASS = "scroll-target-flash";

/** Direct child of anchored headings; flash hugs text instead of full block width. */
export const SCROLL_TARGET_FLASH_INNER_CLASS = "scroll-target-flash-inner";

function resolveFlashElement(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  if (el.classList.contains(SCROLL_TARGET_FLASH_INNER_CLASS)) return el;
  const inner = el.querySelector<HTMLElement>(
    `:scope > .${SCROLL_TARGET_FLASH_INNER_CLASS}`,
  );
  return inner ?? el;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Brief background highlight on a heading (or any element), then fade out. */
export function flashScrollTarget(
  el: HTMLElement | null,
  opts?: { reducedMotion?: boolean },
) {
  const target = resolveFlashElement(el);
  if (!target) return;

  const reduced =
    opts?.reducedMotion ?? prefersReducedMotion();
  if (reduced) return;

  const now = Date.now();
  const prev = lastFlashAt.get(target);
  if (prev !== undefined && now - prev < FLASH_DEBOUNCE_MS) return;
  lastFlashAt.set(target, now);

  target.classList.remove(SCROLL_TARGET_FLASH_CLASS);
  void target.offsetWidth;
  target.classList.add(SCROLL_TARGET_FLASH_CLASS);

  const cleanup = () => {
    target.classList.remove(SCROLL_TARGET_FLASH_CLASS);
  };

  target.addEventListener("animationend", cleanup, { once: true });
  window.setTimeout(cleanup, FLASH_FALLBACK_MS + 120);
}
