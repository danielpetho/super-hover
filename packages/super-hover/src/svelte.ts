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

const noopEnter: (event: SuperHoverEnterEvent) => void = () => {};
const noopLeave: (event: SuperHoverLeaveEvent) => void = () => {};

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
    const resolvedMove =
      options.moveEventType === false
        ? null
        : (options.moveEventType ?? "superhovermove");

    const handleEnter = (e: Event) =>
      (options.onEnter ?? noopEnter)(e as SuperHoverEnterEvent);
    const handleLeave = (e: Event) =>
      (options.onLeave ?? noopLeave)(e as SuperHoverLeaveEvent);
    const handleMove = (e: Event) =>
      options.onMove?.(e as SuperHoverMoveEvent);

    const listenMove =
      resolvedMove !== null && options.onMove !== undefined;

    node.addEventListener(enterEventType, handleEnter);
    node.addEventListener(leaveEventType, handleLeave);
    if (listenMove) {
      node.addEventListener(resolvedMove, handleMove);
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
      enterEventType,
      leaveEventType,
      ...(options.moveEventType !== undefined
        ? { moveEventType: options.moveEventType }
        : options.onMove !== undefined
          ? {}
          : { moveEventType: false }),
    });

    return () => {
      node.removeEventListener(enterEventType, handleEnter);
      node.removeEventListener(leaveEventType, handleLeave);
      if (listenMove) {
        node.removeEventListener(resolvedMove, handleMove);
      }
      ctrl.destroy();
    };
  };
}
