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
 * Mount Super Hover on a root element
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { superHover } from "super-hover/svelte";
 *
 *   const hover = (node: HTMLElement) => {
 *     const hv = superHover(node, {
 *       onEnter(e) {},
 *       onLeave(e) {},
 *     });
 *     return () => hv.destroy();
 *   };
 * </script>
 * <ul {@attach hover}>
 *   <li data-super-hover>…</li>
 * </ul>
 * ```
 */
export function superHover(
  node: HTMLElement,
  options: UseSuperHoverOptions = {},
): { destroy(): void } {
  const enabled = options.enabled ?? true;
  if (!enabled) return { destroy: () => {} };

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
    enterEventType,
    leaveEventType,
    ...(options.moveEventType !== undefined
      ? { moveEventType: options.moveEventType }
      : options.onMove !== undefined
        ? {}
        : { moveEventType: false }),
  });

  return {
    destroy() {
      node.removeEventListener(enterEventType, handleEnter);
      node.removeEventListener(leaveEventType, handleLeave);
      if (listenMove) {
        node.removeEventListener(resolvedMove, handleMove);
      }
      ctrl.destroy();
    },
  };
}
