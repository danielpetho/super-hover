export type DocFrameworkId = "react" | "vue" | "svelte" | "ts";

export const DOC_FRAMEWORK_OPTIONS: Array<{ id: DocFrameworkId; label: string }> = [
  { id: "react", label: "React" },
  { id: "vue", label: "Vue" },
  { id: "svelte", label: "Svelte" },
  { id: "ts", label: "TypeScript" },
];

export function docFrameworkHref(id: DocFrameworkId): string {
  switch (id) {
    case "react":
      return "/";
    case "vue":
      return "/vue";
    case "svelte":
      return "/svelte";
    case "ts":
      return "/ts";
    default:
      return "/";
  }
}
