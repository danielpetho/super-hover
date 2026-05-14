/** Pointer kinds accepted for position updates via `pointermove`. */
export type SuperHoverPointerType = "mouse" | "pen" | "touch";

export type SuperHoverOptions = {
  /**
   * Pointer kinds whose `pointermove` events update the hit-test position.
   * Touch is omitted by default so scrolling on touch devices does not drive “hover”.
   *
   * Default `["mouse", "pen"]`.
   */
  pointerTypes?: SuperHoverPointerType[];
  /**
   * Optional subtree boundary: the matched element must be contained here (or in `document` when omitted).
   * Does not opt in every descendant; see `selector` for which nodes can activate.
   */
  root?: Document | Element;
  /**
   * Passed to `element.closest` from the hit-tested node to choose participating elements.
   * Default `[data-super-hover]`. Independent of `root`, which only scopes where hits are considered.
   */
  selector?: string;
  /**
   * Attribute toggled on the current matched element while active (empty string), removed when inactive.
   * Default `data-super-hover-active`.
   */
  activeAttribute?: string;
  /**
   * `CustomEvent` type dispatched on the matched element when it becomes active (`bubbles: true`).
   * Default `superhoverenter`.
   */
  enterEventType?: string;
  /**
   * `CustomEvent` type dispatched on the matched element when it stops being active.
   * Default `superhoverleave`.
   */
  leaveEventType?: string;
};

const DEFAULT_SELECTOR = "[data-super-hover]";
const DEFAULT_ACTIVE = "data-super-hover-active";
const DEFAULT_ENTER_EVENT = "superhoverenter";
const DEFAULT_LEAVE_EVENT = "superhoverleave";
const DEFAULT_POINTER_TYPES: readonly SuperHoverPointerType[] = ["mouse", "pen"];

/**
 * Tracks pointer position and hit-tests on each frame (and on scroll) so
 * “hover” state updates while scrolling, unlike native `:hover`.
 *
 * Resolves `document.elementFromPoint`, walks ancestors with `closest(selector)` to pick the active
 * matched element, optionally constrains with `root`, then toggles `activeAttribute` and dispatches
 * enter/leave events (default `superhoverenter` / `superhoverleave`) on that element.
 */
export function createSuperHover(options: SuperHoverOptions = {}): () => void {
  const selector = options.selector ?? DEFAULT_SELECTOR;
  const activeAttribute = options.activeAttribute ?? DEFAULT_ACTIVE;
  const enterEventType = options.enterEventType ?? DEFAULT_ENTER_EVENT;
  const leaveEventType = options.leaveEventType ?? DEFAULT_LEAVE_EVENT;
  const root = options.root;
  const allowedPointerTypes = new Set<string>(
    options.pointerTypes ?? [...DEFAULT_POINTER_TYPES],
  );

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
    if (!allowedPointerTypes.has(e.pointerType)) return;

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
