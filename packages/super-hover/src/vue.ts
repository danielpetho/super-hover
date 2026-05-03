import { ref, watchEffect, toValue, type MaybeRefOrGetter, type Ref } from "vue";

import { createSuperHover } from "./index.js";
import type { UseSuperHoverOptions } from "./use-super-hover-options.js";

export type { UseSuperHoverOptions };

const noop = () => {};

/**
 * Composable that returns a template ref for the list root: wires
 * `createSuperHover` plus `superhoverenter` / `superhoverleave` listeners.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useSuperHover } from "super-hover/vue";
 * const rootRef = useSuperHover({ onEnter(e) {}, onLeave(e) {} });
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

    const handleEnter = (e: Event) => (opts.onEnter ?? noop)(e);
    const handleLeave = (e: Event) => (opts.onLeave ?? noop)(e);

    el.addEventListener(enterEventType, handleEnter);
    el.addEventListener(leaveEventType, handleLeave);
    const stop = createSuperHover({
      root: el,
      ...(opts.selector !== undefined && { selector: opts.selector }),
      ...(opts.activeAttribute !== undefined && { activeAttribute: opts.activeAttribute }),
      enterEventType,
      leaveEventType,
    });

    onCleanup(() => {
      el.removeEventListener(enterEventType, handleEnter);
      el.removeEventListener(leaveEventType, handleLeave);
      stop();
    });
  });

  return rootRef;
}
