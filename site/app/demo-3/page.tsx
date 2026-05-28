"use client";

import * as React from "react";
import { useSound } from "@web-kits/audio/react";
import { createSuperHover } from "super-hover";

import {
  hover as mechanicalHover,
  toggleOn as mechanicalToggleOn,
} from "@/.web-kits/mechanical";
import discogsData from "@/data/discogs-albums.json";
import { cn } from "@/lib/utils";

const albums = discogsData.albums;
const DOTS = "................................................................";
const TABLE_COLUMNS =
  "4rem minmax(11rem,38%) minmax(10rem,1fr) 4rem";

type SortKey = "id" | "artist" | "album" | "year";
type SortDirection = "asc" | "desc";

const albumRows = albums.map((album, index) => ({
  ...album,
  displayId: index + 1,
}));

function DotCell({
  align = "left",
  children,
}: {
  align?: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center whitespace-nowrap">
      <span
        aria-hidden
        className={cn(
          "dot-leader min-w-[1ch] flex-1 overflow-hidden text-neutral-600",
          align === "left" ? "order-2" : "order-1",
        )}
      >
        {DOTS}
      </span>
      <span
        className={cn(
          "min-w-0 truncate",
          align === "left" ? "order-1" : "order-2 text-right",
        )}
      >
        {children}
      </span>
    </div>
  );
}

export default function DemoThreePage() {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [sortKey, setSortKey] = React.useState<SortKey>("id");
  const [sortDirection, setSortDirection] =
    React.useState<SortDirection>("asc");
  const playHoverTick = useSound(mechanicalHover);
  const playSortToggle = useSound(mechanicalToggleOn);

  const sortedAlbums = React.useMemo(() => {
    const direction = sortDirection === "asc" ? 1 : -1;

    return [...albumRows].sort((a, b) => {
      if (sortKey === "id") {
        return (a.displayId - b.displayId) * direction;
      }

      if (sortKey === "year") {
        const aYear = Number(a.year ?? Number.MAX_SAFE_INTEGER);
        const bYear = Number(b.year ?? Number.MAX_SAFE_INTEGER);
        return (aYear - bYear) * direction;
      }

      const aValue = sortKey === "artist" ? a.artist : a.title;
      const bValue = sortKey === "artist" ? b.artist : b.title;
      return aValue.localeCompare(bValue) * direction;
    });
  }, [sortDirection, sortKey]);

  const toggleSort = (nextKey: SortKey) => {
    playSortToggle();

    if (nextKey === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection("asc");
  };

  React.useLayoutEffect(() => {
    if (rootRef.current) {
      rootRef.current.scrollTop = 0;
    }
  }, [sortDirection, sortKey]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctrl = createSuperHover({ root });
    const playOnEnter = () => {
      playHoverTick();
    };

    root.addEventListener("superhoverenter", playOnEnter);

    return () => {
      root.removeEventListener("superhoverenter", playOnEnter);
      ctrl.destroy();
    };
  }, [playHoverTick]);

  return (
    <main className="flex h-svh w-full items-center justify-center overflow-hidden bg-white px-6 py-6 font-mono text-neutral-950">
      <section className="flex h-[min(38rem,82svh)] w-[min(58rem,94vw)] flex-col">
        <div
          className="grid px-2 pb-2 text-[13px] uppercase leading-[1.15] text-neutral-950"
          style={{ gridTemplateColumns: TABLE_COLUMNS }}
        >
          <SortHeader
            active={sortKey === "id"}
            direction={sortDirection}
            label="id"
            onClick={() => toggleSort("id")}
          />
          <SortHeader
            active={sortKey === "artist"}
            direction={sortDirection}
            label="artist"
            onClick={() => toggleSort("artist")}
          />
          <SortHeader
            active={sortKey === "album"}
            direction={sortDirection}
            label="album"
            onClick={() => toggleSort("album")}
          />
          <SortHeader
            active={sortKey === "year"}
            align="right"
            direction={sortDirection}
            label="year"
            onClick={() => toggleSort("year")}
          />
        </div>

        <div
          ref={rootRef}
          className="min-h-0 flex-1 overflow-auto overscroll-contain text-[13px] uppercase leading-[1.15]"
        >
          {sortedAlbums.map((album) => (
            <div
              key={`${sortKey}-${sortDirection}-${album.displayId}`}
              data-super-hover
              className={cn(
                "grid min-h-7 cursor-pointer items-center px-2",
                "[&[data-super-hover-active]]:bg-black [&[data-super-hover-active]]:text-white [&[data-super-hover-active]_.dot-leader]:text-white",
              )}
              style={{ gridTemplateColumns: TABLE_COLUMNS }}
            >
              <div className="min-w-0 tabular-nums">
                <DotCell>{String(album.displayId).padStart(3, "0")}</DotCell>
              </div>
              <div className="min-w-0">
                <DotCell>{album.artist}</DotCell>
              </div>
              <div className="min-w-0">
                <DotCell>{album.title}</DotCell>
              </div>
              <div className="min-w-0 text-right tabular-nums">
                <DotCell align="right">{album.year ?? "-"}</DotCell>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function SortHeader({
  active,
  align = "left",
  direction,
  label,
  onClick,
}: {
  active: boolean;
  align?: "left" | "right";
  direction: SortDirection;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Sort by ${label}${
        active ? `, currently ${direction === "asc" ? "ascending" : "descending"}` : ""
      }`}
      className={cn(
        "min-w-0 cursor-pointer border-0 bg-transparent p-0 font-inherit uppercase leading-[1.15] text-current outline-none",
        "focus-visible:bg-black focus-visible:text-white",
        align === "right" ? "text-right" : "text-left",
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
