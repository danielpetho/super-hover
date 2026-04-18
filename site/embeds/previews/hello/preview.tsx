"use client";

export default function HelloPreview() {
  return (

      <p className="text-sm text-muted-foreground">
        Inline preview: edit{" "}
        <code className="font-mono text-xs text-foreground">
          embeds/previews/hello/preview.tsx
        </code>{" "}
        and run{" "}
        <code className="font-mono text-xs text-foreground">
          pnpm generate-sources
        </code>
        .
      </p>

  );
}
