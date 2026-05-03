import Docs from "@/content/docs.mdx";
import { DocToc } from "@/components/doc-toc";

export default function Home() {
  return (
    <div className="relative w-full">
      <DocToc />
      <article
        data-doc-content
        className="mx-auto w-full max-w-[640px] space-y-6 px-4 py-32"
      >
        <Docs />
      </article>
    </div>
  );
}
