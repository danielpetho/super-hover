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
    const moveEventType = opts.moveEventType ?? "superhovermove";
    const enabledEvents = new Set(
      opts.events === true
        ? ["enter", "leave"]
        : Array.isArray(opts.events)
          ? opts.events
          : opts.events === undefined
            ? [
                ...(opts.onEnter !== undefined ? ["enter" as const] : []),
                ...(opts.onLeave !== undefined ? ["leave" as const] : []),
                ...(opts.onMove !== undefined ? ["move" as const] : []),
              ]
            : [],
    );

    const handleEnter = (e: Event) => opts.onEnter?.(e as SuperHoverEnterEvent);
    const handleLeave = (e: Event) => opts.onLeave?.(e as SuperHoverLeaveEvent);
    const handleMove = (e: Event) => opts.onMove?.(e as SuperHoverMoveEvent);

    const listenEnter =
      enabledEvents.has("enter") && opts.onEnter !== undefined;
    const listenLeave =
      enabledEvents.has("leave") && opts.onLeave !== undefined;
    const listenMove = enabledEvents.has("move") && opts.onMove !== undefined;

    if (listenEnter) {
      el.addEventListener(enterEventType, handleEnter);
    }
    if (listenLeave) {
      el.addEventListener(leaveEventType, handleLeave);
    }
    if (listenMove) {
      el.addEventListener(moveEventType, handleMove);
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
      events: opts.events ?? [
        ...(opts.onEnter !== undefined ? ["enter" as const] : []),
        ...(opts.onLeave !== undefined ? ["leave" as const] : []),
        ...(opts.onMove !== undefined ? ["move" as const] : []),
      ],
      enterEventType,
      leaveEventType,
      moveEventType,
    });

    onCleanup(() => {
      if (listenEnter) {
        el.removeEventListener(enterEventType, handleEnter);
      }
      if (listenLeave) {
        el.removeEventListener(leaveEventType, handleLeave);
      }
      if (listenMove) {
        el.removeEventListener(moveEventType, handleMove);
      }
      ctrl.destroy();
    });
  });

  return rootRef;
}
