import {
  ref,
  watchEffect,
  toValue,
  type MaybeRefOrGetter,
  type Ref,
} from "vue";

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
 * Composable that returns a template ref for the list root: wires
 * `createSuperHover` plus enter/leave listeners, and move when `onMove` is passed.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useSuperHover } from "super-hover/vue";
 * const rootRef = useSuperHover({ onEnter(e) {}, onLeave(e) {}, onMove(e) {} });
 * </script>
 * <template>
 *   <ul ref="rootRef">
 *     <li data-super-hover>…</li>
 *   </ul>
 * </template>
 * ```
 */
export function useSuperHover(
  options: MaybeRefOrGetter<UseSuperHoverOptions> = {},
): Ref<HTMLElement | null> {
  const rootRef = ref<HTMLElement | null>(null);

  watchEffect((onCleanup) => {
    const opts = toValue(options);
    const enabled = opts.enabled ?? true;
    const el = rootRef.value;
    if (!el || !enabled) return;

    const enterEventType = opts.enterEventType ?? "superhoverenter";
    const leaveEventType = opts.leaveEventType ?? "superhoverleave";
    const resolvedMove =
      opts.moveEventType === false
        ? null
        : (opts.moveEventType ?? "superhovermove");

    const handleEnter = (e: Event) =>
      (opts.onEnter ?? noopEnter)(e as SuperHoverEnterEvent);
    const handleLeave = (e: Event) =>
      (opts.onLeave ?? noopLeave)(e as SuperHoverLeaveEvent);
    const handleMove = (e: Event) => opts.onMove?.(e as SuperHoverMoveEvent);

    const listenMove = resolvedMove !== null && opts.onMove !== undefined;

    el.addEventListener(enterEventType, handleEnter);
    el.addEventListener(leaveEventType, handleLeave);
    if (listenMove) {
      el.addEventListener(resolvedMove, handleMove);
    }
    const ctrl = createSuperHover({
      root: el,
      ...(opts.selector !== undefined && { selector: opts.selector }),
      ...(opts.activeAttribute !== undefined && {
        activeAttribute: opts.activeAttribute,
      }),
      ...(opts.pointerTypes !== undefined && {
        pointerTypes: opts.pointerTypes,
      }),
      ...(opts.disableWhilePointerDown !== undefined && {
        disableWhilePointerDown: opts.disableWhilePointerDown,
      }),
      ...(opts.sweptHitTest !== undefined && {
        sweptHitTest: opts.sweptHitTest,
      }),
      ...(opts.sweptHitTestMargin !== undefined && {
        sweptHitTestMargin: opts.sweptHitTestMargin,
      }),
      enterEventType,
      leaveEventType,
      ...(opts.moveEventType !== undefined
        ? { moveEventType: opts.moveEventType }
        : opts.onMove !== undefined
          ? {}
          : { moveEventType: false }),
    });

    onCleanup(() => {
      el.removeEventListener(enterEventType, handleEnter);
      el.removeEventListener(leaveEventType, handleLeave);
      if (listenMove) {
        el.removeEventListener(resolvedMove, handleMove);
      }
      ctrl.destroy();
    });
  });

  return rootRef;
}
