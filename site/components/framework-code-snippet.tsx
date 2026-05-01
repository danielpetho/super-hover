"use client";

import * as React from "react";
import useMeasure from "react-use-measure";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { Highlight, type PrismTheme } from "prism-react-renderer";

import { CopyButton } from "@/components/copy-button";
import { useFrameworkDocs } from "@/components/framework-docs";
import { useIsDarkMode } from "@/lib/use-is-dark-mode";
import { prismWithSvelte } from "@/lib/prism-with-svelte";
import darkTheme from "@/prism-theme-dark.json";
import lightTheme from "@/prism-theme.json";

/** Align with `CodeSnippet` body cap (`max-h-[min(70vh,520px)]`). */
const BODY_MAX_PX = 520;

type FrameworkCodeSnippetProps = {
  title?: string;
  react: string;
  ts: string;
  vue: string;
  svelte: string;
  reactLanguage?: string;
  tsLanguage?: string;
  vueLanguage?: string;
  svelteLanguage?: string;
};

export function FrameworkCodeSnippet({
  title = "Basic usage",
  react,
  ts,
  vue,
  svelte,
  reactLanguage = "tsx",
  tsLanguage = "ts",
  vueLanguage = "vue",
  svelteLanguage = "svelte",
}: FrameworkCodeSnippetProps) {
  const { framework } = useFrameworkDocs();

  const isDark = useIsDarkMode();

  const snippets = {
    react: { code: react, language: reactLanguage },
    ts: { code: ts, language: tsLanguage },
    vue: { code: vue, language: vueLanguage },
    svelte: { code: svelte, language: svelteLanguage },
  } as const;
  const entry = snippets[framework];
  const code = entry.code.trim();
  const lines = code.split("\n");
  const normalizedLanguage = entry.language.toLowerCase();
  const useSveltePrism = normalizedLanguage === "svelte";
  const prismLanguage = useSveltePrism
    ? "svelte"
    : normalizedLanguage === "vue" || normalizedLanguage === "html"
      ? "markup"
      : normalizedLanguage;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(entry.code);
  };

  const [measureRef, bounds] = useMeasure();
  const animatedHeight =
    bounds.height > 0 ? Math.min(bounds.height, BODY_MAX_PX) : "auto";

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-editor-border dark:bg-editor-background">
      {title ? (
        <div className="flex h-11 items-center justify-between border-b border-neutral-200 bg-neutral-100 py-2 pl-4 pr-3 dark:border-editor-border dark:bg-editor-background">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-white">{title}</h3>
          <CopyButton onCopy={handleCopy} />
        </div>
      ) : null}

      <MotionConfig transition={{ duration: 0.3, type: "spring", bounce: 0 }}>
        <motion.div
          initial={false}
          animate={{ height: animatedHeight }}
          className="overflow-hidden bg-neutral-100 dark:bg-editor-background"
        >
          <div className="relative h-full min-h-0 max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain bg-neutral-100 [scrollbar-gutter:stable] dark:bg-editor-background">
            {!title ? (
              <div
                className={`absolute z-10 ${
                  lines.length === 1 ? "top-1/2 right-3 -translate-y-1/2" : "top-4 right-3"
                }`}
              >
                <CopyButton onCopy={handleCopy} />
              </div>
            ) : null}

            <div ref={measureRef} className="pt-4">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div key={framework}>
                  <Highlight
                    prism={useSveltePrism ? prismWithSvelte : undefined}
                    theme={(isDark ? darkTheme : lightTheme) as PrismTheme}
                    code={code}
                    language={prismLanguage}
                  >
                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                      <pre
                        className={`${className} overflow-x-auto pb-4 font-mono text-[13px] font-medium`}
                        style={style}
                      >
                        {tokens.map((line, i) => (
                          <div
                            key={i}
                            {...getLineProps({ line })}
                            className="flex items-center px-4 py-px hover:bg-neutral-200/60 dark:hover:bg-editor-border"
                          >
                            <span className="mr-4 flex items-center select-none text-right text-[10px] text-neutral-500 dark:text-muted-foreground">
                              {i + 1}
                            </span>
                            <span>
                              {line.map((token, key) => (
                                <span key={key} {...getTokenProps({ token })} />
                              ))}
                            </span>
                          </div>
                        ))}
                      </pre>
                    )}
                  </Highlight>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </MotionConfig>
    </div>
  );
}
