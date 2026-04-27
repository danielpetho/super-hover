export type SuperHoverOptions = {
  root?: Document | Element;
  selector?: string;
  activeAttribute?: string;
};

const DEFAULT_SELECTOR = "[data-super-hover]";
const DEFAULT_ACTIVE = "data-super-hover-active";

export function createSuperHover(options: SuperHoverOptions = {}): () => void {
  const selector = options.selector ?? DEFAULT_SELECTOR;
  const activeAttribute = options.activeAttribute ?? DEFAULT_ACTIVE;
  const root = options.root;

  let lastX = 0;
  let lastY = 0;
  let hasPointer = false;
  let current: Element | null = null;
  let rafId = 0;
  let pending = false;

  function clearActive(): void {
    if (!current) return;
    const prev = current;
    current = null;
    prev.removeAttribute(activeAttribute);
    prev.dispatchEvent(
      new CustomEvent("superhoverleave", { bubbles: true, cancelable: false }),
    );
  }

  function resolveTarget(): Element | null {
    if (!hasPointer) return null;
    const hit = document.elementFromPoint(lastX, lastY);
    if (!hit) return null;
    const el = hit.closest(selector);
    if (!el) return null;
    if (root && !root.contains(el)) return null;
    return el;
  }

  function apply(): void {
    const next = resolveTarget();
    if (next === current) return;

    if (current) {
      const prev = current;
      current = null;
      prev.removeAttribute(activeAttribute);
      prev.dispatchEvent(
        new CustomEvent("superhoverleave", { bubbles: true, cancelable: false }),
      );
    }

    current = next;
    if (current) {
      current.setAttribute(activeAttribute, "");
      current.dispatchEvent(
        new CustomEvent("superhoverenter", { bubbles: true, cancelable: false }),
      );
    }
  }

  function schedule(): void {
    if (pending) return;
    pending = true;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      pending = false;
      if (!hasPointer) {
        clearActive();
        return;
      }
      apply();
    });
  }

  function onPointerMove(e: PointerEvent): void {
    lastX = e.clientX;
    lastY = e.clientY;
    hasPointer = true;
    schedule();
  }

  function onPointerLeaveDocument(): void {
    hasPointer = false;
    schedule();
  }

  function onVisibilityChange(): void {
    if (document.visibilityState === "hidden") {
      hasPointer = false;
      schedule();
    }
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("scroll", schedule, { capture: true, passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  document.addEventListener("mouseleave", onPointerLeaveDocument);
  document.addEventListener("visibilitychange", onVisibilityChange);

  schedule();

  return () => {
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("scroll", schedule, { capture: true });
    window.removeEventListener("resize", schedule);
    document.removeEventListener("mouseleave", onPointerLeaveDocument);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    if (rafId !== 0) cancelAnimationFrame(rafId);
    hasPointer = false;
    clearActive();
  };
}
