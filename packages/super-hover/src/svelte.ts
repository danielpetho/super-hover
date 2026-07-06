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

/** Attachment returned by {@link superHover}. */
export type SuperHoverAttachment = (node: HTMLElement) => () => void;

/**
 * Attachment factory for Svelte 5 `{@attach}`. Pass the result directly to
 * `{@attach superHover(options)}`, cleanup runs automatically when the element
 * is removed or when reactive options change.
 * https://svelte.dev/docs/svelte/@attach
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { superHover } from "super-hover/svelte";
 * </script>
 * <ul {@attach superHover({ onEnter(e) {}, onLeave(e) {} })}>
 *   <li data-super-hover>…</li>
 * </ul>
 * ```
 */
export function superHover(
  options: UseSuperHoverOptions = {},
): SuperHoverAttachment {
  return (node) => {
    const enabled = options.enabled ?? true;
    if (!enabled) return () => {};

    const enterEventType = options.enterEventType ?? "superhoverenter";
    const leaveEventType = options.leaveEventType ?? "superhoverleave";
    const moveEventType = options.moveEventType ?? "superhovermove";
    const enabledEvents = new Set(
      options.events === true
        ? ["enter", "leave"]
        : Array.isArray(options.events)
          ? options.events
          : options.events === undefined
            ? [
                ...(options.onEnter !== undefined ? ["enter" as const] : []),
                ...(options.onLeave !== undefined ? ["leave" as const] : []),
                ...(options.onMove !== undefined ? ["move" as const] : []),
              ]
            : [],
    );

    const handleEnter = (e: Event) =>
      options.onEnter?.(e as SuperHoverEnterEvent);
    const handleLeave = (e: Event) =>
      options.onLeave?.(e as SuperHoverLeaveEvent);
    const handleMove = (e: Event) => options.onMove?.(e as SuperHoverMoveEvent);

    const listenEnter =
      enabledEvents.has("enter") && options.onEnter !== undefined;
    const listenLeave =
      enabledEvents.has("leave") && options.onLeave !== undefined;
    const listenMove =
      enabledEvents.has("move") && options.onMove !== undefined;

    if (listenEnter) {
      node.addEventListener(enterEventType, handleEnter);
    }
    if (listenLeave) {
      node.addEventListener(leaveEventType, handleLeave);
    }
    if (listenMove) {
      node.addEventListener(moveEventType, handleMove);
    }
    const ctrl = createSuperHover({
      root: node,
      ...(options.selector !== undefined && { selector: options.selector }),
      ...(options.activeAttribute !== undefined && {
        activeAttribute: options.activeAttribute,
      }),
      ...(options.pointerTypes !== undefined && {
        pointerTypes: options.pointerTypes,
      }),
      ...(options.disableWhilePointerDown !== undefined && {
        disableWhilePointerDown: options.disableWhilePointerDown,
      }),
      ...(options.sweptHitTest !== undefined && {
        sweptHitTest: options.sweptHitTest,
      }),
      ...(options.sweptHitTestMargin !== undefined && {
        sweptHitTestMargin: options.sweptHitTestMargin,
      }),
      events: options.events ?? [
        ...(options.onEnter !== undefined ? ["enter" as const] : []),
        ...(options.onLeave !== undefined ? ["leave" as const] : []),
        ...(options.onMove !== undefined ? ["move" as const] : []),
      ],
      enterEventType,
      leaveEventType,
      moveEventType,
    });

    return () => {
      if (listenEnter) {
        node.removeEventListener(enterEventType, handleEnter);
      }
      if (listenLeave) {
        node.removeEventListener(leaveEventType, handleLeave);
      }
      if (listenMove) {
        node.removeEventListener(moveEventType, handleMove);
      }
      ctrl.destroy();
    };
  };
}
