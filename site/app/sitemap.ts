import type { MetadataRoute } from "next";

import { getSiteBaseUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteBaseUrl();

  const htmlPaths = [
    { path: "/", priority: 1 },
    { path: "/vue", priority: 0.9 },
    { path: "/ts", priority: 0.9 },
    { path: "/svelte", priority: 0.9 },
    { path: "/docs", priority: 0.5 },
  ] as const;

  const mdPaths = [
    "/react.md",
    "/vue.md",
    "/ts.md",
    "/svelte.md",
  ] as const;

  const now = new Date();

  const htmlEntries = htmlPaths.map(({ path, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  }));

  const mdEntries = mdPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...htmlEntries, ...mdEntries];
}
