import type { Metadata } from "next";

import Dev from "@/content/dev.mdx";
import { DocScrollTargetFlash } from "@/components/doc-scroll-target-flash";
import { DocToc } from "@/components/doc-toc";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function DevPage() {
  return (
    <div className="relative w-full">
      <DocScrollTargetFlash />
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

