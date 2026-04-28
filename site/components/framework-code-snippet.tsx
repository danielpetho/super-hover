"use client";

import { CodeSnippet } from "@/components/code-snippet";
import { useFrameworkDocs } from "@/components/framework-docs";

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

  const snippets = {
    react: { code: react, language: reactLanguage },
    ts: { code: ts, language: tsLanguage },
    vue: { code: vue, language: vueLanguage },
    svelte: { code: svelte, language: svelteLanguage },
  } as const;
  const entry = snippets[framework];

  return (
    <CodeSnippet title={title} code={entry.code} language={entry.language} />
  );
}

