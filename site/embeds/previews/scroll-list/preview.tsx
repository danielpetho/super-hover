"use client";

import * as React from "react";
import { createSuperHover } from "super-hover";

import discogsData from "@/data/discogs-albums.json";

const albums = discogsData.albums;

export default function ScrollListPreview() {
  const [superHoverOn, setSuperHoverOn] = React.useState(true);
  const listRootRef = React.useRef<HTMLDivElement>(null);
  const stopRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    if (!superHoverOn) {
      stopRef.current?.();
      stopRef.current = null;
      return;
    }

    const root = listRootRef.current;
    if (!root) return;

    stopRef.current = createSuperHover({ root });
    return () => {
      stopRef.current?.();
      stopRef.current = null;
    };
  }, [superHoverOn]);

  return (
    <div className="flex w-full flex-1 flex-col gap-3">
      <div className="flex flex-col gap-2 p-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            className="border-input bg-background text-primary focus-visible:ring-ring h-4 w-4 rounded border shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            checked={superHoverOn}
            onChange={(e) => setSuperHoverOn(e.target.checked)}
          />
          <span>Super hover</span>
        </label>
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Scroll down
        </p>
      </div>

      <div
        ref={listRootRef}
        className="max-h-[min(380px,52vh)] overflow-auto px-8"
      >
        <div className="text-foreground grid w-full grid-cols-[minmax(0,46%)_minmax(0,42%)_minmax(0,12%)] text-sm">
          {albums.map((album, index) => (
            <div
              key={`${album.id}-${index}`}
              data-super-hover
              className="group contents [&[data-super-hover-active]>_*]:bg-neutral-200 [&:hover>_*]:bg-neutral-200"
            >
              <div className="min-w-0 cursor-pointer py-0.5">
                <div className="truncate">{album.title}</div>
              </div>
              <div className="min-w-0 cursor-pointer py-0.5">
                <div className="truncate">{album.artist}</div>
              </div>
              <div className="min-w-0 cursor-pointer py-0.5 text-right tabular-nums">
                {album.year ?? "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
