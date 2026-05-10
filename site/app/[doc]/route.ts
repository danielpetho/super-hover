import { readFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import {
  getDocMarkdownAbsolutePath,
  isMarkdownDocSegment,
} from "@/lib/doc-markdown-source";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ doc: string }> },
) {
  const { doc } = await ctx.params;

  if (!isMarkdownDocSegment(doc)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const abs = getDocMarkdownAbsolutePath(doc);
    const body = await readFile(abs, "utf8");
    const headers: Record<string, string> = {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    };
    if (doc === "dev.md") {
      headers["X-Robots-Tag"] = "noindex";
    }
    return new NextResponse(body, {
      status: 200,
      headers,
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
