import { NextResponse } from "next/server";

import { getSiteBaseUrl } from "@/lib/site-url";

export async function GET() {
  const base = getSiteBaseUrl();

  const body = `# Super Hover

> A super tiny library that hit-tests hover every frame. Unlike native \`:hover\`, it keeps tracking whatever sits under your pointer while you scroll or when things move on screen.

## Documentation (Markdown)
Prefer these for agents and tools that want source-style docs (MDX source).

- [React](${base}/react.md)
- [Vue](${base}/vue.md)
- [TypeScript](${base}/ts.md)
- [Svelte](${base}/svelte.md)
- [Dev sandboxes](${base}/dev.md)

## Documentation (HTML)
- [React](${base}/)
- [Vue](${base}/vue)
- [TypeScript](${base}/ts)
- [Svelte](${base}/svelte)
- [Dev sandboxes](${base}/dev)

## Package & source
- [npm: super-hover](https://www.npmjs.com/package/super-hover)
- [GitHub repository](https://github.com/danielpetho/super-hover)

## Sitemap
- [Sitemap](${base}/sitemap.xml)
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
