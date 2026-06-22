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
 * Returns when a moving rectangle first contains a fixed pointer point.
 *
 * This is the inverse of pointer segment vs. rectangle hit-testing: during
 * scroll, the pointer can stay still while element rectangles move underneath
 * it. Each axis gives a time range where the pointer lies inside that moving
 * range; intersecting those ranges gives the first crossing time.
 */
function movingRectContainsPointTime(
  px: number,
  py: number,
  prev: RectLike,
  curr: RectLike,
): number | null {
  const [enterX, exitX] = movingRangeContainsPointTime(
    px,
    prev.left,
    prev.right,
    curr.left,
    curr.right,
  );
  const [enterY, exitY] = movingRangeContainsPointTime(
    py,
    prev.top,
    prev.bottom,
    curr.top,
    curr.bottom,
  );

  const enter = Math.max(enterX, enterY);
  const exit = Math.min(exitX, exitY);

  if (enter > exit) return null;
  if (exit < 0 || enter > 1) return null;

  return Math.max(0, Math.min(1, enter));
}

/**
 * Returns the time range where a moving 1D interval contains a fixed point.
 */
function movingRangeContainsPointTime(
  point: number,
  prevMin: number,
  prevMax: number,
  currMin: number,
  currMax: number,
): [enter: number, exit: number] {
  const deltaMin = currMin - prevMin;
  const deltaMax = currMax - prevMax;

  const [enterMin, exitMin] = movingBoundaryLessThanOrEqualPointTime(
    prevMin,
    deltaMin,
    point,
  );
  const [enterMax, exitMax] = movingBoundaryGreaterThanOrEqualPointTime(
    prevMax,
    deltaMax,
    point,
  );

  return [Math.max(enterMin, enterMax), Math.min(exitMin, exitMax)];
}

function movingBoundaryLessThanOrEqualPointTime(
  start: number,
  delta: number,
  point: number,
): [enter: number, exit: number] {
  if (delta === 0) return start <= point ? [0, 1] : [1, 0];

  const t = (point - start) / delta;
  return delta > 0 ? [0, t] : [t, 1];
}

function movingBoundaryGreaterThanOrEqualPointTime(
  start: number,
  delta: number,
  point: number,
): [enter: number, exit: number] {
  if (delta === 0) return start >= point ? [0, 1] : [1, 0];

  const t = (point - start) / delta;
  return delta > 0 ? [t, 1] : [0, t];
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
  currentRects: ReadonlyMap<Element, RectLike>,
  previousRects?: ReadonlyMap<Element, RectLike>,
): Element[] {
  const hits: { element: Element; enter: number }[] = [];

  for (const element of candidates) {
    const currRect = currentRects.get(element);
    if (!currRect) continue;

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
  currentRects: ReadonlyMap<Element, RectLike>,
): Element[] {
  const hits: { element: Element; enter: number }[] = [];

  for (const element of candidates) {
    const prev = previousRects.get(element);
    const currRect = currentRects.get(element);
    if (!prev || !currRect) continue;

    const moved =
      prev.top !== currRect.top ||
      prev.bottom !== currRect.bottom ||
      prev.left !== currRect.left ||
      prev.right !== currRect.right;

    if (!moved) continue;

    const enter = movingRectContainsPointTime(px, py, prev, currRect);
    if (enter === null) continue;

    hits.push({ element, enter });
  }

  hits.sort((a, b) => a.enter - b.enter);

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
  currentRects: ReadonlyMap<Element, RectLike>,
  margin: number,
): Element[] {
  const near: Element[] = [];

  for (const element of candidates) {
    const curr = currentRects.get(element);
    const prev = previousRects.get(element);

    const currNear =
      curr !== undefined &&
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
