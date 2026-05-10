import path from "node:path";

/**
 * Authoring MDX paths (relative to `site/content/`).
 * Plain Markdown for agents is generated into `generated/agent/*.md`.
 */
const DOC_MARKDOWN_PAIR_LIST = [
  ["react.md", "docs/react.mdx"],
  ["vue.md", "docs/vue.mdx"],
  ["ts.md", "docs/ts.mdx"],
  ["svelte.md", "docs/svelte.mdx"],
  ["dev.md", "dev.mdx"],
] as const;

export type MarkdownDocSegment =
  (typeof DOC_MARKDOWN_PAIR_LIST)[number][0];

export const DOC_MARKDOWN_SOURCE_MDX = Object.fromEntries(
  DOC_MARKDOWN_PAIR_LIST,
) as Record<MarkdownDocSegment, string>;

/** Maps `/react.md` … URLs to generated Markdown under `site/content/`. */
export const DOC_MARKDOWN_TO_CONTENT_FILE = Object.fromEntries(
  DOC_MARKDOWN_PAIR_LIST.map(([segment]) => [
    segment,
    `generated/agent/${segment}`,
  ]),
) as Record<MarkdownDocSegment, string>;

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
