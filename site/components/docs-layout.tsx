import type { ReactNode } from "react";

import type { DocFrameworkId } from "@/lib/doc-framework";
import { SCROLL_TARGET_FLASH_INNER_CLASS } from "@/lib/flash-scroll-target";
import { DocScrollTargetFlash } from "@/components/doc-scroll-target-flash";
import { DocToc } from "@/components/doc-toc";
import { DocFrameworkSelector } from "@/components/doc-framework-selector";
import { cn } from "@/lib/utils";

export function DocsLayout({
  framework,
  children,
}: {
  framework: DocFrameworkId;
  children: ReactNode;
}) {
  return (
    <div className="relative w-full">
      <DocScrollTargetFlash />
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
            <span className={cn(SCROLL_TARGET_FLASH_INNER_CLASS, "inline")}>
              Super Hover
            </span>
          </h1>
          <div className="mt-3 shrink-0">
            <DocFrameworkSelector value={framework} />
          </div>
        </header>
        {children}
      </article>
    </div>
  );
}
