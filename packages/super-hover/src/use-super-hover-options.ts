import type {
  SuperHoverEventDetail,
  SuperHoverMoveEventDetail,
  SuperHoverOptions,
} from "./index.js";

export type SuperHoverEnterEvent = CustomEvent<SuperHoverEventDetail>;
export type SuperHoverLeaveEvent = CustomEvent<SuperHoverEventDetail>;
export type SuperHoverMoveEvent = CustomEvent<SuperHoverMoveEventDetail>;

/** Options shared by framework helpers (`super-hover/react`, `super-hover/vue`, `super-hover/svelte`). */
export type UseSuperHoverOptions = Omit<SuperHoverOptions, "root" | "enabled"> & {
  /** When false, does not mount Super Hover on `root`. Distinct from {@link SuperHoverOptions.enabled}. Default true. */
  enabled?: boolean;
  /** Fires when enter events bubble within `root`; `event.target` is the matched active element. */
  onEnter?: (event: SuperHoverEnterEvent) => void;
  /** Fires when leave events bubble within `root`; `event.target` is the element that lost active state. */
  onLeave?: (event: SuperHoverLeaveEvent) => void;
  /**
   * Fires each hit-test tick while a matched element stays active (`event.target`).
   *
   * Helpers attach a bubbling listener only when `onMove` is passed.
   * If neither `onMove` nor `moveEventType` is set, helpers disable move emission via `moveEventType: false`.
   * If only `moveEventType` is set (custom name while skipping `onMove`), move events still dispatch for listeners you add elsewhere.
   */
  onMove?: (event: SuperHoverMoveEvent) => void;
};
