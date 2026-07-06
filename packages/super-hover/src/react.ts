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

/**
 * Event listeners are attached only when the matching callback is passed.
 * Omitting callbacks keeps Super Hover in attribute-only mode unless `events` is passed.
 * Callbacks are read from refs each event; **`onMove` identity does not rerun the effect—only whether it is passed**
 * (`onMove !== undefined`) does (so inline `onMove` handlers avoid remounting Super Hover).
 * Prefers a stable `root` (e.g. from {@link useSuperHoverRef}) so the effect re-runs when the node mounts.
 */
export function useSuperHover(
  root: HTMLElement | null,
  {
    enabled = true,
    onEnter,
    onLeave,
    onMove,
    selector,
    activeAttribute,
    pointerTypes,
    disableWhilePointerDown,
    events,
    enterEventType = "superhoverenter",
    leaveEventType = "superhoverleave",
    moveEventType = "superhovermove",
    sweptHitTest,
    sweptHitTestMargin,
  }: UseSuperHoverOptions = {},
): void {
  const onEnterRef = useRef(onEnter);
  const onLeaveRef = useRef(onLeave);
  const onMoveRef = useRef(onMove);
  onEnterRef.current = onEnter;
  onLeaveRef.current = onLeave;
  onMoveRef.current = onMove;

  const hasOnEnter = onEnter !== undefined;
  const hasOnLeave = onLeave !== undefined;
  const hasOnMove = onMove !== undefined;

  useEffect(() => {
    if (!enabled || !root) return;

    const handleEnter = (e: Event) =>
      onEnterRef.current?.(e as SuperHoverEnterEvent);
    const handleLeave = (e: Event) =>
      onLeaveRef.current?.(e as SuperHoverLeaveEvent);
    const handleMove = (e: Event) => {
      onMoveRef.current?.(e as SuperHoverMoveEvent);
    };

    const enabledEvents = new Set(
      events === true
        ? ["enter", "leave"]
        : Array.isArray(events)
          ? events
          : events === undefined
            ? [
                ...(hasOnEnter ? ["enter" as const] : []),
                ...(hasOnLeave ? ["leave" as const] : []),
                ...(hasOnMove ? ["move" as const] : []),
              ]
            : [],
    );

    const listenEnter = enabledEvents.has("enter") && hasOnEnter;
    const listenLeave = enabledEvents.has("leave") && hasOnLeave;
    const listenMove = enabledEvents.has("move") && hasOnMove;

    if (listenEnter) {
      root.addEventListener(enterEventType, handleEnter);
    }
    if (listenLeave) {
      root.addEventListener(leaveEventType, handleLeave);
    }
    if (listenMove) {
      root.addEventListener(moveEventType, handleMove);
    }

    const ctrl = createSuperHover({
      root,
      ...(selector !== undefined && { selector }),
      ...(activeAttribute !== undefined && { activeAttribute }),
      ...(pointerTypes !== undefined && { pointerTypes }),
      ...(disableWhilePointerDown !== undefined && { disableWhilePointerDown }),
      ...(sweptHitTest !== undefined && { sweptHitTest }),
      ...(sweptHitTestMargin !== undefined && { sweptHitTestMargin }),
      events: events ?? [
        ...(hasOnEnter ? ["enter" as const] : []),
        ...(hasOnLeave ? ["leave" as const] : []),
        ...(hasOnMove ? ["move" as const] : []),
      ],
      enterEventType,
      leaveEventType,
      moveEventType,
    });

    return () => {
      if (listenEnter) {
        root.removeEventListener(enterEventType, handleEnter);
      }
      if (listenLeave) {
        root.removeEventListener(leaveEventType, handleLeave);
      }
      if (listenMove) {
        root.removeEventListener(moveEventType, handleMove);
      }
      ctrl.destroy();
    };
  }, [
    root,
    enabled,
    selector,
    activeAttribute,
    pointerTypes,
    disableWhilePointerDown,
    events,
    enterEventType,
    leaveEventType,
    moveEventType,
    hasOnEnter,
    hasOnLeave,
    hasOnMove,
    sweptHitTest,
    sweptHitTestMargin,
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
