import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefCallback,
} from "react";

import { createSuperHover } from "./index.js";
import type {
  SuperHoverEnterEvent,
  SuperHoverLeaveEvent,
  SuperHoverMoveEvent,
  UseSuperHoverOptions,
} from "./use-super-hover-options.js";

export type {
  SuperHoverEnterEvent,
  SuperHoverLeaveEvent,
  SuperHoverMoveEvent,
  UseSuperHoverOptions,
};

const noopEnter: (event: SuperHoverEnterEvent) => void = () => {};
const noopLeave: (event: SuperHoverLeaveEvent) => void = () => {};

/**
 * Enter/leave always; move listener only when {@link UseSuperHoverOptions.onMove}
 * is passed. Omitting both `moveEventType` and `onMove` passes `moveEventType: false`
 * into `createSuperHover` so unused move work is skipped.
 * Callbacks are read from refs each event; **`onMove` identity does not rerun the effect—only whether it is passed**
 * (`onMove !== undefined`) does (so inline `onMove` handlers avoid remounting Super Hover).
 * Prefers a stable `root` (e.g. from {@link useSuperHoverRef}) so the effect re-runs when the node mounts.
 */
export function useSuperHover(
  root: HTMLElement | null,
  {
    enabled = true,
    onEnter = noopEnter,
    onLeave = noopLeave,
    onMove,
    selector,
    activeAttribute,
    pointerTypes,
    enterEventType = "superhoverenter",
    leaveEventType = "superhoverleave",
    moveEventType,
  }: UseSuperHoverOptions = {},
): void {
  const onEnterRef = useRef(onEnter);
  const onLeaveRef = useRef(onLeave);
  const onMoveRef = useRef(onMove);
  onEnterRef.current = onEnter;
  onLeaveRef.current = onLeave;
  onMoveRef.current = onMove;

  const hasOnMove = onMove !== undefined;

  useEffect(() => {
    if (!enabled || !root) return;

    const handleEnter = (e: Event) =>
      onEnterRef.current(e as SuperHoverEnterEvent);
    const handleLeave = (e: Event) =>
      onLeaveRef.current(e as SuperHoverLeaveEvent);
    const handleMove = (e: Event) => {
      onMoveRef.current?.(e as SuperHoverMoveEvent);
    };

    const resolvedMove =
      moveEventType === false ? null : (moveEventType ?? "superhovermove");

    const listenMove = resolvedMove !== null && hasOnMove;

    root.addEventListener(enterEventType, handleEnter);
    root.addEventListener(leaveEventType, handleLeave);
    if (listenMove) {
      root.addEventListener(resolvedMove, handleMove);
    }

    const ctrl = createSuperHover({
      root,
      ...(selector !== undefined && { selector }),
      ...(activeAttribute !== undefined && { activeAttribute }),
      ...(pointerTypes !== undefined && { pointerTypes }),
      enterEventType,
      leaveEventType,
      ...(moveEventType !== undefined
        ? { moveEventType }
        : hasOnMove
          ? {}
          : { moveEventType: false }),
    });

    return () => {
      root.removeEventListener(enterEventType, handleEnter);
      root.removeEventListener(leaveEventType, handleLeave);
      if (listenMove) {
        root.removeEventListener(resolvedMove, handleMove);
      }
      ctrl.destroy();
    };
  }, [
    root,
    enabled,
    selector,
    activeAttribute,
    pointerTypes,
    enterEventType,
    leaveEventType,
    moveEventType,
    hasOnMove,
  ]);
}

/**
 * Returns a [callback ref](https://react.dev/reference/react-dom/components/common#ref-callback) that wires up
 * {@link useSuperHover} when the node mounts, so you do not need to manage `ref.current` in a `useEffect` dependency array.
 */
export function useSuperHoverRef(
  options: UseSuperHoverOptions = {},
): RefCallback<HTMLElement> {
  const [node, setNode] = useState<HTMLElement | null>(null);
  useSuperHover(node, options);
  return useCallback((el: HTMLElement | null) => {
    setNode(el);
  }, []);
}
