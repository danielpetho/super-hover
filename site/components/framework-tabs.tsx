"use client";

import * as React from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { type FrameworkId, useFrameworkDocs } from "@/components/framework-docs";
import {
  ReactLogoIcon,
  SvelteLogoIcon,
  TypeScriptLogoIcon,
  VueLogoIcon,
} from "@/components/framework-icons";

const frameworks: Array<{
  id: FrameworkId;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    id: "react",
    label: "React",
    icon: <ReactLogoIcon className="h-5 w-5" />,
  },
  {
    id: "ts",
    label: "TypeScript",
    icon: <TypeScriptLogoIcon className="h-5 w-5" />,
  },
  {
    id: "vue",
    label: "Vue",
    icon: <VueLogoIcon className="h-5 w-5" />,
  },
  {
    id: "svelte",
    label: "Svelte",
    icon: <SvelteLogoIcon className="h-5 w-5" />,
  },
];

export function FrameworkTabs({ className }: { className?: string }) {
  const { framework, setFramework } = useFrameworkDocs();

  return (
    <Tabs
      value={framework}
      onValueChange={(value) => setFramework(value as FrameworkId)}
      className={cn("w-full", className)}
    >
      <TabsList className="h-auto w-fit flex-wrap gap-2 bg-transparent p-0">
        {frameworks.map((item) => (
          <TabsTrigger
            key={item.id}
            value={item.id}
            className={cn(
              "h-10 cursor-pointer rounded-lg border border-transparent bg-transparent px-4 w-fit py-2 text-base font-medium text-neutral-500 transition-all duration-200 ease-out hover:text-neutral-900 dark:text-muted-foreground border dark:hover:text-white border-transparent",
              "data-active:bg-neutral-100 data-active:text-neutral-900 dark:data-active:bg-editor-background dark:data-active:text-white shadow-none! active:scale-96 duration-200 ease-out transition-all data-active:border-neutral-200 dark:data-active:border-editor-border",
            )}
          >
            <span className="inline-flex items-center gap-2.5">
              {item.icon}
              <span className="text-base leading-none tracking-tight">
                {item.label}
              </span>
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

