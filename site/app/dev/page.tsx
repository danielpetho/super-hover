import Dev from "@/content/dev.mdx";
import { DocToc } from "@/components/doc-toc";

export default function DevPage() {
  return (
    <div className="relative w-full">
      <DocToc backHref="/" backLabel="Back to docs" />
      <article
        data-doc-content
        className="mx-auto w-full max-w-[700px] space-y-6 px-4 py-32"
      >
        <Dev />
      </article>
    </div>
  );
}

