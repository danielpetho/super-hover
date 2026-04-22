# super-hover

Hit-tested hover state that updates while scrolling—works with vanilla JS, React, Svelte, Vue, or anything else that runs in the browser.

## Repository layout

| Path | Purpose |
|------|---------|
| [`packages/super-hover`](./packages/super-hover) | **npm package** (`super-hover`) — publish this to npm |
| [`site/`](./site) | **Docs site** (Next.js) |

## Development

```bash
pnpm install
pnpm build:lib
```

- **Library build:** `pnpm build:lib` (builds `packages/super-hover` only)
- **Site + generated embeds:** `pnpm build` (runs `site`’s `generate-sources`, then Next.js build)
- **Build everything:** `pnpm build:all`
- **Docs site:** `pnpm dev` → [http://localhost:3000](http://localhost:3000)
- **Tests:** `pnpm test`

## Publishing

From repo root after `pnpm build:lib`:

```bash
cd packages/super-hover
npm publish --access public
```

Update `repository.url` in `packages/super-hover/package.json` and replace placeholder GitHub links before publishing.

## License

MIT — see [LICENSE](./LICENSE).
