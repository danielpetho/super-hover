"use client";

import * as React from "react";
import { createSuperHover } from "super-hover";
import { TextMorph } from "torph/react";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import discogsData from "@/data/discogs-albums.json";

const albums = discogsData.albums;

const SCROLL_EDGE_EPS = 4;

/** Shared stops: opaque at the “inner” edge of the fade, transparent at the scroll edge. */
const SCROLL_FADE_STOPS =
  [
    "hsl(0, 0%, 100%) 0%",
    "hsla(0, 0%, 100%, 0.94) 6.2%",
    "hsla(0, 0%, 100%, 0.873) 11.1%",
    "hsla(0, 0%, 100%, 0.801) 15%",
    "hsla(0, 0%, 100%, 0.724) 18.2%",
    "hsla(0, 0%, 100%, 0.645) 21%",
    "hsla(0, 0%, 100%, 0.564) 23.8%",
    "hsla(0, 0%, 100%, 0.484) 26.9%",
    "hsla(0, 0%, 100%, 0.404) 30.6%",
    "hsla(0, 0%, 100%, 0.328) 35.1%",
    "hsla(0, 0%, 100%, 0.255) 41%",
    "hsla(0, 0%, 100%, 0.188) 48.4%",
    "hsla(0, 0%, 100%, 0.127) 57.6%",
    "hsla(0, 0%, 100%, 0.075) 69.1%",
    "hsla(0, 0%, 100%, 0.032) 83.1%",
    "hsla(0, 0%, 100%, 0) 100%",
  ].join(", ");

const SCROLL_FADE_TOP = `linear-gradient(to bottom, ${SCROLL_FADE_STOPS})`;
const SCROLL_FADE_BOTTOM = `linear-gradient(to top, ${SCROLL_FADE_STOPS})`;

export default function ScrollListPreview() {
  const superHoverSwitchId = React.useId();
  const [superHoverOn, setSuperHoverOn] = React.useState(true);
  const [showTopFade, setShowTopFade] = React.useState(false);
  const [showBottomFade, setShowBottomFade] = React.useState(false);
  const listRootRef = React.useRef<HTMLDivElement>(null);

  const updateScrollFades = React.useCallback(() => {
    const el = listRootRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setShowTopFade(scrollTop > SCROLL_EDGE_EPS);
    setShowBottomFade(
      scrollTop + clientHeight < scrollHeight - SCROLL_EDGE_EPS,
    );
  }, []);

  React.useEffect(() => {
    const el = listRootRef.current;
    if (!el) return;

    updateScrollFades();

    el.addEventListener("scroll", updateScrollFades, { passive: true });
    const ro = new ResizeObserver(updateScrollFades);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollFades);
      ro.disconnect();
    };
  }, [updateScrollFades]);

  React.useEffect(() => {
    const root = listRootRef.current;
    if (!root) return;
    return createSuperHover({ root });
  }, []);

  return (
    <div className="flex w-full flex-1 flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
        <div className="flex items-center gap-2.5 px-2 pt-2">
          <label
            htmlFor={superHoverSwitchId}
            className="cursor-pointer text-base text-foreground select-none pb-0.5"
          >
            <TextMorph
              as="span"
              duration={320}
              ease="ease-out"
              locale="en"
            >
              {superHoverOn ? "Disable" : "Enable"}
            </TextMorph>
          </label>
          <Switch
            id={superHoverSwitchId}
            checked={superHoverOn}
            onCheckedChange={setSuperHoverOn}
          />
        </div>
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
          className="max-h-[min(380px,52vh)] overflow-auto pr-2"
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
              >
                <div className="min-w-0 cursor-pointer pl-2">
                  <div className="truncate">{album.title}</div>
                </div>
                <div className="min-w-0 cursor-pointer">
                  <div className="truncate">{album.artist}</div>
                </div>
                <div className="min-w-0 cursor-pointer pr-2 text-right tabular-nums">
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
