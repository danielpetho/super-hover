import type { ReactNode } from "react";

import type { DocFrameworkId } from "@/lib/doc-framework";
import { DocToc } from "@/components/doc-toc";
import { DocFrameworkSelector } from "@/components/doc-framework-selector";

export function DocsLayout({
  framework,
  children,
}: {
  framework: DocFrameworkId;
  children: ReactNode;
}) {
  return (
    <div className="relative w-full">
      <DocToc />
      <article
        data-doc-content
        className="mx-auto w-full max-w-[640px] space-y-6 px-4 py-32"
      >
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-12">
          <h1
            id="super-hover"
            className="min-w-0 text-[44px] font-satoshi font-medium tracking-tighter text-pretty leading-tight text-foreground"
          >
            super-hover
          </h1>
          <div className="mt-3">
          <DocFrameworkSelector value={framework} />
          </div>
        </header>
        {children}
      </article>
    </div>
  );
}
