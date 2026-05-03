import TsDocs from "@/content/docs/ts.mdx";
import { DocsLayout } from "@/components/docs-layout";

export default function TsDocsPage() {
  return (
    <DocsLayout framework="ts">
      <TsDocs />
    </DocsLayout>
  );
}
