# super-hover

A super tiny library that hit-tests hover every frame. Unlike native `:hover`, it keeps tracking whatever sits under your pointer while you scroll or when things move on screen.

This repo is a **pnpm monorepo**:

| Package / app | Role |
|----------------|------|
| **`packages/super-hover`** | Published npm package (`super-hover`). |
| **`site`** | Next.js docs and demos (MDX aligned with the package README). |

Full API, examples, and option tables: **[`packages/super-hover/README.md`](./packages/super-hover/README.md)**.

## Developing

```bash
pnpm install
pnpm run dev       # docs site
pnpm run build:lib # library build only
pnpm run build     # production docs build (runs lib generate-sources + Next build)
```

## License

MIT — see [LICENSE](./LICENSE).
