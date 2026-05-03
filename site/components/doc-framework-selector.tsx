"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";
import { Select } from "@base-ui/react/select";

import { cn } from "@/lib/utils";
import {
  DOC_FRAMEWORK_OPTIONS,
  type DocFrameworkId,
  docFrameworkHref,
} from "@/lib/doc-framework";
import {
  ReactLogoIcon,
  SvelteLogoIcon,
  TypeScriptLogoIcon,
  VueLogoIcon,
} from "@/components/framework-icons";

const icons: Record<DocFrameworkId, React.ReactNode> = {
  react: <ReactLogoIcon className="h-5 w-5 shrink-0" />,
  ts: <TypeScriptLogoIcon className="h-5 w-5 shrink-0" />,
  vue: <VueLogoIcon className="h-5 w-5 shrink-0" />,
  svelte: <SvelteLogoIcon className="h-5 w-5 shrink-0" />,
};

export function DocFrameworkSelector({ value }: { value: DocFrameworkId }) {
  const router = useRouter();
  const selected = DOC_FRAMEWORK_OPTIONS.find((o) => o.id === value)!;

  return (
    <Select.Root
      value={value}
      modal={false}
      onValueChange={(next) => {
        if (next != null && next !== value) {
          router.push(docFrameworkHref(next as DocFrameworkId));
        }
      }}
    >
      <Select.Trigger
        aria-label={`Documentation for ${selected.label}`}
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md py-1 text-sm font-medium text-muted-foreground outline-none select-none",
          "hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "data-popup-open:text-foreground [&_svg]:opacity-90 [&_svg]:data-popup-open:opacity-100",
        )}
      >
        {icons[value]}
        <span>{selected.label}</span>
        <Select.Icon className="text-muted-foreground opacity-80 data-popup-open:text-foreground">
          <ChevronDownIcon className="size-4 shrink-0" aria-hidden />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner
          className="outline-none"
          side="bottom"
          align="end"
          sideOffset={8}
          alignItemWithTrigger={false}
        >
          <Select.Popup
            className={cn(
              "max-h-[min(var(--available-height),320px)] min-w-[11rem] overflow-y-auto overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 text-neutral-900 outline-none dark:border-editor-border dark:bg-editor-background dark:text-white",
              "shadow-2xl/15 dark:shadow-[0_1px_2px_rgb(0_0_0_/0.09)]",
              "origin-[var(--transform-origin)] transition-[transform,scale,opacity] data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0",
            )}
          >
            <Select.List>
              {DOC_FRAMEWORK_OPTIONS.map((option) => (
                <Select.Item
                  key={option.id}
                  value={option.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md py-2 pr-8 pl-2 text-sm outline-none select-none",
                    "data-highlighted:bg-accent data-highlighted:text-accent-foreground data-selected:bg-muted data-selected:font-medium",
                  )}
                >
                  <Select.ItemText className="inline-flex items-center gap-2">
                    {icons[option.id]}
                    {option.label}
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
