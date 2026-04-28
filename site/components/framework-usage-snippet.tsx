"use client";

import { CodeSnippet } from "@/components/code-snippet";
import { useFrameworkDocs } from "@/components/framework-docs";

const snippets = {
  react: {
    language: "tsx",
    code: `import { useEffect } from "react";
import { useSuperHoverRef } from "super-hover/react";

export function Example() {
  const rootRef = useSuperHoverRef();

  return <div ref={rootRef} data-super-hover>Item</div>;
}`,
  },
  ts: {
    language: "ts",
    code: `import { createSuperHover } from "super-hover";

const superHover = createSuperHover();

document.querySelector("#item")?.setAttribute("data-super-hover", "");

// later: superHover();`,
  },
  vue: {
    language: "vue",
    code: `<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { createSuperHover } from "super-hover";

let superHover: (() => void) | undefined;

onMounted(() => {
  superHover = createSuperHover();
});

onUnmounted(() => {
  superHover?.();
});
</script>

<template>
  <div data-super-hover>Item</div>
</template>`,
  },
  svelte: {
    language: "svelte",
    code: `<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { createSuperHover } from "super-hover";

  let superHover: (() => void) | undefined;

  onMount(() => {
    superHover = createSuperHover();
  });

  onDestroy(() => {
    superHover?.();
  });
</script>

<div data-super-hover>Item</div>`,
  },
} as const;

export function FrameworkUsageSnippet() {
  const { framework } = useFrameworkDocs();
  const entry = snippets[framework];

  return (
    <CodeSnippet title="Basic usage" code={entry.code} language={entry.language} />
  );
}

