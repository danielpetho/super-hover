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
 * Attaches enter/leave listeners (default `superhoverenter` / `superhoverleave`) on `root` and runs `createSuperHover({ root, ... })`.
 * Prefers a stable `root` (e.g. from {@link useSuperHoverRef}) so the effect re-runs when the node mounts.
 */
export function useSuperHover(
  root: HTMLElement | null,
  {
    enabled = true,
    onEnter = noop,
    onLeave = noop,
    selector,
    activeAttribute,
    enterEventType = "superhoverenter",
    leaveEventType = "superhoverleave",
  }: UseSuperHoverOptions = {},
): void {
  const onEnterRef = useRef(onEnter);
  const onLeaveRef = useRef(onLeave);
  onEnterRef.current = onEnter;
  onLeaveRef.current = onLeave;

  useEffect(() => {
    if (!enabled || !root) return;

    const handleEnter = (e: Event) => onEnterRef.current(e);
    const handleLeave = (e: Event) => onLeaveRef.current(e);

    root.addEventListener(enterEventType, handleEnter);
    root.addEventListener(leaveEventType, handleLeave);
    const stop = createSuperHover({
      root,
      ...(selector !== undefined && { selector }),
      ...(activeAttribute !== undefined && { activeAttribute }),
      enterEventType,
      leaveEventType,
    });

    return () => {
      root.removeEventListener(enterEventType, handleEnter);
      root.removeEventListener(leaveEventType, handleLeave);
      stop();
    };
  }, [root, enabled, selector, activeAttribute, enterEventType, leaveEventType]);
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
