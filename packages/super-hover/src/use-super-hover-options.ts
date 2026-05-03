import type { SuperHoverOptions } from "./index.js";

/** Options shared by framework helpers (`super-hover/react`, `super-hover/vue`, `super-hover/svelte`). */
export type UseSuperHoverOptions = Omit<SuperHoverOptions, "root"> & {
  /** When false, stops hit-testing and removes listeners. Default true. */
  enabled?: boolean;
  /** Fires when enter events bubble within `root`; `event.target` is the matched active element. */
  onEnter?: (event: Event) => void;
  /** Fires when leave events bubble within `root`; `event.target` is the element that lost active state. */
  onLeave?: (event: Event) => void;
};
