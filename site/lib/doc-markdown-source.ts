import path from "node:path";

/** Maps `/react.md` … URLs to files under `site/content/`. */
export const DOC_MARKDOWN_TO_CONTENT_FILE = {
  "react.md": "docs/react.mdx",
  "vue.md": "docs/vue.mdx",
  "ts.md": "docs/ts.mdx",
  "svelte.md": "docs/svelte.mdx",
  "dev.md": "dev.mdx",
} as const;

export type MarkdownDocSegment = keyof typeof DOC_MARKDOWN_TO_CONTENT_FILE;

export function isMarkdownDocSegment(doc: string): doc is MarkdownDocSegment {
  return doc in DOC_MARKDOWN_TO_CONTENT_FILE;
}

export function getDocMarkdownAbsolutePath(
  doc: MarkdownDocSegment,
  cwd: string = process.cwd(),
): string {
  const relative = DOC_MARKDOWN_TO_CONTENT_FILE[doc];
  return path.join(cwd, "content", relative);
}
