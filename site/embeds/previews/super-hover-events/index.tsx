"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useSuperHoverRef } from "super-hover/react";

import { cn } from "@/lib/utils";
import {
  SCROLL_FADE_BOTTOM,
  SCROLL_FADE_TOP,
  useScrollEdgeFade,
} from "@/lib/preview-scroll-fade";
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
 * cover in the corner; active rows use `[data-super-hover-active]` with a light gray background.
 */
export default function SuperHoverEventsPreview() {
  const [active, setActive] = React.useState<ActiveAlbum | null>(null);
  const [showThumb, setShowThumb] = React.useState(false);
  const previewRootRef = React.useRef<HTMLDivElement | null>(null);
  const thumbRef = React.useRef<HTMLDivElement | null>(null);
  const revealRafRef = React.useRef<number | null>(null);
  const cursorX = useMotionValue(10);
  const cursorY = useMotionValue(10);
  const springX = useSpring(cursorX, {
    stiffness: 260,
    damping: 40,
  });
  const springY = useSpring(cursorY, {
    stiffness: 260,
    damping: 40,
  });

  const cancelReveal = React.useCallback(() => {
    if (revealRafRef.current !== null) {
      cancelAnimationFrame(revealRafRef.current);
      revealRafRef.current = null;
    }
  }, []);

  React.useEffect(() => cancelReveal, [cancelReveal]);

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

  const scrollElRef = React.useRef<HTMLDivElement | null>(null);

  const superHoverRefCallback = useSuperHoverRef({
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

  const setListRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      scrollElRef.current = el;
      superHoverRefCallback(el);
    },
    [superHoverRefCallback],
  );

  const { showTopFade, showBottomFade } = useScrollEdgeFade(scrollElRef);

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = previewRootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const thumbRect = thumbRef.current?.getBoundingClientRect();
      const thumbWidth = thumbRect?.width ?? 160;
      const thumbHeight = thumbRect?.height ?? 160;
      const rawX = event.clientX - rect.left + 24;
      const rawY = event.clientY - rect.top + 24;
      cursorX.set(Math.max(0, Math.min(rawX, rect.width - thumbWidth)));
      cursorY.set(Math.max(0, Math.min(rawY, rect.height - thumbHeight)));
    },
    [cursorX, cursorY],
  );

  const handlePointerEnter = React.useCallback(() => {
    cancelReveal();
    setShowThumb(false);

    let frames = 2;
    const tick = () => {
      if (frames > 0) {
        frames -= 1;
        revealRafRef.current = requestAnimationFrame(tick);
        return;
      }
      revealRafRef.current = null;
      setShowThumb(true);
    };

    revealRafRef.current = requestAnimationFrame(tick);
  }, [cancelReveal]);

  const handlePointerLeave = React.useCallback(() => {
    cancelReveal();
    setShowThumb(false);
  }, [cancelReveal]);

  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 select-none flex-col gap-2 p-1">

      <div ref={previewRootRef} className="relative min-h-0 w-full max-w-full flex-1">
        <div className="relative min-h-0 w-full max-h-[min(380px,52vh)]">
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
            ref={setListRef}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onPointerMove={handlePointerMove}
            className="min-h-0 max-h-[min(380px,52vh)] w-full cursor-pointer select-none overflow-y-auto overscroll-contain pr-2"
          >
            <ul className="m-0 list-none p-0 pb-24 pr-0 text-sm text-foreground ">
            {albums.map((album, index) => {
              const key = `${album.id}-${index}`;
              return (
                <li key={key}>
                  <div
                    data-super-hover
                    data-album-index={String(index)}
                    className={cn(
                      "w-full py-1.5 pl-1 pr-0 transition-colors duration-0 ease-out",
                      "[&[data-super-hover-active]]:bg-muted [&[data-super-hover-active]]:transition-none",
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
      </div>

        {active && showThumb && (
          <motion.div
            ref={thumbRef}
            className="pointer-events-none absolute z-20 w-[min(10rem,28vw)] overflow-hidden"
            initial={false}
            style={{ left: 0, top: 0, x: springX, y: springY }}
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
          </motion.div>
        )}
      </div>
    </div>
  );
}
