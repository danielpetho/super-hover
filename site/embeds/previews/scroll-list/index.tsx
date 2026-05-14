"use client";

import * as React from "react";
import { createSuperHover } from "super-hover";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  SCROLL_FADE_BOTTOM,
  SCROLL_FADE_TOP,
  useScrollEdgeFade,
} from "@/lib/preview-scroll-fade";

import discogsData from "@/data/discogs-albums.json";

const albums = discogsData.albums;

const MODE_LABEL_GRID =
  "inline-grid shrink-0 origin-center grid-cols-1 grid-rows-1 text-base select-none after:pointer-events-none after:col-start-1 after:row-start-1 after:invisible after:origin-center after:whitespace-nowrap after:font-medium after:content-[attr(data-ghost)]";

const MODE_LABEL_BTN =
  "cursor-pointer rounded-sm border-0 bg-transparent p-0 font-inherit outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function ScrollListPreview() {
  const superHoverSwitchId = React.useId();
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
    <div className="flex w-full flex-1 select-none flex-col gap-3">
      <div className="flex w-full items-center px-2 pt-2 pb-1">
        <button
          type="button"
          aria-pressed={superHoverOn}
          className={cn(
            MODE_LABEL_BTN,
            "flex min-h-11 min-w-0 flex-1 basis-0 items-center justify-end py-2 pr-3 pl-1",
          )}
          onClick={() => setSuperHoverOn(true)}
        >
          <span data-ghost="Super hover" className={MODE_LABEL_GRID}>
            <span
              className={cn(
                "col-start-1 row-start-1 origin-center transition-[color,font-weight] duration-200 ease-out",
                superHoverOn
                  ? "font-medium text-foreground"
                  : "font-normal text-muted-foreground",
              )}
            >
              Super hover
            </span>
          </span>
        </button>
        <Switch
          id={superHoverSwitchId}
          className="relative z-10"
          checked={!superHoverOn}
          onCheckedChange={(checked) => setSuperHoverOn(!checked)}
          aria-label="Hover mode: Super hover when on, native when off"
        />
        <button
          type="button"
          aria-pressed={!superHoverOn}
          className={cn(
            MODE_LABEL_BTN,
            "flex min-h-11 min-w-0 flex-1 basis-0 items-center justify-start py-2 pl-3 pr-1",
          )}
          onClick={() => setSuperHoverOn(false)}
        >
          <span data-ghost="Native hover" className={MODE_LABEL_GRID}>
            <span
              className={cn(
                "col-start-1 row-start-1 origin-center transition-[color,font-weight] duration-200 ease-out",
                !superHoverOn
                  ? "font-medium text-foreground"
                  : "font-normal text-muted-foreground",
              )}
            >
              Native hover
            </span>
          </span>
        </button>
      </div>

      <div className="relative ">
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
          className="max-h-[min(380px,52vh)] cursor-pointer overflow-auto overscroll-contain pr-2"
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
                style={{ contentVisibility: "auto" }}
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
