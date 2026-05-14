import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefCallback,
} from "react";

import { createSuperHover } from "./index.js";
import type { UseSuperHoverOptions } from "./use-super-hover-options.js";

export type { UseSuperHoverOptions };

const noop = () => {};

/**
 * Enter/leave always; move listener only when {@link UseSuperHoverOptions.onMove}
 * is passed. Omitting both `moveEventType` and `onMove` passes `moveEventType: false`
 * into `createSuperHover` so unused move work is skipped.
 * Prefers a stable `root` (e.g. from {@link useSuperHoverRef}) so the effect re-runs when the node mounts.
 */
export function useSuperHover(
  root: HTMLElement | null,
  {
    enabled = true,
    onEnter = noop,
    onLeave = noop,
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

  useEffect(() => {
    if (!enabled || !root) return;

    const handleEnter = (e: Event) => onEnterRef.current(e);
    const handleLeave = (e: Event) => onLeaveRef.current(e);
    const handleMove = (e: Event) => {
      onMoveRef.current?.(e);
    };

    const resolvedMove =
      moveEventType === false ? null : (moveEventType ?? "superhovermove");

    const listenMove =
      resolvedMove !== null && onMove !== undefined;

    root.addEventListener(enterEventType, handleEnter);
    root.addEventListener(leaveEventType, handleLeave);
    if (listenMove) {
      root.addEventListener(resolvedMove, handleMove);
    }

    const stop = createSuperHover({
      root,
      ...(selector !== undefined && { selector }),
      ...(activeAttribute !== undefined && { activeAttribute }),
      ...(pointerTypes !== undefined && { pointerTypes }),
      enterEventType,
      leaveEventType,
      ...(moveEventType !== undefined
        ? { moveEventType }
        : onMove !== undefined
          ? {}
          : { moveEventType: false }),
    });

    return () => {
      root.removeEventListener(enterEventType, handleEnter);
      root.removeEventListener(leaveEventType, handleLeave);
      if (listenMove) {
        root.removeEventListener(resolvedMove, handleMove);
      }
      stop();
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
    onMove,
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
