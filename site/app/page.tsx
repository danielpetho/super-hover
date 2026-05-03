import ReactDocs from "@/content/docs/react.mdx";
import { DocsLayout } from "@/components/docs-layout";

export default function Home() {
  return (
    <DocsLayout framework="react">
      <ReactDocs />
    </DocsLayout>
  );
}
