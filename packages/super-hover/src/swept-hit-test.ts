/**
 * Minimal rectangle shape used by the sweep math.
 * We copy DOMRect values into plain objects so previous-frame geometry
 * stays stable even after layout changes.
 */
export type RectLike = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

function pointInRect(px: number, py: number, rect: RectLike): boolean {
  return (
    px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom
  );
}

/**
 * Tests whether a pointer movement segment crosses a rectangle.
 *
 * The pointer often moves from A to B between browser events. If a small
 * element sits between those points, `elementFromPoint(B)` misses it.
 * This returns where along A→B the rectangle was first entered, so callers
 * can sort crossed elements in pointer-travel order.
 *
 * Uses the slab method described in
 * {@link https://motion.dev/magazine/collision-detection-in-hover-detection Motion's hover collision article}.
 */
export function lineSegmentIntersectsRect(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  rect: RectLike,
): number | null {
  const [enterX, exitX] = lineSlabRange(x0, x1, rect.left, rect.right);
  const [enterY, exitY] = lineSlabRange(y0, y1, rect.top, rect.bottom);

  const enter = Math.max(enterX, enterY);
  const exit = Math.min(exitX, exitY);

  if (enter >= exit) return null;

  const clampedEnter = Math.max(0, Math.min(1, enter));
  if (exit < 0 || enter > 1) return null;

  return clampedEnter;
}

/**
 * Finds the portion of the line segment that lies inside one axis-aligned range.
 * For example, on the x-axis: when does the segment enter/exit rect.left..rect.right?
 * Combining x and y ranges tells us whether the segment overlaps the rectangle.
 */
function lineSlabRange(
  start: number,
  end: number,
  min: number,
  max: number,
): [enter: number, exit: number] {
  const delta = end - start;

  if (delta === 0) {
    if (start < min || start > max) return [1, 0];
    return [0, 1];
  }

  let enter = (min - start) / delta;
  let exit = (max - start) / delta;

  if (enter > exit) [enter, exit] = [exit, enter];

  return [enter, exit];
}

/**
 * Detects the inverse case of pointer movement: the pointer stayed still,
 * but an element's rect moved across it, usually because of scroll.
 * This lets Super Hover catch elements that pass under a fixed cursor.
 */
function rectCrossedPointer(
  px: number,
  py: number,
  prev: RectLike,
  curr: RectLike,
): boolean {
  const xInSweep =
    px >= Math.min(prev.left, curr.left) &&
    px <= Math.max(prev.right, curr.right);
  const yInSweep =
    py >= Math.min(prev.top, curr.top) &&
    py <= Math.max(prev.bottom, curr.bottom);

  if (!xInSweep || !yInSweep) return false;
  if (pointInRect(px, py, prev) || pointInRect(px, py, curr)) return true;

  const passedLeft = prev.left > px && curr.right < px;
  const passedRight = prev.right < px && curr.left > px;
  const passedUp = prev.top > py && curr.bottom < py;
  const passedDown = prev.bottom < py && curr.top > py;

  return passedLeft || passedRight || passedUp || passedDown;
}

/**
 * Returns candidate elements crossed by the pointer path between two samples.
 *
 * Elements are sorted by the point where the path first enters their rect,
 * so enter/leave effects can be replayed in the same order the pointer crossed them.
 *
 * If an element moved since the previous frame, we also test its previous rect.
 * This avoids missing an element whose layout shifted between samples.
 */
export function elementsCrossedBySegment(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  candidates: readonly Element[],
  previousRects?: ReadonlyMap<Element, RectLike>,
): Element[] {
  const hits: { element: Element; enter: number }[] = [];

  for (const element of candidates) {
    const curr = element.getBoundingClientRect();
    const currRect: RectLike = {
      left: curr.left,
      right: curr.right,
      top: curr.top,
      bottom: curr.bottom,
    };

    let enter = lineSegmentIntersectsRect(x0, y0, x1, y1, currRect);

    if (enter === null) {
      const prev = previousRects?.get(element);
      if (prev) enter = lineSegmentIntersectsRect(x0, y0, x1, y1, prev);
    }

    if (enter === null) continue;
    hits.push({ element, enter });
  }

  return hits.sort((a, b) => a.enter - b.enter).map((hit) => hit.element);
}

/**
 * Returns elements whose rectangles moved through the fixed pointer point.
 *
 * This covers scroll-driven hover: the pointer coordinates may not change,
 * but content can move underneath it between frames. Native hover and
 * `elementFromPoint` only report the final element, so intermediate rows
 * would otherwise be skipped.
 */
export function elementsCrossedByPointerMotion(
  px: number,
  py: number,
  candidates: readonly Element[],
  previousRects: ReadonlyMap<Element, RectLike>,
): Element[] {
  const hits: { element: Element; orderX: number; orderY: number }[] = [];
  let totalDeltaX = 0;
  let totalDeltaY = 0;
  let movedCount = 0;

  for (const element of candidates) {
    const prev = previousRects.get(element);
    if (!prev) continue;

    const curr = element.getBoundingClientRect();
    const currRect: RectLike = {
      left: curr.left,
      right: curr.right,
      top: curr.top,
      bottom: curr.bottom,
    };

    const moved =
      prev.top !== currRect.top ||
      prev.bottom !== currRect.bottom ||
      prev.left !== currRect.left ||
      prev.right !== currRect.right;

    if (!moved) continue;

    movedCount += 1;
    totalDeltaX += currRect.left - prev.left;
    totalDeltaY += currRect.top - prev.top;

    if (!rectCrossedPointer(px, py, prev, currRect)) continue;

    hits.push({
      element,
      orderX: (prev.left + currRect.left) / 2,
      orderY: (prev.top + currRect.top) / 2,
    });
  }

  const movedMostlyHorizontally = Math.abs(totalDeltaX) > Math.abs(totalDeltaY);
  const contentMovedNegative =
    movedCount === 0 ||
    (movedMostlyHorizontally ? totalDeltaX : totalDeltaY) / movedCount < 0;

  hits.sort((a, b) => {
    const aOrder = movedMostlyHorizontally ? a.orderX : a.orderY;
    const bOrder = movedMostlyHorizontally ? b.orderX : b.orderY;
    return contentMovedNegative ? aOrder - bOrder : bOrder - aOrder;
  });

  return hits.map((hit) => hit.element);
}

/**
 * Captures a frame's element geometry so the next tick can compare where
 * each element used to be versus where it is now.
 */
export function readRects(
  candidates: readonly Element[],
): Map<Element, RectLike> {
  const rects = new Map<Element, RectLike>();

  for (const element of candidates) {
    const rect = element.getBoundingClientRect();
    rects.set(element, {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
    });
  }

  return rects;
}

/**
 * Limits sweep checks to elements near the pointer in both axes.
 * This is a performance guard: collision-testing every matching element
 * in a large grid or list on every frame can get expensive.
 */
export function candidatesNearPointer(
  candidates: readonly Element[],
  px: number,
  py: number,
  previousRects: ReadonlyMap<Element, RectLike>,
  margin: number,
): Element[] {
  const near: Element[] = [];

  for (const element of candidates) {
    const curr = element.getBoundingClientRect();
    const prev = previousRects.get(element);

    const currNear =
      curr.right >= px - margin &&
      curr.left <= px + margin &&
      curr.bottom >= py - margin &&
      curr.top <= py + margin;
    const prevNear =
      prev !== undefined &&
      prev.right >= px - margin &&
      prev.left <= px + margin &&
      prev.bottom >= py - margin &&
      prev.top <= py + margin;

    if (currNear || prevNear) near.push(element);
  }

  return near;
}
