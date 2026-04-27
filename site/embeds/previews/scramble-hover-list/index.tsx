"use client";

import { useSuperHoverRef } from "super-hover/react";

import { ScrambleSuperListRow } from "@/components/fancy/text/scramble-super-row-text";

import discogsData from "@/data/discogs-albums.json";

const albums = discogsData.albums;

export default function ScrambleHoverListPreview() {
  const setListRoot = useSuperHoverRef();

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col">
      <div
        ref={setListRoot}
        className="min-h-0 max-h-[min(380px,52vh)] w-full flex-1 overflow-y-auto overflow-x-hidden pr-2"
      >
        <div className="text-foreground grid w-full grid-cols-[minmax(0,46%)_minmax(0,42%)_minmax(0,12%)] text-base">
          {albums.map((album, index) => {
            const key = `${album.id}-${index}`;

            return (
              <ScrambleSuperListRow
                key={key}
                title={album.title}
                artist={album.artist}
                yearLabel={String(album.year ?? "—")}
                scrambleSpeed={45}
                maxIterations={10}
                useOriginalCharsOnly
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
