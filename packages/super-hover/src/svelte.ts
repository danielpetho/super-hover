import { createSuperHover } from "./index.js";
import type { UseSuperHoverOptions } from "./use-super-hover-options.js";

export type { UseSuperHoverOptions };

const noop = () => {};

/**
 * Svelte action: attach enter/leave on the list root (and move when `onMove` is passed).
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { superHover } from "super-hover/svelte";
 * </script>
 * <ul use:superHover={{ onEnter(e) {}, onLeave(e) {}, onMove(e) {} }} class="space-y-1">
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
    const resolvedMove =
      opts.moveEventType === false ? null : (opts.moveEventType ?? "superhovermove");

    const handleEnter = (e: Event) => (opts.onEnter ?? noop)(e);
    const handleLeave = (e: Event) => (opts.onLeave ?? noop)(e);
    const handleMove = (e: Event) => opts.onMove?.(e);

    const listenMove =
      resolvedMove !== null && opts.onMove !== undefined;

    node.addEventListener(enterEventType, handleEnter);
    node.addEventListener(leaveEventType, handleLeave);
    if (listenMove) {
      node.addEventListener(resolvedMove, handleMove);
    }
    const ctrl = createSuperHover({
      root: node,
      ...(opts.selector !== undefined && { selector: opts.selector }),
      ...(opts.activeAttribute !== undefined && { activeAttribute: opts.activeAttribute }),
      ...(opts.pointerTypes !== undefined && { pointerTypes: opts.pointerTypes }),
      enterEventType,
      leaveEventType,
      ...(opts.moveEventType !== undefined
        ? { moveEventType: opts.moveEventType }
        : opts.onMove !== undefined
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
