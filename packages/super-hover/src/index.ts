/** Payload on move `CustomEvent`s fired each hit-test frame while active (`event.detail`). */
export type SuperHoverMoveEventDetail = {
  x: number;
  y: number;
  current: Element;
};

/** Payload on `superhoverenter` / `superhoverleave` `CustomEvent`s (`event.detail`). */
export type SuperHoverEventDetail = {
  x: number;
  y: number;
  previous: Element | null;
  current: Element | null;
};

/** Pointer kinds accepted for position updates via `pointermove`. */
export type SuperHoverPointerType = "mouse" | "pen" | "touch";

/** Returned by {@link createSuperHover}; safe to call after {@link SuperHoverController.destroy} is a no-op. */
export type SuperHoverController = {
  pause(): void;
  resume(): void;
  refresh(): void;
  destroy(): void;
};

export type SuperHoverOptions = {
  /**
   * When false, starts in a paused state (same as {@link SuperHoverController.pause}). Default true.
   */
  enabled?: boolean;
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
   * `detail` is {@link SuperHoverEventDetail} (hit coordinates and previous/current targets).
   * Default `superhoverenter`.
   */
  enterEventType?: string;
  /**
   * `CustomEvent` type dispatched on the matched element when it stops being active.
   * `detail` is {@link SuperHoverEventDetail}.
   * Default `superhoverleave`.
   */
  leaveEventType?: string;
  /**
   * `CustomEvent` type dispatched on each hit-test tick while an element is active
   * (after updates from that tick, including the enter event when the active target changed; `bubbles: true`).
   * `detail` is {@link SuperHoverMoveEventDetail}.
   * Set to `false` to disable. Default `superhovermove`.
   */
  moveEventType?: string | false;
};

const DEFAULT_SELECTOR = "[data-super-hover]";
const DEFAULT_ACTIVE = "data-super-hover-active";
const DEFAULT_ENTER_EVENT = "superhoverenter";
const DEFAULT_LEAVE_EVENT = "superhoverleave";
const DEFAULT_MOVE_EVENT = "superhovermove";
const DEFAULT_POINTER_TYPES: readonly SuperHoverPointerType[] = ["mouse", "pen"];

/**
 * Tracks pointer position and hit-tests on each frame (and on scroll) so
 * “hover” state updates while scrolling, unlike native `:hover`.
 *
 * Resolves `elementFromPoint` on the same `Document` as `root` (or the active document when `root` is omitted),
 * walks ancestors with `closest(selector)` to pick the active
 * matched element, optionally constrains with `root`, then toggles `activeAttribute` and dispatches
 * enter/leave events (default `superhoverenter` / `superhoverleave`) on that element,
 * each with {@link SuperHoverEventDetail} on `event.detail`; optionally `superhovermove` once per scheduled
 * tick while active (see {@link SuperHoverOptions.moveEventType}).
 */
export function createSuperHover(options: SuperHoverOptions = {}): SuperHoverController {
  const selector = options.selector ?? DEFAULT_SELECTOR;
  const activeAttribute = options.activeAttribute ?? DEFAULT_ACTIVE;
  const enterEventType = options.enterEventType ?? DEFAULT_ENTER_EVENT;
  const leaveEventType = options.leaveEventType ?? DEFAULT_LEAVE_EVENT;
  const moveEventName =
    options.moveEventType === false
      ? null
      : (options.moveEventType ?? DEFAULT_MOVE_EVENT);
  const root = options.root;
  const scopeDoc =
    root instanceof Document ? root : (root?.ownerDocument ?? document);
  const scopeWin = scopeDoc.defaultView ?? window;
  const allowedPointerTypes = new Set<string>(
    options.pointerTypes ?? [...DEFAULT_POINTER_TYPES],
  );

  let running = options.enabled ?? true;
  let destroyed = false;

  let lastX = 0;
  let lastY = 0;
  let hasPointer = false;
  let current: Element | null = null;
  let rafId = 0;
  let pending = false;

  function cancelPendingFrame(): void {
    if (rafId !== 0) {
      scopeWin.cancelAnimationFrame(rafId);
      rafId = 0;
      pending = false;
    }
  }

  function clearActive(): void {
    if (!current) return;
    const prev = current;
    current = null;
    prev.removeAttribute(activeAttribute);
    prev.dispatchEvent(
      new CustomEvent<SuperHoverEventDetail>(leaveEventType, {
        bubbles: true,
        cancelable: false,
        detail: { x: lastX, y: lastY, previous: prev, current: null },
      }),
    );
  }

  function resolveTarget(): Element | null {
    if (!running || !hasPointer) return null;
    const hit = scopeDoc.elementFromPoint(lastX, lastY);
    if (!hit) return null;
    const el = hit.closest(selector);
    if (!el) return null;
    if (root && !root.contains(el)) return null;
    return el;
  }

  function apply(): void {
    if (destroyed || !running) {
      clearActive();
      return;
    }

    const next = resolveTarget();
    if (next === current) return;

    const previousElement = current;

    if (current) {
      const prev = current;
      current = null;
      prev.removeAttribute(activeAttribute);
      prev.dispatchEvent(
        new CustomEvent<SuperHoverEventDetail>(leaveEventType, {
          bubbles: true,
          cancelable: false,
          detail: { x: lastX, y: lastY, previous: prev, current: next },
        }),
      );
    }

    current = next;
    if (current) {
      current.setAttribute(activeAttribute, "");
      current.dispatchEvent(
        new CustomEvent<SuperHoverEventDetail>(enterEventType, {
          bubbles: true,
          cancelable: false,
          detail: {
            x: lastX,
            y: lastY,
            previous: previousElement,
            current,
          },
        }),
      );
    }
  }

  function schedule(): void {
    if (destroyed || pending) return;
    pending = true;
    rafId = scopeWin.requestAnimationFrame(() => {
      rafId = 0;
      pending = false;
      if (destroyed) return;
      if (!running || !hasPointer) {
        clearActive();
        return;
      }
      apply();
      if (moveEventName !== null && current !== null) {
        current.dispatchEvent(
          new CustomEvent<SuperHoverMoveEventDetail>(moveEventName, {
            bubbles: true,
            cancelable: false,
            detail: { x: lastX, y: lastY, current },
          }),
        );
      }
    });
  }

  function onPointerMove(e: PointerEvent): void {
    if (destroyed || !running) return;
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

  function onPointerOut(e: PointerEvent): void {
    if (!e.relatedTarget) onPointerLeaveDocument();
  }

  function onVisibilityChange(): void {
    if (scopeDoc.visibilityState === "hidden") {
      hasPointer = false;
      schedule();
    }
  }

  scopeWin.addEventListener("pointermove", onPointerMove, { passive: true });
  scopeDoc.addEventListener("scroll", schedule, {
    capture: true,
    passive: true,
  });
  scopeWin.addEventListener("resize", schedule, { passive: true });
  scopeWin.addEventListener("blur", onPointerLeaveDocument);
  scopeDoc.addEventListener("pointerleave", onPointerLeaveDocument);
  scopeDoc.addEventListener("pointercancel", onPointerLeaveDocument);
  scopeDoc.addEventListener("pointerout", onPointerOut);
  scopeDoc.addEventListener("visibilitychange", onVisibilityChange);

  schedule();

  return {
    pause() {
      if (destroyed) return;
      running = false;
      cancelPendingFrame();
      clearActive();
    },

    resume() {
      if (destroyed) return;
      running = true;
      schedule();
    },

    refresh() {
      if (destroyed) return;
      schedule();
    },

    destroy() {
      if (destroyed) return;

      destroyed = true;

      scopeWin.removeEventListener("pointermove", onPointerMove);
      scopeDoc.removeEventListener("scroll", schedule, { capture: true });
      scopeWin.removeEventListener("resize", schedule);
      scopeWin.removeEventListener("blur", onPointerLeaveDocument);
      scopeDoc.removeEventListener("pointerleave", onPointerLeaveDocument);
      scopeDoc.removeEventListener("pointercancel", onPointerLeaveDocument);
      scopeDoc.removeEventListener("pointerout", onPointerOut);
      scopeDoc.removeEventListener("visibilitychange", onVisibilityChange);

      cancelPendingFrame();
      hasPointer = false;
      clearActive();
    },
  };
}
