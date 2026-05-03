# super-hover

Hit-tested hover: tracks which marked element sits under the pointer on every frame and while scrolling (unlike plain `:hover`). Participation uses `selector` (default `[data-super-hover]`); optional `root` only scopes where hits apply—not every descendant is targeted automatically.

## Install

```bash
pnpm add super-hover
# or npm / yarn
```

## Vanilla

```ts
import { createSuperHover } from "super-hover";

const list = document.querySelector("#list") as HTMLElement | null;
const dispose = createSuperHover({ root: list ?? undefined });

// Later:
dispose();
```

Mark participating nodes with `data-super-hover` (or change `selector`). The active matched element gets `data-super-hover-active` (customizable). Optional `superhoverenter` / `superhoverleave` fire on that element (`bubbles`; names customizable).

## React

```tsx
import { useSuperHoverRef } from "super-hover/react";

export function Example() {
  const rootRef = useSuperHoverRef();

  return (
    <ul ref={rootRef}>
      <li data-super-hover>...</li>
    </ul>
  );
}
```

React is an **optional** peer dependency — tree-shake if you only use the core entry.

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
  <ul ref="rootRef">
    <li data-super-hover>...</li>
  </ul>
</template>
```

## Svelte

Use the `superHover` action on your `root` element (often the list wrapper).

```svelte
<script lang="ts">
  import { superHover } from "super-hover/svelte";
</script>

<ul use:superHover={{ onEnter(e) {}, onLeave(e) {} }}>
  <li data-super-hover>...</li>
</ul>
```

## Links

- **Repository:** [github.com/danielpetho/super-hover](https://github.com/danielpetho/super-hover)
- **Issues:** use the repo issue tracker

## License

MIT — see [LICENSE](./LICENSE).
