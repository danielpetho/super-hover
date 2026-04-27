"use client";

import * as React from "react";
import { useSuperHoverRef } from "super-hover/react";

import { cn } from "@/lib/utils";
import discogsData from "@/data/discogs-albums.json";

const albums = discogsData.albums;

const uniqueThumbUrls = [
  ...new Set(
    albums.map((a) => a.thumb).filter((u): u is string => Boolean(u)),
  ),
];

type ActiveAlbum = {
  thumb: string;
  title: string;
  artist: string;
};

/**
 * Event-driven “now playing” with a long scroll: `superhoverenter` / `superhoverleave` update the
 * cover in the corner; the row’s bottom border uses `[data-super-hover-active]` so the active row
 * is visible in CSS and in UI state.
 */
export default function SuperHoverEventsPreview() {
  const [active, setActive] = React.useState<ActiveAlbum | null>(null);

  /** Warm the HTTP cache for Discogs thumbs so the corner cover swaps without visible loading. */
  React.useEffect(() => {
    const run = () => {
      for (const url of uniqueThumbUrls) {
        const img = new Image();
        img.src = url;
      }
    };
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(run, { timeout: 2_000 });
      return () => cancelIdleCallback(id);
    }
    const t = window.setTimeout(run, 0);
    return () => window.clearTimeout(t);
  }, []);

  const setListRoot = useSuperHoverRef({
    onEnter: (e) => {
      const t = e.target as HTMLElement | null;
      const raw = t?.dataset.albumIndex;
      if (raw === undefined) return;
      const a = albums[Number.parseInt(raw, 10)];
      if (!a?.thumb) return;
      setActive({ thumb: a.thumb, title: a.title, artist: a.artist });
    },
    onLeave: () => {
      setActive(null);
    },
  });

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col gap-2 p-1">

      <div className="relative min-h-0 w-full max-w-full flex-1">
        <div
          ref={setListRoot}
          className="min-h-0 max-h-[min(380px,52vh)] w-full overflow-y-auto pr-2"
        >
          <ul className="m-0 list-none p-0 pb-24 pr-0 text-sm text-foreground ">
            {albums.map((album, index) => {
              const key = `${album.id}-${index}`;
              return (
                <li key={key} className="last:[&>div]:border-b-0">
                  <div
                    data-super-hover
                    data-album-index={String(index)}
                    className={cn(
                      "w-full cursor-default border-y border-transparent py-1.5 pl-1 pr-0",
                      "[&[data-super-hover-active]]:border-black [&[data-super-hover-active]]cursor-pointer",
                    )}
                  >
                    <div className="min-w-0 truncate text-lg">{album.title}</div>
                    <div className="min-w-0 truncate text-sm text-muted-foreground">
                      {album.artist}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {active && (
          <div
            className="pointer-events-none absolute bottom-0 right-0 z-10 w-[min(10rem,28vw)] overflow-hidden"
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- remote Discogs thumb, no size opt */}
            <img
              src={active.thumb}
              alt=""
              className="aspect-square h-auto w-full object-cover"
              width={150}
              height={150}
              loading="eager"
              decoding="async"
              draggable={false}
            />
            {/* <p className="m-0 max-w-full truncate px-1 pb-1 pt-0.5 text-center text-[10px] font-medium leading-tight text-foreground">
              {active.title}
            </p> */}
          </div>
        )}
      </div>
    </div>
  );
}
