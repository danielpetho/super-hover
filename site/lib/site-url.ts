/** Canonical site origin for sitemap, llms.txt, and robots (no trailing slash). */
export function getSiteBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    "https://super-hover.danielpetho.com";
  return raw.replace(/\/+$/, "");
}
