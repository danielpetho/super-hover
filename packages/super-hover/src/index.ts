import {
  candidatesNearPointer,
  elementsCrossedByPointerMotion,
  elementsCrossedBySegment,
  readRects,
  type RectLike,
} from "./swept-hit-test.js";

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

/** Pointer kinds accepted for position updates https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType. */
export type SuperHoverPointerType = "mouse" | "pen" | "touch";

/** Controller for a {@link createSuperHover} instance. */
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
   * When true, clears hover state while an allowed pointer is pressed (for example during text selection).
   * Default false.
   */
  disableWhilePointerDown?: boolean;
  /**
   * Optional subtree boundary: the matched element must be contained here (or in the active `document` when omitted).
   * Does not opt in every descendant; see `selector` for which nodes can activate.
   *
   * You may pass an iframe **`Document`** (`contentDocument`) or any **`Element`** inside that frame — hit-testing uses
   * that node's document (`elementFromPoint`, listeners).
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
  /**
   * When true, tests the line segment from the previous hit-test position to the current pointer
   * against target bounding boxes (slab method) so fast pointer movement does not skip elements.
   * Also compares previous and current target layouts so fast scroll under a fixed pointer does
   * not skip elements. Crossed elements are briefly activated in path order before the endpoint
   * target stays active.
   *
   * See {@link https://motion.dev/magazine/collision-detection-in-hover-detection Motion's collision article}.
   *
   * Default false.
   */
  sweptHitTest?: boolean;
  /**
   * Pixel distance around the pointer used to pre-filter swept-hit-test candidates.
   *
   * Larger values catch bigger pointer/scroll jumps but test more elements per frame.
   * Smaller values can improve performance in dense grids/lists but may miss elements
   * that jump across the pointer between frames. Only used when `sweptHitTest` is true.
   *
   * Default 320.
   */
  sweptHitTestMargin?: number;
};

const DEFAULT_SELECTOR = "[data-super-hover]";
const DEFAULT_ACTIVE = "data-super-hover-active";
const DEFAULT_ENTER_EVENT = "superhoverenter";
const DEFAULT_LEAVE_EVENT = "superhoverleave";
const DEFAULT_MOVE_EVENT = "superhovermove";
const DEFAULT_POINTER_TYPES: readonly SuperHoverPointerType[] = [
  "mouse",
  "pen",
];

/**
 * Default swept-hit-test search radius around the pointer, in CSS pixels.
 *
 * This is intentionally larger than a typical pointer movement between frames
 * so fast mouse moves, wheel scrolls, and modest frame drops still detect items
 * that crossed the pointer path, without collision-testing every matching node
 * in large lists or grids.
 */
const DEFAULT_SWEPT_HIT_TEST_MARGIN = 320;

/** `DOCUMENT_NODE` ({@link https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType Node.nodeType}). */
const DOCUMENT_NODE = 9;

/**
 * Resolve the `Document` used for {@link Document.elementFromPoint} and subtree checks from optional `root`.
 * Detects document nodes via `nodeType`, not `instanceof Document`, so same-origin iframe `Document` instances
 * (a different realm’s `Document` constructor) still resolve correctly.
 */
function getScopeDocument(root?: Document | Element): Document {
  if (!root) return document;
  if (root.nodeType === DOCUMENT_NODE) return root as Document;
  return root.ownerDocument ?? document;
}

/** Whether `el` is inside the optional hit-test boundary (`root`). For a {@link Document} root, uses `documentElement.contains`. */
function rootContains(
  root: Document | Element | undefined,
  el: Element,
): boolean {
  if (!root) return true;

  if (root.nodeType === DOCUMENT_NODE) {
    const html = (root as Document).documentElement;
    return html ? html.contains(el) : false;
  }

  return root.contains(el);
}

/**
 * Gathers every element that matches `selector` and is contained by `root`.
 *
 * This is the full set of elements swept-hit-testing can consider.
 * We cache this list between ticks rather than querying the DOM every frame,
 * and the `rootContains` guard keeps behavior consistent whether `root` is
 * a Document, an Element, or omitted.
 */
function queryCandidates(
  root: Document | Element | undefined,
  selector: string,
): Element[] {
  const scope = root ?? document;
  const list =
    scope.nodeType === DOCUMENT_NODE
      ? (scope as Document).querySelectorAll(selector)
      : (scope as Element).querySelectorAll(selector);

  return Array.from(list).filter((el) => rootContains(root, el));
}

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
export function createSuperHover(
  options: SuperHoverOptions = {},
): SuperHoverController {
  const selector = options.selector ?? DEFAULT_SELECTOR;
  const activeAttribute = options.activeAttribute ?? DEFAULT_ACTIVE;
  const enterEventType = options.enterEventType ?? DEFAULT_ENTER_EVENT;
  const leaveEventType = options.leaveEventType ?? DEFAULT_LEAVE_EVENT;
  const moveEventName =
    options.moveEventType === false
      ? null
      : (options.moveEventType ?? DEFAULT_MOVE_EVENT);
  const root = options.root;
  const scopeDoc = getScopeDocument(root);
  const scopeWin = scopeDoc.defaultView ?? window;
  const allowedPointerTypes = new Set<string>(
    options.pointerTypes ?? [...DEFAULT_POINTER_TYPES],
  );
  const disableWhilePointerDown = options.disableWhilePointerDown ?? false;
  const sweptHitTest = options.sweptHitTest ?? false;
  const sweptHitTestMargin =
    options.sweptHitTestMargin ?? DEFAULT_SWEPT_HIT_TEST_MARGIN;

  let running = options.enabled ?? true;
  let destroyed = false;

  let lastX = 0;
  let lastY = 0;
  let sampleX = 0;
  let sampleY = 0;
  let hasPointer = false;
  let pointerDown = false;
  let current: Element | null = null;
  let previousRects = new Map<Element, RectLike>();
  let cachedCandidates: Element[] | null = null;
  const candidateObserver = sweptHitTest
    ? new scopeWin.MutationObserver(invalidateCandidates)
    : null;
  let flashCleanupId = 0;
  let rafId = 0;
  let pending = false;

  function cancelPendingFrame(): void {
    if (rafId !== 0) {
      scopeWin.cancelAnimationFrame(rafId);
      rafId = 0;
      pending = false;
    }
  }

  function deactivate(prev: Element, next: Element | null): void {
    prev.removeAttribute(activeAttribute);
    prev.dispatchEvent(
      new CustomEvent<SuperHoverEventDetail>(leaveEventType, {
        bubbles: true,
        cancelable: false,
        detail: { x: lastX, y: lastY, previous: prev, current: next },
      }),
    );
  }

  function clearActive(): void {
    if (!current) return;
    const prev = current;
    current = null;
    deactivate(prev, null);
  }

  /**
   * Briefly activates an element that was crossed by the sweep but is not
   * the final hover target. This lets consumers receive enter effects/events
   * for skipped elements during fast pointer movement or scroll.
   */
  function flashElement(el: Element): void {
    if (el.hasAttribute(activeAttribute)) return;

    el.setAttribute(activeAttribute, "");
    el.dispatchEvent(
      new CustomEvent<SuperHoverEventDetail>(enterEventType, {
        bubbles: true,
        cancelable: false,
        detail: {
          x: lastX,
          y: lastY,
          previous: null,
          current: el,
        },
      }),
    );
  }

  /**
   * Flashed elements are transient: they should fire enter, then leave on the
   * next frame unless they became the real current target.
   *
   * `flashCleanupId` invalidates older cleanups when a newer sweep happens
   * before the cleanup frame runs, preventing stale cleanup from deactivating
   * recently flashed elements.
   */
  function scheduleFlashCleanup(toDeactivate: Element[]): void {
    if (toDeactivate.length === 0) return;

    const cleanupId = ++flashCleanupId;

    scopeWin.requestAnimationFrame(() => {
      if (destroyed || cleanupId !== flashCleanupId) return;

      for (const el of toDeactivate) {
        if (el === current) continue;
        if (!el.hasAttribute(activeAttribute)) continue;
        deactivate(el, current);
      }
    });
  }

  /**
   * Replays hover for all crossed intermediate elements while avoiding:
   * - the final target, which will become/stay current normally
   * - the previous target, which already receives a normal leave event
   */
  function flashCrossed(
    crossed: Element[],
    next: Element | null,
    previousElement: Element | null,
  ): void {
    const toDeactivate: Element[] = [];

    for (const el of crossed) {
      if (el === next || el === previousElement) continue;
      flashElement(el);
      toDeactivate.push(el);
    }

    scheduleFlashCleanup(toDeactivate);
  }

  function resolveTarget(): Element | null {
    if (!running || !hasPointer) return null;
    if (disableWhilePointerDown && pointerDown) return null;

    const hit = scopeDoc.elementFromPoint(lastX, lastY);

    if (!hit) return null;
    const el = hit.closest(selector);

    if (!el) return null;
    if (!rootContains(root, el)) return null;

    return el;
  }

  /**
   * Returns the cached swept-hit-test candidate list.
   *
   * `querySelectorAll` is cheaper than geometry reads, but it is still avoidable
   * work in large static grids/lists. We refresh this cache on explicit
   * `refresh()` calls and when DOM nodes are added/removed under `root`.
   */
  function getCandidates(): Element[] {
    if (cachedCandidates === null) {
      cachedCandidates = queryCandidates(root, selector);
    }

    return cachedCandidates;
  }

  function invalidateCandidates(): void {
    cachedCandidates = null;
  }

  /**
   * Invalidates the candidate cache when elements are added/removed.
   *
   * We intentionally do not observe attributes: toggling
   * `data-super-hover-active` would otherwise invalidate the cache on every
   * hover update. If code changes whether an existing element matches
   * `selector`, call `refresh()` to rebuild the candidate list.
   */
  function observeCandidateChanges(): void {
    if (!candidateObserver) return;

    const target =
      root?.nodeType === DOCUMENT_NODE
        ? (root as Document).documentElement
        : (root ?? scopeDoc.documentElement);

    if (!target) return;

    candidateObserver.observe(target, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Combines the two swept-hit-test cases:
   * 1. pointer moved across elements between samples
   * 2. elements moved under a fixed pointer because of scroll/layout
   *
   * Results are deduped while preserving segment hits before scroll-motion hits.
   */
  function resolveCrossedElements(
    candidates: Element[],
    currentRects: ReadonlyMap<Element, RectLike>,
  ): Element[] {
    const sweepCandidates =
      previousRects.size > 0
        ? candidatesNearPointer(
            candidates,
            lastX,
            lastY,
            previousRects,
            currentRects,
            sweptHitTestMargin,
          )
        : candidates;

    const segment =
      lastX !== sampleX || lastY !== sampleY
        ? elementsCrossedBySegment(
            sampleX,
            sampleY,
            lastX,
            lastY,
            sweepCandidates,
            currentRects,
            previousRects,
          )
        : [];

    const scroll =
      previousRects.size > 0
        ? elementsCrossedByPointerMotion(
            lastX,
            lastY,
            sweepCandidates,
            previousRects,
            currentRects,
          )
        : [];

    const seen = new Set<Element>();
    const merged: Element[] = [];

    for (const element of [...segment, ...scroll]) {
      if (seen.has(element)) continue;
      seen.add(element);
      merged.push(element);
    }

    return merged;
  }

  function apply(): void {
    if (destroyed || !running) {
      clearActive();
      return;
    }

    const candidates = sweptHitTest ? getCandidates() : [];
    const currentRects = sweptHitTest ? readRects(candidates) : previousRects;
    const next = resolveTarget();
    const crossed = sweptHitTest
      ? resolveCrossedElements(candidates, currentRects)
      : [];

    if (next === current && crossed.length === 0) {
      sampleX = lastX;
      sampleY = lastY;
      if (sweptHitTest) previousRects = currentRects;
      return;
    }

    if (next === current && crossed.length > 0) {
      flashCrossed(crossed, current, null);

      sampleX = lastX;
      sampleY = lastY;
      previousRects = currentRects;
      return;
    }

    const previousElement = current;

    if (current) {
      const prev = current;
      current = null;
      deactivate(prev, next);
    }

    if (sweptHitTest && crossed.length > 0) {
      flashCrossed(crossed, next, previousElement);
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

    sampleX = lastX;
    sampleY = lastY;
    if (sweptHitTest) previousRects = currentRects;
  }

  function schedule(): void {
    if (destroyed || pending) return;
    // Coalesce many pointer/scroll/resize events into one hit-test before the next paint.
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
    if (destroyed) return;
    if (!allowedPointerTypes.has(e.pointerType)) return;

    if (!hasPointer) {
      sampleX = e.clientX;
      sampleY = e.clientY;
    }

    lastX = e.clientX;
    lastY = e.clientY;
    hasPointer = true;

    if (disableWhilePointerDown) {
      pointerDown = e.buttons !== 0;
    }

    // Keep coordinates fresh while paused so resume() can hit-test the latest pointer position.
    if (running) schedule();
  }

  function onPointerLeaveDocument(): void {
    hasPointer = false;
    pointerDown = false;
    schedule();
  }

  function onPointerDown(e: PointerEvent): void {
    if (destroyed) return;
    if (!disableWhilePointerDown) return;
    if (!allowedPointerTypes.has(e.pointerType)) return;

    lastX = e.clientX;
    lastY = e.clientY;
    hasPointer = true;
    pointerDown = true;

    if (running) schedule();
  }

  function onPointerUp(e: PointerEvent): void {
    if (destroyed) return;
    if (!disableWhilePointerDown) return;

    if (allowedPointerTypes.has(e.pointerType)) {
      lastX = e.clientX;
      lastY = e.clientY;
      hasPointer = true;
    }

    pointerDown = false;

    if (running) schedule();
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

  observeCandidateChanges();

  scopeWin.addEventListener("pointermove", onPointerMove, { passive: true });
  scopeWin.addEventListener("pointerdown", onPointerDown, { passive: true });
  scopeWin.addEventListener("pointerup", onPointerUp, { passive: true });
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
      invalidateCandidates();
      schedule();
    },

    destroy() {
      if (destroyed) return;

      destroyed = true;
      flashCleanupId += 1;
      candidateObserver?.disconnect();

      scopeWin.removeEventListener("pointermove", onPointerMove);
      scopeWin.removeEventListener("pointerdown", onPointerDown);
      scopeWin.removeEventListener("pointerup", onPointerUp);
      scopeDoc.removeEventListener("scroll", schedule, { capture: true });
      scopeWin.removeEventListener("resize", schedule);
      scopeWin.removeEventListener("blur", onPointerLeaveDocument);
      scopeDoc.removeEventListener("pointerleave", onPointerLeaveDocument);
      scopeDoc.removeEventListener("pointercancel", onPointerLeaveDocument);
      scopeDoc.removeEventListener("pointerout", onPointerOut);
      scopeDoc.removeEventListener("visibilitychange", onVisibilityChange);

      cancelPendingFrame();
      hasPointer = false;
      pointerDown = false;
      clearActive();
    },
  };
}
