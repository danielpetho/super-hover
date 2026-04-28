export type SuperHoverOptions = {
  /** Only elements inside this subtree can become active (optional). */
  root?: Document | Element;
  /** CSS selector for participating elements. Default `[data-super-hover]`. */
  selector?: string;
  /** Attribute set on the element under the cursor. Default `data-super-hover-active`. */
  activeAttribute?: string;
  /**
   * Dispatched on the target row when it becomes the hit target.
   * Default `superhoverenter`.
   */
  enterEventType?: string;
  /**
   * Dispatched on the target row when it stops being the hit target.
   * Default `superhoverleave`.
   */
  leaveEventType?: string;
};

const DEFAULT_SELECTOR = "[data-super-hover]";
const DEFAULT_ACTIVE = "data-super-hover-active";
const DEFAULT_ENTER_EVENT = "superhoverenter";
const DEFAULT_LEAVE_EVENT = "superhoverleave";

/**
 * Tracks pointer position and hit-tests on each frame (and on scroll) so
 * “hover” state updates while scrolling, unlike native `:hover`.
 *
 * Dispatches customizable events (default `superhoverenter` / `superhoverleave`) on the target element.
 */
export function createSuperHover(options: SuperHoverOptions = {}): () => void {
  const selector = options.selector ?? DEFAULT_SELECTOR;
  const activeAttribute = options.activeAttribute ?? DEFAULT_ACTIVE;
  const enterEventType = options.enterEventType ?? DEFAULT_ENTER_EVENT;
  const leaveEventType = options.leaveEventType ?? DEFAULT_LEAVE_EVENT;
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
      new CustomEvent(leaveEventType, { bubbles: true, cancelable: false }),
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
        new CustomEvent(leaveEventType, { bubbles: true, cancelable: false }),
      );
    }

    current = next;
    if (current) {
      current.setAttribute(activeAttribute, "");
      current.dispatchEvent(
        new CustomEvent(enterEventType, { bubbles: true, cancelable: false }),
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
