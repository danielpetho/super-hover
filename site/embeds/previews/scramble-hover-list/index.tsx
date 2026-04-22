"use client";

import * as React from "react";
import { createSuperHover } from "super-hover";
import { TextMorph } from "torph/react";

import ScrambleHover from "@/components/fancy/text/scramble-hover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import discogsData from "@/data/discogs-albums.json";

const albums = discogsData.albums;

type Album = (typeof albums)[number];

const ScrambleHoverRow = React.memo(function ScrambleHoverRow({
  album,
  rowId,
  superHoverOn,
  active,
}: {
  album: Album;
  rowId: string;
  superHoverOn: boolean;
  active: boolean;
}) {
  return (
    <div
      data-super-hover={superHoverOn ? true : undefined}
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
  const superHoverSwitchId = React.useId();
  const listRootRef = React.useRef<HTMLDivElement>(null);
  const [superHoverOn, setSuperHoverOn] = React.useState(true);
  const [activeRowId, setActiveRowId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!superHoverOn) {
      setActiveRowId(null);
    }
  }, [superHoverOn]);

  React.useEffect(() => {
    if (!superHoverOn) return;

    const root = listRootRef.current;
    if (!root) return;

    const onEnter = (e: Event) => {
      const t = e.target as HTMLElement | null;
      const id = t?.dataset.rowId;
      if (id) setActiveRowId(id);
    };

    const onLeave = (e: Event) => {
      const t = e.target as HTMLElement | null;
      const id = t?.dataset.rowId;
      if (!id) return;
      setActiveRowId((prev) => (prev === id ? null : prev));
    };

    root.addEventListener("superhoverenter", onEnter);
    root.addEventListener("superhoverleave", onLeave);

    const stop = createSuperHover({ root });

    return () => {
      root.removeEventListener("superhoverenter", onEnter);
      root.removeEventListener("superhoverleave", onLeave);
      stop();
    };
  }, [superHoverOn]);

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col gap-2">
      <div className="flex shrink-0 items-center justify-end gap-2.5 px-2 pt-2">
        <label
          htmlFor={superHoverSwitchId}
          className="cursor-pointer select-none pb-0.5 text-base text-foreground"
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
          aria-label="Toggle super hover"
        />
      </div>

      <div
        ref={listRootRef}
        className="min-h-0 max-h-[min(380px,52vh)] w-full flex-1 overflow-y-auto overflow-x-hidden pr-2"
      >
        <div className="text-foreground grid w-full grid-cols-[minmax(0,46%)_minmax(0,42%)_minmax(0,12%)] text-base">
          {albums.map((album, index) => {
            const rowId = `${album.id}-${index}`;
            const active = superHoverOn && activeRowId === rowId;

            return (
              <ScrambleHoverRow
                key={rowId}
                album={album}
                rowId={rowId}
                superHoverOn={superHoverOn}
                active={active}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
