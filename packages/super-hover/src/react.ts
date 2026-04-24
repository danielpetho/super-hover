import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefCallback,
} from "react";

import { createSuperHover, type SuperHoverOptions } from "./index.js";

export type UseSuperHoverOptions = Omit<SuperHoverOptions, "root"> & {
  /** When false, stops hit-testing and removes listeners. Default true. */
  enabled?: boolean;
  /** Bubbles from the element that received `data-super-hover-active` (the super-hover target). */
  onEnter?: (event: Event) => void;
  /** Bubbles from the element that just lost the active state. */
  onLeave?: (event: Event) => void;
};

const noop = () => {};

/**
 * Attaches `superhoverenter` / `superhoverleave` listeners on `root` and runs `createSuperHover({ root, ... })`.
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

    root.addEventListener("superhoverenter", handleEnter);
    root.addEventListener("superhoverleave", handleLeave);
    const stop = createSuperHover({
      root,
      ...(selector !== undefined && { selector }),
      ...(activeAttribute !== undefined && { activeAttribute }),
    });

    return () => {
      root.removeEventListener("superhoverenter", handleEnter);
      root.removeEventListener("superhoverleave", handleLeave);
      stop();
    };
  }, [root, enabled, selector, activeAttribute]);
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
