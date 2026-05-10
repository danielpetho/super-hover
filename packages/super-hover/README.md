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

## Markup & styling

- Mark participating nodes with **`data-super-hover`** (or pass a custom `selector`).
- The active matched element gets **`data-super-hover-active`** (customizable). Style it with attribute selectors, e.g. Tailwind `data-[super-hover-active]:…`.

## Vanilla (`createSuperHover`)

```ts
import { createSuperHover } from "super-hover";

const list = document.querySelector("#list") as HTMLElement | null;
const dispose = createSuperHover({ root: list ?? undefined });

// Later:
dispose();
```

### Options (`SuperHoverOptions`)

| Option | Default | Purpose |
|--------|---------|---------|
| `root` | omit (whole document) | Hit-tested nodes must be **inside** this subtree. Does **not** opt in every descendant—that’s still gated by `selector`. |
| `selector` | `[data-super-hover]` | Passed to `closest()` from the node under the pointer. |
| `activeAttribute` | `data-super-hover-active` | Set on the active element while active (empty string), removed when inactive. |
| `enterEventType` | `superhoverenter` | `CustomEvent` when an element becomes active (`bubbles: true`). |
| `leaveEventType` | `superhoverleave` | `CustomEvent` when it stops being active. |

## React

[`useSuperHoverRef`](https://react.dev/reference/react-dom/components/common#ref-callback) wires **`createSuperHover`** when the root mounts.

```tsx
import { useSuperHoverRef } from "super-hover/react";

export function Example() {
  const rootRef = useSuperHoverRef();

  return (
    <ul ref={rootRef} className="space-y-1">
      <li data-super-hover className="rounded px-3 py-2 transition-colors data-[super-hover-active]:bg-neutral-100 dark:data-[super-hover-active]:bg-neutral-900">
        …
      </li>
    </ul>
  );
}
```

Use **`useSuperHover(root, options)`** if you already hold an `HTMLElement | null`. **`UseSuperHoverOptions`** adds **`enabled`**, **`onEnter`**, **`onLeave`**, plus the vanilla options except `root`.

## Vue

```vue
<script setup lang="ts">
import { useSuperHover } from "super-hover/vue";

const rootRef = useSuperHover({
  onEnter(e) {},
  onLeave(e) {},
});
</script>

<template>
  <ul ref="rootRef" class="space-y-1">
    <li data-super-hover class="rounded px-3 py-2 transition-colors data-[super-hover-active]:bg-neutral-100 dark:data-[super-hover-active]:bg-neutral-900">
      …
    </li>
  </ul>
</template>
```

## Svelte

Attach the **`superHover`** action to the list root:

```svelte
<script lang="ts">
  import { superHover } from "super-hover/svelte";
</script>

<ul class="space-y-1" use:superHover={{ onEnter(e) {}, onLeave(e) {} }}>
  <li data-super-hover class="rounded px-3 py-2 transition-colors data-[super-hover-active]:bg-neutral-100 dark:data-[super-hover-active]:bg-neutral-900">
    …
  </li>
</ul>
```

## Events

Framework helpers listen on **`root`** for bubbling **`superhoverenter`** / **`superhoverleave`** (names configurable). **`onEnter`** / **`onLeave`** receive the DOM event; **`event.target`** is the matched row.

With vanilla **`createSuperHover`**, add **`addEventListener`** on `document` or your subtree root for those events.

## Links

- **Repository:** [github.com/danielpetho/super-hover](https://github.com/danielpetho/super-hover)
- **Issues:** [github.com/danielpetho/super-hover/issues](https://github.com/danielpetho/super-hover/issues)

## License

MIT — see [LICENSE](./LICENSE).
