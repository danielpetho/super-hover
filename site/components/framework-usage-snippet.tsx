"use client";

import { CodeSnippet } from "@/components/code-snippet";
import { useFrameworkDocs } from "@/components/framework-docs";

const snippets = {
  react: {
    language: "tsx",
    code: `import { useSuperHoverRef } from "super-hover/react";

export function Example() {
  const rootRef = useSuperHoverRef();
  const items = ["Alpha", "Beta", "Gamma"];

  return (
    <ul ref={rootRef} className="space-y-1">
      {items.map((item) => (
        <li
          key={item}
          data-super-hover
          className="rounded px-3 py-2 transition-colors data-[super-hover-active]:bg-neutral-100"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}`,
  },
  ts: {
    language: "ts",
    code: `import { createSuperHover } from "super-hover";

const list = document.querySelector("#list");
const superHover = createSuperHover({ root: list ?? undefined });

for (const row of document.querySelectorAll("#list li")) {
  row.setAttribute("data-super-hover", "");
  row.className =
    "rounded px-3 py-2 transition-colors data-[super-hover-active]:bg-neutral-100";
}

// later: superHover();`,
  },
  vue: {
    language: "vue",
    code: `<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { createSuperHover } from "super-hover";

const items = ["Alpha", "Beta", "Gamma"];
let superHover: (() => void) | undefined;

onMounted(() => {
  superHover = createSuperHover();
});

onUnmounted(() => {
  superHover?.();
});
</script>

<template>
  <ul class="space-y-1">
    <li
      v-for="item in items"
      :key="item"
      data-super-hover
      class="rounded px-3 py-2 transition-colors data-[super-hover-active]:bg-neutral-100"
    >
      {{ item }}
    </li>
  </ul>
</template>`,
  },
  svelte: {
    language: "svelte",
    code: `<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { createSuperHover } from "super-hover";

  const items = ["Alpha", "Beta", "Gamma"];
  let superHover: (() => void) | undefined;

  onMount(() => {
    superHover = createSuperHover();
  });

  onDestroy(() => {
    superHover?.();
  });
</script>

<ul class="space-y-1">
  {#each items as item (item)}
    <li
      data-super-hover
      class="rounded px-3 py-2 transition-colors data-[super-hover-active]:bg-neutral-100"
    >
      {item}
    </li>
  {/each}
</ul>`,
  },
} as const;

export function FrameworkUsageSnippet() {
  const { framework } = useFrameworkDocs();
  const entry = snippets[framework];

  return (
    <CodeSnippet title="Basic usage" code={entry.code} language={entry.language} />
  );
}

