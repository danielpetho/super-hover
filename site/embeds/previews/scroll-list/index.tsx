"use client";

import * as React from "react";
import { createSuperHover } from "super-hover";

import { cn } from "@/lib/utils";
import {
  SCROLL_FADE_BOTTOM,
  SCROLL_FADE_TOP,
  useScrollEdgeFade,
} from "@/lib/preview-scroll-fade";

import discogsData from "@/data/discogs-albums.json";
import { HoverModeSwitch } from "@/embeds/previews/hover-mode-switch";

const albums = discogsData.albums;

export default function ScrollListPreview() {
  const [superHoverOn, setSuperHoverOn] = React.useState(true);
  const listRootRef = React.useRef<HTMLDivElement>(null);

  const { showTopFade, showBottomFade } = useScrollEdgeFade(listRootRef);

  React.useEffect(() => {
    const root = listRootRef.current;
    if (!root) return;
    const ctrl = createSuperHover({ root });
    return () => ctrl.destroy();
  }, []);

  return (
    <div className="flex h-[min(27rem,70vh)] w-full select-none flex-col gap-3 rounded-xl">
      <HoverModeSwitch
        className="pt-2 pb-1"
        superHoverOn={superHoverOn}
        onSuperHoverOnChange={setSuperHoverOn}
      />

      <div className="relative min-h-0 flex-1">
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-2 top-0 z-10 h-24 transition-opacity duration-500 ease-in-out"
          style={{
            opacity: showTopFade ? 1 : 0,
            background: SCROLL_FADE_TOP,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-2 z-10 h-24 transition-opacity duration-500 ease-in-out"
          style={{
            opacity: showBottomFade ? 1 : 0,
            background: SCROLL_FADE_BOTTOM,
          }}
        />

        <div
          ref={listRootRef}
          className="h-full cursor-pointer overflow-auto overscroll-contain pr-2"
        >
          <div className="text-foreground grid w-full grid-cols-[minmax(0,46%)_minmax(0,42%)_minmax(0,12%)] text-sm">
            {albums.map((album, index) => (
              <div
                key={`${album.id}-${index}`}
                data-super-hover
                className={cn(
                  "col-span-3 grid grid-cols-subgrid gap-x-3 py-0.5",
                  superHoverOn
                    ? "[&[data-super-hover-active]]:bg-blue-500 [&[data-super-hover-active]]:text-white"
                    : "hover:bg-blue-500 hover:text-white",
                )}
                // style={{ contentVisibility: "auto" }}
              >
                <div className="min-w-0 pl-2">
                  <div className="truncate">{album.title}</div>
                </div>
                <div className="min-w-0">
                  <div className="truncate">{album.artist}</div>
                </div>
                <div className="min-w-0 pr-2 text-right tabular-nums">
                  {album.year ?? "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
