import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function slugFromLabel(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function plainTextChild(children: ReactNode): string | null {
  if (typeof children === "string") return children;
  if (
    Array.isArray(children) &&
    children.length === 1 &&
    typeof children[0] === "string"
  ) {
    return children[0];
  }
  return null;
}

type HeadingTag = "h2" | "h3" | "h4";

/**
 * Section title that stays a real heading for outline/anchors but looks like inline code,
 * slightly larger than body `code` (13px).
 */
export function DocCodeHeading({
  as: Tag = "h3",
  id,
  className,
  suffix,
  children,
}: {
  as?: HeadingTag;
  id?: string;
  className?: string;
  /** Non-monospace text after the code pill (e.g. “options”). Uses heading typography; spacing via gap. */
  suffix?: ReactNode;
  children: ReactNode;
}) {
  const label = plainTextChild(children);
  const suffixPlain =
    typeof suffix === "string" ? suffix : null;
  const resolvedId =
    id ??
    (label !== null
      ? slugFromLabel(
          suffixPlain ? `${label} ${suffixPlain}` : label,
        )
      : undefined);

  return (
    <Tag
      id={resolvedId}
      className={cn(
        "scroll-mt-24 flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-4 text-xl font-semibold leading-snug text-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block max-w-full whitespace-pre-wrap break-words font-fira-mono font-semibold tracking-tight",
          "rounded-md border border-border bg-muted",
          "px-2 py-1 text-[15px] leading-normal text-foreground",
        )}
      >
        {children}
      </span>
      {suffix ? (
        <span className="min-w-0 font-semibold tracking-tight text-foreground">
          {suffix}
        </span>
      ) : null}
    </Tag>
  );
}
