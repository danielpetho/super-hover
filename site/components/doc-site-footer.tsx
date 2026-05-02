import type { ComponentProps } from "react";
import { ExternalLinkIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { mdxAnchorClassName } from "@/lib/mdx-anchor-class";

const SITE_URL = "https://danielpetho.com";

export function DocSiteFooter({
  className,
  ...props
}: ComponentProps<"footer">) {
  return (
    <footer
      className={cn(
        "w-full text-center text-sm text-muted-foreground",
        className,
      )}
      {...props}
    >
      <p>
        Built by{" "}
        <a
          href={SITE_URL}
          target="_blank"
          rel="noreferrer"
          className={mdxAnchorClassName()}
        >
          daniel petho
          <ExternalLinkIcon
            className="ml-1 pt-px mt-px"
            size={13}
            strokeWidth={2.5}
          />
        </a>
      </p>
    </footer>
  );
}
