"use client";

import * as React from "react";
import { useSuperHoverRef } from "super-hover/react";

import graphicsData from "@/data/graphics-x-design.json";
import { cn } from "@/lib/utils";

const items = graphicsData.items;

const IMAGE_SLOT_WIDTH = "18rem";

function imageFromRow(row: Element | null): string | null {
  if (!(row instanceof HTMLElement)) return null;
  return row.dataset.image ?? null;
}

const DemoRow = React.memo(function DemoRow({
  filename,
  by,
  image,
}: {
  filename: string;
  by: string;
  image: string;
}) {
  return (
    <div
      data-super-hover
      data-image={image}
      className={cn(
        "relative isolate grid w-full grid-cols-[minmax(0,60%)_minmax(0,1fr)] items-center gap-x-12 py-1 text-white",
        "transition-[colors,background-color,opacity] will-change-colors duration-1000 ease-out",
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-white before:opacity-0",
        "before:transition-opacity before:duration-1000 before:ease-out",
        "[&[data-super-hover-active]]:text-black",
        "[&[data-super-hover-active]]:transition-none",
        "[&[data-super-hover-active]]:before:opacity-100",
        "[&[data-super-hover-active]]:before:transition-none",
      )}
    >
      <div className="min-w-0 overflow-hidden">
        <div className="truncate">{filename}</div>
      </div>
      <div className="justify-self-end whitespace-nowrap">{by}</div>
    </div>
  );
});

export default function DemoFourPage() {
  const imageRef = React.useRef<HTMLImageElement>(null);

  const superHoverRef = useSuperHoverRef({
    onEnter: (event) => {
      const image = imageFromRow(event.detail.current);
      const img = imageRef.current;
      if (!img || !image) return;
      if (img.src !== image) img.src = image;
      img.style.opacity = "1";
    },
    onLeave: (event) => {
      if (event.detail.current) return;
      const img = imageRef.current;
      if (img) img.style.opacity = "0";
    },
  });

  const setListRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      superHoverRef(node);
    },
    [superHoverRef],
  );

  return (
    <main className="flex h-svh w-full items-center justify-start overflow-hidden bg-black py-4 font-mono text-white pl-12 sm:py-6 lg:pr-0 uppercase">
      <div className="relative h-[min(45rem,90svh)] min-h-0 w-full max-w-[min(80rem,calc(100vw-4rem))]">
        <div
          ref={setListRef}
          className="h-full cursor-pointer overflow-auto"
          style={{ paddingRight: IMAGE_SLOT_WIDTH }}
        >
          <div className="flex w-full flex-col text-xs sm:text-sm">
            {items.map((item) => (
              <DemoRow
                key={item.id}
                filename={item.filename}
                by={item.by}
                image={item.image}
              />
            ))}
          </div>
        </div>

        <img
          ref={imageRef}
          alt=""
          src={items[0]?.image ?? ""}
          className="pointer-events-none absolute top-0 right-0 z-30 size-44 object-cover opacity-0 sm:size-64"
        />
      </div>
    </main>
  );
}
