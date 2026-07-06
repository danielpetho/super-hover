"use client";

import * as React from "react";
import { useSuperHoverRef } from "super-hover/react";

import { cn } from "@/lib/utils";
import {
  SCROLL_FADE_BOTTOM,
  SCROLL_FADE_TOP,
  useScrollEdgeFade,
} from "@/lib/preview-scroll-fade";

import discogsData from "@/data/discogs-albums.json";
import { HoverModeSwitch } from "@/embeds/previews/hover-mode-switch";

const albums = discogsData.albums;
const ARTWORK_SIZE_PX = 64;
const ARTWORK_DROP_OFFSET_PX = 6;

export default function ScrollListPreview() {
  const [superHoverOn, setSuperHoverOn] = React.useState(true);
  const listRootRef = React.useRef<HTMLDivElement>(null);

  const { showTopFade, showBottomFade } = useScrollEdgeFade(listRootRef);

  const updateArtworkPlacement = React.useCallback((target: Element | null) => {
    const root = listRootRef.current;
    if (!root || !target) return;

    const row = target.closest<HTMLElement>("[data-super-hover]");
    if (!row || !root.contains(row)) return;

    const rootRect = root.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const wouldOverflowTop = rowRect.bottom - ARTWORK_SIZE_PX < rootRect.top;

    row.toggleAttribute("data-artwork-drop-below", wouldOverflowTop);
  }, []);

  const superHoverRef = useSuperHoverRef({
    onEnter(event) {
      updateArtworkPlacement(event.detail.current);
    },
    onMove(event) {
      updateArtworkPlacement(event.detail.current);
    },
  });

  const setListRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      listRootRef.current = node;
      superHoverRef(node);
    },
    [superHoverRef],
  );

  return (
    <div className="flex h-[min(27rem,70vh)] w-full select-none flex-col rounded-xl font-mono">
      <HoverModeSwitch
        className="shrink-0 pt-2 pb-1 font-sans"
        superHoverOn={superHoverOn}
        onSuperHoverOnChange={setSuperHoverOn}
      />

      <div className="relative min-h-0 flex-1 overflow-hidden">
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
          ref={setListRootRef}
          className="h-full cursor-pointer overflow-auto overscroll-contain pr-2"
        >
          <div className="grid w-full grid-cols-[2.75rem_minmax(0,32%)_minmax(0,27%)_minmax(4rem,18%)_minmax(0,10%)] text-[10px] text-foreground sm:text-xs">
            {albums.map((album, index) => (
              <div
                key={`${album.id}-${index}`}
                data-super-hover
                className={cn(
                  "group/album col-span-5 grid grid-cols-subgrid items-center gap-x-1 border-b border-transparent py-0.5 [&[data-artwork-drop-below]_.album-artwork]:bottom-auto [&[data-artwork-drop-below]_.album-artwork]:top-[calc(100%+var(--artwork-drop-offset))]",
                  superHoverOn
                    ? "data-super-hover-active:border-b-foreground data-super-hover-active:[&_.album-artwork]:opacity-100"
                    : "hover:border-b-foreground hover:[&_.album-artwork]:opacity-100",
                )}
                // style={{ contentVisibility: "auto" }}
              >
                <div className="min-w-0 pl-2 tabular-nums">
                  {String(index + 1).padStart(3, "0")}
                </div>
                <div className="min-w-0 pl-2">
                  <div className="truncate">{album.title}</div>
                </div>
                <div className="min-w-0 pl-3">
                  <div className="truncate">{album.artist}</div>
                </div>
                <div className="relative h-full min-w-0 px-1">
                  <div
                    aria-hidden
                    className="album-artwork pointer-events-none absolute bottom-0 left-1/2 z-20 size-16 -translate-x-1/2 bg-cover bg-center opacity-0"
                    style={
                      {
                        "--artwork-drop-offset": `${ARTWORK_DROP_OFFSET_PX}px`,
                        backgroundImage: `url(${album.thumb})`,
                      } as React.CSSProperties
                    }
                  />
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
