"use client";

import * as React from "react";
import { createSuperHover } from "super-hover";

import { Switch } from "@/components/ui/switch";
import discogsData from "@/data/discogs-albums.json";
import { cn } from "@/lib/utils";

const albums = discogsData.albums;

const SCROLL_EDGE_EPS = 4;

const SCROLL_FADE_STOPS = [
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

const MODE_LABEL_GRID =
  "inline-grid shrink-0 origin-center grid-cols-1 grid-rows-1 text-base select-none after:pointer-events-none after:col-start-1 after:row-start-1 after:invisible after:origin-center after:whitespace-nowrap after:font-medium after:content-[attr(data-ghost)]";

const MODE_LABEL_BTN =
  "cursor-pointer rounded-sm border-0 bg-transparent p-0 font-inherit outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function useScrollEdgeFade(
  scrollRef: React.RefObject<HTMLElement | null>,
): { showTopFade: boolean; showBottomFade: boolean } {
  const [showTopFade, setShowTopFade] = React.useState(false);
  const [showBottomFade, setShowBottomFade] = React.useState(false);

  const updateScrollFades = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setShowTopFade(scrollTop > SCROLL_EDGE_EPS);
    setShowBottomFade(
      scrollTop + clientHeight < scrollHeight - SCROLL_EDGE_EPS,
    );
  }, [scrollRef]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollFades();

    el.addEventListener("scroll", updateScrollFades, { passive: true });
    const ro = new ResizeObserver(updateScrollFades);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollFades);
      ro.disconnect();
    };
  }, [scrollRef, updateScrollFades]);

  return { showTopFade, showBottomFade };
}

type HoverModeSwitchProps = {
  className?: string;
  superHoverOn: boolean;
  onSuperHoverOnChange: (superHoverOn: boolean) => void;
};

function HoverModeSwitch({
  className,
  superHoverOn,
  onSuperHoverOnChange,
}: HoverModeSwitchProps) {
  const switchId = React.useId();

  return (
    <div className={cn("flex w-full items-center px-2", className)}>
      <button
        type="button"
        aria-pressed={superHoverOn}
        className={cn(
          MODE_LABEL_BTN,
          "flex min-h-11 min-w-0 flex-1 basis-0 items-center justify-end py-2 pl-1 pr-3",
        )}
        onClick={() => onSuperHoverOnChange(true)}
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
        id={switchId}
        className="relative z-10"
        checked={!superHoverOn}
        onCheckedChange={(checked) => onSuperHoverOnChange(!checked)}
        aria-label="Hover mode: Super hover when on, native when off"
      />
      <button
        type="button"
        aria-pressed={!superHoverOn}
        className={cn(
          MODE_LABEL_BTN,
          "flex min-h-11 min-w-0 flex-1 basis-0 items-center justify-start py-2 pl-3 pr-1",
        )}
        onClick={() => onSuperHoverOnChange(false)}
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
  );
}

export default function DemoOnePage() {
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
    <main className="flex h-svh w-full items-center justify-center overflow-hidden bg-background px-4 py-4 font-mono text-foreground sm:px-6 sm:py-6 lg:px-8">
      <div className="flex h-[min(42rem,82svh)] min-h-0 w-full max-w-7xl flex-col rounded-xl bg-background p-3 sm:p-4">
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
            ref={listRootRef}
            className="h-full cursor-pointer overflow-auto pr-2"
          >
            <div className="grid w-full grid-cols-[5rem_minmax(0,32%)_minmax(0,24%)_minmax(8rem,24%)_minmax(0,10%)] text-sm text-foreground sm:text-base">
              {albums.map((album, index) => (
                <div
                  key={`${album.id}-${index}`}
                  data-super-hover
                  className={cn(
                    "group/album col-span-5 grid grid-cols-subgrid items-center gap-x-1 border-b border-transparent py-0.5",
                    superHoverOn
                      ? "[&[data-super-hover-active]]:border-b-foreground [&[data-super-hover-active]_.album-artwork]:opacity-100"
                      : "hover:border-b-foreground [&:hover_.album-artwork]:opacity-100",
                  )}
                >
                  <div className="min-w-0 pl-2 tabular-nums">
                    {String(index + 1).padStart(3, "0")}
                  </div>
                  <div className="min-w-0 pl-2">
                    <div className="truncate">{album.title}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate">{album.artist}</div>
                  </div>
                  <div className="relative h-full min-w-0 px-2">
                    <div
                      aria-hidden
                      className="album-artwork absolute bottom-0 left-1/2 z-20 size-24 -translate-x-1/2 bg-cover bg-center opacity-0 shadow-sm sm:size-32"
                      style={{ backgroundImage: `url(${album.thumb})` }}
                    />
                  </div>
                  <div className="min-w-0 pr-2 text-right tabular-nums">
                    {album.year ?? "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <HoverModeSwitch
          className="shrink-0 pt-3 pb-1"
          superHoverOn={superHoverOn}
          onSuperHoverOnChange={setSuperHoverOn}
        />
      </div>
    </main>
  );
}
