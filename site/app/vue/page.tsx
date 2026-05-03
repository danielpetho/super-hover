import VueDocs from "@/content/docs/vue.mdx";
import { DocsLayout } from "@/components/docs-layout";

export default function VueDocsPage() {
  return (
    <DocsLayout framework="vue">
      <VueDocs />
    </DocsLayout>
  );
}
