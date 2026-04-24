# super-hover

Hit-tested hover state that updates while scrolling.

See the [repository](https://github.com/danielpetho/super-hover#readme) for docs and the full monorepo layout.

## Quick start

```bash
pnpm add super-hover
```

```js
import { createSuperHover } from "super-hover";

const stop = createSuperHover();
// stop() to tear down
```

Mark interactive elements with `data-super-hover`. The active target gets `data-super-hover-active` and fires `superhoverenter` / `superhoverleave`.

## React

`pnpm add super-hover react` (if you use the React entry, ensure `react` is a dependency).

```tsx
import { useSuperHoverRef } from "super-hover/react";

const setListRoot = useSuperHoverRef({
  enabled: isHoverEnabled,
  onEnter: (e) => {
    const t = e.target as HTMLElement;
    // e.g. t.dataset.* from rows inside the list
  },
  onLeave: (e) => { /* ... */ },
});

return (
  <div ref={setListRoot} className="overflow-auto">
    {rows.map((row) => (
      <div key={row.id} data-super-hover data-row-id={row.id} />
    ))}
  </div>
);
```

Or pass an element (or `null`) to `useSuperHover` if you already hold the node in state.

## License

MIT
