import type { SuperHoverOptions } from "./index.js";

/** Options shared by framework helpers (`super-hover/react`, `super-hover/vue`, `super-hover/svelte`). */
export type UseSuperHoverOptions = Omit<SuperHoverOptions, "root"> & {
  /** When false, stops hit-testing and removes listeners. Default true. */
  enabled?: boolean;
  /** Bubbles from the element that received `data-super-hover-active` (the super-hover target). */
  onEnter?: (event: Event) => void;
  /** Bubbles from the element that just lost the active state. */
  onLeave?: (event: Event) => void;
};
