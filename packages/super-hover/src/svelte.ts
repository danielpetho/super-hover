import { createSuperHover } from "./index.js";
import type { UseSuperHoverOptions } from "./use-super-hover-options.js";

export type { UseSuperHoverOptions };

const noop = () => {};

/**
 * Svelte action: attach to the list root element.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { superHover } from "super-hover/svelte";
 * </script>
 * <ul use:superHover={{ onEnter(e) {}, onLeave(e) {} }} class="space-y-1">
 *   <li data-super-hover>…</li>
 * </ul>
 * ```
 */
export function superHover(
  node: HTMLElement,
  options: UseSuperHoverOptions = {},
): {
  update(next: UseSuperHoverOptions): void;
  destroy(): void;
} {
  let cleanup: () => void = () => {};

  function mount(opts: UseSuperHoverOptions): () => void {
    const enabled = opts.enabled ?? true;
    if (!enabled) return () => {};

    const enterEventType = opts.enterEventType ?? "superhoverenter";
    const leaveEventType = opts.leaveEventType ?? "superhoverleave";

    const handleEnter = (e: Event) => (opts.onEnter ?? noop)(e);
    const handleLeave = (e: Event) => (opts.onLeave ?? noop)(e);

    node.addEventListener(enterEventType, handleEnter);
    node.addEventListener(leaveEventType, handleLeave);
    const stop = createSuperHover({
      root: node,
      ...(opts.selector !== undefined && { selector: opts.selector }),
      ...(opts.activeAttribute !== undefined && { activeAttribute: opts.activeAttribute }),
      enterEventType,
      leaveEventType,
    });

    return () => {
      node.removeEventListener(enterEventType, handleEnter);
      node.removeEventListener(leaveEventType, handleLeave);
      stop();
    };
  }

  cleanup = mount(options);

  return {
    update(next: UseSuperHoverOptions) {
      cleanup();
      cleanup = mount(next);
    },
    destroy() {
      cleanup();
      cleanup = () => {};
    },
  };
}
