"use client"

import React from 'react';
import { CopyButton } from './copy-button';
import { Highlight, PrismTheme } from 'prism-react-renderer';
import lightTheme from '@/prism-theme.json';
import darkTheme from '@/prism-theme-dark.json';
import { prismWithSvelte } from '@/lib/prism-with-svelte';
import { useIsDarkMode } from '@/lib/use-is-dark-mode';
import { cn } from "@/lib/utils";
import { docSnippetSurfaceClasses } from "@/lib/doc-snippet-surface";

interface CodeSnippetProps {
  title?: string;
  code: string;
  language?: string;
}

function resolvePrismLanguage(language: string): string {
  const normalized = language.toLowerCase();

  if (normalized === "svelte") {
    return "svelte";
  }

  if (normalized === "vue" || normalized === "html") {
    return "markup";
  }

  return normalized;
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({
  title,
  code,
  language = 'typescript',
}) => {
  const lines = code.trim().split('\n');
  const isDark = useIsDarkMode();
  const prismLanguage = resolvePrismLanguage(language);
  const useSveltePrism = prismLanguage === "svelte";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
  };

  return (
    <div
      data-mdx-code-snippet
      className={cn("overflow-hidden", docSnippetSurfaceClasses)}
    >
      {title ? (
        <div className="flex h-11 items-center justify-between border-b-[0.5px] border-neutral-200 bg-editor-bg py-2 pl-4 pr-3 dark:border-editor-border">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-white">{title}</h3>
          <CopyButton onCopy={handleCopy} />
        </div>
      ) : null}
      <div className="relative max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain bg-editor-bg pt-4">
        {!title && (
          <div className={`absolute ${
            lines.length === 1 
              ? "top-1/2 -translate-y-1/2 right-3" 
              : "top-4 right-3"
          }`}>
            <CopyButton
              onCopy={handleCopy}
            />
          </div>
        )}
        <Highlight
          prism={useSveltePrism ? prismWithSvelte : undefined}
          theme={(isDark ? darkTheme : lightTheme) as PrismTheme}
          code={code.trim()}
          language={prismLanguage}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={`${className} text-[13px] overflow-x-auto font-mono font-medium pb-4`} style={style}>
              <div className="inline-flex min-w-full w-max flex-col">
                {tokens.map((line, i) => (
                  <div
                    key={i}
                    {...getLineProps({ line })}
                    className="flex w-full shrink-0 items-center px-4 py-px hover:bg-neutral-200/60 dark:hover:bg-editor-border"
                  >
                    <span className="mr-4 flex items-center text-right text-[10px] text-neutral-500 select-none dark:text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="whitespace-pre">
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
};
