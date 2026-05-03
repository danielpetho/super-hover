import SvelteDocs from "@/content/docs/svelte.mdx";
import { DocsLayout } from "@/components/docs-layout";

export default function SvelteDocsPage() {
  return (
    <DocsLayout framework="svelte">
      <SvelteDocs />
    </DocsLayout>
  );
}
