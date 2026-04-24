"use client";

import * as React from "react";
import { useSuperHoverRef } from "super-hover/react";

import ScrambleHover from "@/components/fancy/text/scramble-hover";
import { cn } from "@/lib/utils";

import discogsData from "@/data/discogs-albums.json";

const albums = discogsData.albums;

type Album = (typeof albums)[number];

const ScrambleHoverRow = React.memo(function ScrambleHoverRow({
  album,
  rowId,
  active,
}: {
  album: Album;
  rowId: string;
  active: boolean;
}) {
  return (
    <div
      data-super-hover
      data-row-id={rowId}
      className={cn(
        "col-span-3 grid cursor-pointer grid-cols-subgrid gap-x-3 py-1.5 border-y border-transparent",
        active && " border-y-black",
      )}
    >
      <div className="min-w-0 pl-3">
        <ScrambleHover
          text={album.title}
          scrambleSpeed={45}
          maxIterations={10}
          useOriginalCharsOnly
          active={active}
          className="cursor-pointer text-left text-base"
        />
      </div>
      <div className="min-w-0">
        <ScrambleHover
          text={album.artist}
          scrambleSpeed={45}
          maxIterations={10}
          useOriginalCharsOnly
          active={active}
          className="cursor-pointer text-left text-base"
        />
      </div>
      <div className="min-w-0 pr-3 text-right tabular-nums">
        <ScrambleHover
          text={String(album.year ?? "—")}
          scrambleSpeed={45}
          maxIterations={10}
          useOriginalCharsOnly
          active={active}
          className="cursor-pointer text-right text-base"
        />
      </div>
    </div>
  );
});

export default function ScrambleHoverListPreview() {
  const [activeRowId, setActiveRowId] = React.useState<string | null>(null);

  const onEnter = React.useCallback((e: Event) => {
    const t = e.target as HTMLElement | null;
    const id = t?.dataset.rowId;
    if (id) setActiveRowId(id);
  }, []);

  const onLeave = React.useCallback((e: Event) => {
    const t = e.target as HTMLElement | null;
    const id = t?.dataset.rowId;
    if (!id) return;
    setActiveRowId((prev) => (prev === id ? null : prev));
  }, []);

  const setListRoot = useSuperHoverRef({
    onEnter,
    onLeave,
  });

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col">
      <div
        ref={setListRoot}
        className="min-h-0 max-h-[min(380px,52vh)] w-full flex-1 overflow-y-auto overflow-x-hidden pr-2"
      >
        <div className="text-foreground grid w-full grid-cols-[minmax(0,46%)_minmax(0,42%)_minmax(0,12%)] text-base">
          {albums.map((album, index) => {
            const rowId = `${album.id}-${index}`;
            const active = activeRowId === rowId;

            return (
              <ScrambleHoverRow
                key={rowId}
                album={album}
                rowId={rowId}
                active={active}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
