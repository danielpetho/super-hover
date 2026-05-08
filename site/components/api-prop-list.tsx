"use client";

import { createContext, useContext, type ReactNode } from "react";
import { SCROLL_TARGET_FLASH_INNER_CLASS } from "@/lib/flash-scroll-target";
import { cn } from "@/lib/utils";

function slugFromName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const AnchorPrefixContext = createContext("");

export function ApiPropList({
  className,
  "aria-label": ariaLabel = "Props",
  anchorPrefix = "",
  children,
}: {
  className?: string;
  "aria-label"?: string;
  /** Keeps `id` stable and unique when the same option names appear in multiple lists on one page. */
  anchorPrefix?: string;
  children: ReactNode;
}) {
  return (
    <AnchorPrefixContext.Provider value={anchorPrefix}>
      <div
        role="list"
        aria-label={ariaLabel}
        className={cn("flex flex-col gap-10", className)}
      >
        {children}
      </div>
    </AnchorPrefixContext.Provider>
  );
}

function DefaultLine({ children: value }: { children: ReactNode }) {
  return (
    <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">
      <span className="font-medium text-muted-foreground">Default:</span>{" "}
      {typeof value === "string" ? (
        <code className="rounded-[5px] border-[0.5px] border-neutral-200 bg-editor-bg px-0.5 py-0.5 font-fira-mono text-[12px] text-foreground/85 dark:border-editor-border">
          {value}
        </code>
      ) : (
        value
      )}
    </p>
  );
}

export function ApiProp({
  name,
  type,
  defaultValue,
  className,
  children,
}: {
  name: string;
  type: ReactNode;
  defaultValue?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  const anchorPrefix = useContext(AnchorPrefixContext);
  const slug = slugFromName(name);
  const id =
    anchorPrefix !== ""
      ? `api-${slugFromName(anchorPrefix)}-${slug}`
      : `api-${slug}`;

  return (
    <div role="listitem" className={cn(className)}>
      <div
        id={id}
        className={cn(
          "scroll-mt-24 inline-flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-0.5",
          SCROLL_TARGET_FLASH_INNER_CLASS,
        )}
      >
        <span className="font-semibold text-foreground">{name}</span>
        <span className="text-muted-foreground">:</span>
        <span className="min-w-0 font-fira-mono text-[13px] leading-snug text-muted-foreground [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:font-fira-mono [&_code]:text-[13px] [&_code]:text-muted-foreground">
          {typeof type === "string" ? (
            <span className="whitespace-pre-wrap break-words">{type}</span>
          ) : (
            type
          )}
        </span>
      </div>
      {defaultValue !== undefined && defaultValue !== null ? (
        <DefaultLine>{defaultValue}</DefaultLine>
      ) : null}
      {children ? (
        <div
          className={cn(
            "mt-3 space-y-3 text-[15px] leading-relaxed text-pretty text-muted-foreground",
            "[&_a]:underline [&_a]:underline-offset-4 [&_p]:text-[15px] [&_code]:rounded-[5px] [&_code]:border-[0.5px] [&_p]:leading-relaxed [&_code]:whitespace-pre-wrap [&_code]:break-words [&_code]:border-neutral-200 [&_code]:bg-editor-bg [&_code]:px-0.5 [&_code]:py-0.5 [&_code]:font-fira-mono [&_code]:text-[13px] [&_code]:text-foreground/90 [&_code]:dark:border-editor-border",
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
