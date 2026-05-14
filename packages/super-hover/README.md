# super-hover

A super tiny library that hit-tests hover every frame. Unlike native `:hover`, it keeps tracking whatever sits under your pointer while you scroll or when things move on screen.

## Why use this?

Well, you probably don't need this. While scrolling, browsers mostly skip updating `:hover` for performance reasons, which most sites actually need. But super-hover recomputes a hover-like hit every frame, which opens up some fun creative effects!

Under the hood it listens for pointer moves, scroll, and resize, then hit-tests **once per animation frame** (updates are **coalesced** with `requestAnimationFrame`): [`document.elementFromPoint`](https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint) plus [`Element.closest(selector)`](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest).

## Install

```bash
pnpm add super-hover
# or npm / yarn
```

The **`super-hover`** entry is framework-free. **`super-hover/react`**, **`super-hover/vue`**, and **`super-hover/svelte`** add small helpers. React and Vue are **optional** peer dependencies.

## Usage

- Mark participating nodes with **`data-super-hover`** (or pass a custom `selector`).
- The active matched element gets **`data-super-hover-active`** (customizable). Style it with attribute selectors, e.g. Tailwind `data-[super-hover-active]:…`.
- **`pause()`** / **`resume()`**: pause clears active state and skips hit-tests until resume, but **pointer position still updates** while paused, so **`resume()`** immediately matches whatever is under the cursor (no extra move required).

```ts
import { createSuperHover } from "super-hover";

const list = document.querySelector("#list") as HTMLElement | null;
const ctrl = createSuperHover({ root: list ?? undefined });

// Later:
ctrl.destroy();
```

#### Options (`SuperHoverOptions`)

| Option | Default | Purpose |
|--------|---------|---------|
| `enabled` | `true` | When `false`, starts paused (same as `.pause()` until `.resume()`). |
| `root` | omit (whole document) | Hit-tested nodes must be **inside** this subtree. Does **not** opt in every descendant—that’s still gated by `selector`. |
| `selector` | `[data-super-hover]` | Passed to `closest()` from the node under the pointer. |
| `activeAttribute` | `data-super-hover-active` | Set on the active element while active (empty string), removed when inactive. |
| `enterEventType` | `superhoverenter` | `CustomEvent` when an element becomes active (`bubbles: true`). |
| `leaveEventType` | `superhoverleave` | `CustomEvent` when it stops being active. |

## Links

- **Repository:** [github.com/danielpetho/super-hover](https://github.com/danielpetho/super-hover)
- **Issues:** [github.com/danielpetho/super-hover/issues](https://github.com/danielpetho/super-hover/issues)

## License

MIT — see [LICENSE](./LICENSE).
