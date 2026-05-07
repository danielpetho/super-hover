"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { previewRegistry } from "@/lib/preview-registry";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CodeSnippet } from "@/components/code-snippet";

export interface PreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Folder name under embeds/previews */
  name: string;
  /** When `false` (or string `"false"` from MDX), only the demo frame is shown — no Demo/Code tabs. */
  showCode?: boolean | "true" | "false";
  /** Show restart control inside the demo frame. */
  showRestart?: boolean;
  /** Border + rounded frame around the demo. Default `true`. */
  border?: boolean | "true" | "false";
  /** Centered caption under the preview (figure description). */
  description?: React.ReactNode;
  /** Extra className for the outer wrapper */
  className?: string;
  /** Classes merged into the demo frame */
  frameClassName?: string;
}

export function Preview({
  name,
  className,
  showCode = true,
  showRestart = false,
  border = true,
  description,
  frameClassName,
  ...props
}: PreviewProps) {
  const [previewKey, setPreviewKey] = React.useState(0);
  const [sourceCode, setSourceCode] = React.useState("");

  const Component = previewRegistry[name];

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/r/${encodeURIComponent(name)}.json`);
        if (!res.ok) return;
        const data: {
          files?: { path: string; content: string }[];
        } = await res.json();
        const main =
          data.files?.find((f) => f.path === "index.tsx") ??
          data.files?.find((f) => f.path.endsWith("/index.tsx")) ??
          data.files?.find((f) => f.path.endsWith("preview.tsx"));
        if (main && !cancelled) {
          setSourceCode(main.content);
        }
      } catch {
        /* ignore */
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [name]);

  const codeDisabled = showCode === false || showCode === "false";
  const frameBorder = border !== false && border !== "false";
  /** No Code panel → no Demo/Code switcher; only the framed demo. */
  const showTabs = !codeDisabled && sourceCode.trim().length > 0;

  const PreviewBody = React.useMemo(() => {
    if (!Component) {
      return (
        <p
          className="text-muted-foreground flex h-full min-h-[200px] w-full items-center justify-center px-4 text-center text-sm"
          data-preview-missing
        >
          Preview{" "}
          <code className="bg-editor-bg px-1.5 py-0.5 font-mono text-xs border border-neutral-200 rounded dark:border-editor-border">
            {name}
          </code>{" "}
          not in registry — run{" "}
          <code className="bg-editor-bg px-1.5 py-0.5 font-mono text-xs border border-neutral-200 rounded dark:border-editor-border">
            pnpm generate-sources
          </code>
        </p>
      );
    }
    return <Component />;
  }, [Component, name]);

  const DemoFrame = (
    <div
      className={cn(
        "bg-background relative flex min-h-[240px] max-h-[min(70vh,560px)] w-full flex-col overflow-hidden rounded-xl",
        frameBorder && "border-border border",
        frameClassName ?? className,
      )}
    >
      {showRestart && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 shrink-0 rounded-md border-border bg-background"
            onClick={() => setPreviewKey((k) => k + 1)}
            aria-label="Restart demo"
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      )}

      <div className="flex flex-1 items-center justify-center overflow-auto overscroll-contain">
        <React.Fragment key={previewKey}>{PreviewBody}</React.Fragment>
      </div>
    </div>
  );

  const main = showTabs ? (
    <Tabs defaultValue="demo" className="w-full items-start gap-4">
      <TabsList
        variant="line"
        className="h-auto w-fit shrink-0 justify-start gap-3 self-start rounded-none border-0 bg-transparent p-0 shadow-none"
      >
        <TabsTrigger
          value="demo"
          className="h-auto flex-none cursor-pointer rounded-none border-0 bg-transparent px-0 py-0 text-base font-medium text-muted-foreground shadow-none after:bottom-[-6px] hover:text-foreground data-active:bg-transparent data-active:font-medium data-active:text-foreground data-active:shadow-none dark:data-active:bg-transparent active:scale-97 duration-200 ease-out"
        >
          Demo
        </TabsTrigger>
        <TabsTrigger
          value="code"
          className="h-auto flex-none cursor-pointer rounded-none border-0 bg-transparent px-0 py-0 text-base font-medium text-muted-foreground shadow-none after:bottom-[-6px] hover:text-foreground data-active:bg-transparent data-active:font-medium data-active:text-foreground data-active:shadow-none dark:data-active:bg-transparent active:scale-97 duration-200 ease-out"
        >
          Code
        </TabsTrigger>
      </TabsList>

      <TabsContent value="demo" className="mt-0 w-full p-0! focus-visible:outline-none">
        {DemoFrame}
      </TabsContent>

      <TabsContent value="code" className="mt-0 w-full p-0! focus-visible:outline-none">
        <CodeSnippet
          title={`${name}/index.tsx`}
          code={sourceCode}
          language="tsx"
        />
      </TabsContent>
    </Tabs>
  ) : (
    DemoFrame
  );

  return (
    <div
      data-preview={name}
      className={cn(
        "relative flex w-full max-w-3xl flex-col",
        showTabs && !description ? "gap-4" : "gap-0",
        className,
      )}
      {...props}
    >
      {description ? (
        <figure className="flex w-full flex-col gap-3">
          {main}
          <figcaption className="text-muted-foreground mx-auto max-w-prose px-4 text-center text-sm leading-normal mt-4 sm:mt-4 text-pretty">
            {description}
          </figcaption>
        </figure>
      ) : (
        main
      )}
    </div>
  );
}
