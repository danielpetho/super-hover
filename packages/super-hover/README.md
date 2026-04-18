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

## License

MIT
