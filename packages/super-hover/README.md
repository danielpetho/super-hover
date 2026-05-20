# super-hover

A super tiny library that hit-tests hover every frame. Unlike native `:hover`, it keeps tracking whatever sits under your pointer while you scroll or when things move on screen.

## Why use this?

Well, you probably shouldn't. While scrolling, browsers mostly skip updating `:hover` to prioritize other important rendering work, which in most cases is the desired behavior. But Super Hover recomputes a hover-like hit every frame, which opens up the possibility of some fun creative effects and interactions.

## Install

```bash
pnpm add super-hover
# or npm / yarn
```

The **`super-hover`** entry is framework-free. **`super-hover/react`**, **`super-hover/vue`**, and **`super-hover/svelte`** add small helpers. React and Vue are **optional** peer dependencies.

## Usage

Wrap the area you care about, then mark the things that should act hoverable.

The active element gets `data-super-hover-active`, which is usually enough if you only want styling.

```ts
import { createSuperHover } from "super-hover";

const root = document.querySelector<HTMLElement>("#list")!;

const superHover = createSuperHover({ root });

// later
superHover.destroy();
```

```html
<ul id="list">
  <li data-super-hover>Inbox</li>
  <li data-super-hover>Projects</li>
  <li data-super-hover>Settings</li>
</ul>
```

## Events

If styling is not enough, you can run code when the active element changes. Super Hover dispatches three custom events:

- `superhoverenter` when an element becomes active
- `superhoverleave` when an element stops being active
- `superhovermove` while an element is active

```ts
import {
  createSuperHover,
  type SuperHoverEventDetail,
} from "super-hover";

const root = document.querySelector<HTMLElement>("#list")!;

root.addEventListener("superhoverenter", (event) => {
  const e = event as CustomEvent<SuperHoverEventDetail>;
  console.log("entered", e.detail.current);
});

const superHover = createSuperHover({ root });
```

`superhovermove` is on by default in the core library. If you do not need move events, pass `moveEventType: false`.

## Framework helpers

React:

```tsx
import { useSuperHoverRef } from "super-hover/react";

export function Example() {
  const rootRef = useSuperHoverRef({
    onEnter(event) {
      console.log(event.detail.current);
    },
  });

  return <ul ref={rootRef}>{/* data-super-hover items */}</ul>;
}
```

Vue:

```vue
<script setup lang="ts">
  import { useSuperHover } from "super-hover/vue";

  const rootRef = useSuperHover({
    onEnter(event) {
      console.log(event.detail.current);
    },
  });
</script>

<template>
  <ul ref="rootRef"><!-- data-super-hover items --></ul>
</template>
```

Svelte:

```svelte
<script lang="ts">
  import { superHover } from "super-hover/svelte";
</script>

<ul use:superHover={{ onEnter: (event) => console.log(event.detail.current) }}>
  <!-- data-super-hover items -->
</ul>
```

Framework helpers only listen for move events when `onMove` is passed. If neither `onMove` nor `moveEventType` is passed, they disable move events for you.

## How it works

The library is very simple and short, so please read the [source code](https://github.com/danielpetho/super-hover/blob/main/packages/super-hover/src/index.ts) for the full details.

In short, Super Hover keeps track of the last pointer and when the pointer moves, the page scrolls, or the viewport changes, it schedules a hit-test with `requestAnimationFrame`. Multiple updates in the same frame are coalesced, so they only produce one hit-test.

On that frame, Super Hover calls `elementFromPoint(x, y)`, finds the closest element matching `[data-super-hover]`, and updates the active element.

If the active element changes, Super Hover removes `data-super-hover-active` from the old element, adds it to the new one, and dispatches the custom events.

## API

### `SuperHoverOptions`

| Option | Default | Purpose |
| --- | --- | --- |
| `enabled` | `true` | When `false`, starts paused and waits for `resume()`. |
| `pointerTypes` | `["mouse", "pen"]` | Pointer types allowed to update the tracked pointer position. Touch is off by default so finger scrolling does not create hover state. |
| `root` | omit, whole document | Optional boundary: the matched element must be inside this subtree. Can be a `Document` or `Element`, including same-origin iframe documents/elements. |
| `selector` | `[data-super-hover]` | CSS selector passed to `element.closest` from the hit-tested node. Independent of `root`. |
| `activeAttribute` | `data-super-hover-active` | Attribute toggled on the active matched element while active. |
| `enterEventType` | `superhoverenter` | `CustomEvent` type dispatched on the matched element when it becomes active. |
| `leaveEventType` | `superhoverleave` | `CustomEvent` type dispatched on the matched element when it stops being active. |
| `moveEventType` | `superhovermove` | `CustomEvent` type dispatched on each scheduled hit-test while an element is active. Set to `false` to disable. |

### `SuperHoverController`

| Method | Purpose |
| --- | --- |
| `pause()` | Pauses hit-testing and clears the active element. |
| `resume()` | Resumes hit-testing and schedules a fresh hit-test. |
| `refresh()` | Schedules a fresh hit-test without changing the paused or destroyed state. |
| `destroy()` | Removes listeners, cancels pending animation frames, and clears the active element. |

### Event detail

For `superhoverenter` and `superhoverleave`, `event.detail` has:

- `x` and `y`: the last pointer position, in viewport coordinates
- `previous`: the element that was active before this change, or `null`
- `current`: the element that is active after this change, or `null`

For `superhovermove`, `event.detail` has:

- `x` and `y`: the last pointer position, in viewport coordinates
- `current`: the currently active element

## Links

- **Docs:** [superhover.danielpetho.com](https://superhover.danielpetho.com)
- **Repository:** [github.com/danielpetho/super-hover](https://github.com/danielpetho/super-hover)
- **Issues:** [github.com/danielpetho/super-hover/issues](https://github.com/danielpetho/super-hover/issues)

## License

MIT — see [LICENSE](./LICENSE).
