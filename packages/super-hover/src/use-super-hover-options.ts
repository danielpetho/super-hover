import type {
  SuperHoverEventDetail,
  SuperHoverMoveEventDetail,
  SuperHoverOptions,
} from "./index.js";

export type SuperHoverEnterEvent = CustomEvent<SuperHoverEventDetail>;
export type SuperHoverLeaveEvent = CustomEvent<SuperHoverEventDetail>;
export type SuperHoverMoveEvent = CustomEvent<SuperHoverMoveEventDetail>;

/** Options shared by framework helpers (`super-hover/react`, `super-hover/vue`, `super-hover/svelte`). */
export type UseSuperHoverOptions = Omit<
  SuperHoverOptions,
  "root" | "enabled"
> & {
  /** When false, does not mount Super Hover on `root`. Distinct from {@link SuperHoverOptions.enabled}. Default true. */
  enabled?: boolean;
  /**
   * Fires when enter events bubble within `root`; `event.target` is the matched active element.
   * Passing `onEnter` enables the `"enter"` event unless `events` is set explicitly.
   */
  onEnter?: (event: SuperHoverEnterEvent) => void;
  /**
   * Fires when leave events bubble within `root`; `event.target` is the element that lost active state.
   * Passing `onLeave` enables the `"leave"` event unless `events` is set explicitly.
   */
  onLeave?: (event: SuperHoverLeaveEvent) => void;
  /**
   * Fires each hit-test tick while a matched element stays active (`event.target`).
   * Passing `onMove` enables the `"move"` event unless `events` is set explicitly.
   */
  onMove?: (event: SuperHoverMoveEvent) => void;
};
