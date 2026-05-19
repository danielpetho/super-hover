import type { ComponentProps } from "react";
import { ExternalLinkIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { mdxAnchorClassName } from "@/lib/mdx-anchor-class";

const SITE_URL = "https://danielpetho.com";
const GITHUB_REPO_URL = "https://github.com/danielpetho/super-hover";

export function DocSiteFooter({
  className,
  ...props
}: ComponentProps<"footer">) {
  return (
    <footer
      className={cn(
        "flex w-full flex-col items-center gap-2 text-center text-sm text-muted-foreground",
        className,
      )}
      {...props}
    >
  
      <div className="flex items-center gap-3">
      <p>
        <a
          href={`${SITE_URL}/llms.txt`}
          target="_blank"
          rel="noreferrer"
          className={mdxAnchorClassName()}
        >
          llms.txt
        </a>
      </p>
      <p>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noreferrer"
          className={mdxAnchorClassName()}
        >
          GitHub
          <ExternalLinkIcon
            className="ml-1 mt-[1px]"
            size={13}
            strokeWidth={2.5}
          />
        </a>
      </p>
      </div>
      <p>
        Built by{" "}
        <a
          href={SITE_URL}
          target="_blank"
          rel="noreferrer"
          className={mdxAnchorClassName()}
        >
          Daniel Petho
          <ExternalLinkIcon
            className="ml-1 mt-[1px]"
            size={13}
            strokeWidth={2.5}
          />
        </a>
      </p>
    </footer>
  );
}
