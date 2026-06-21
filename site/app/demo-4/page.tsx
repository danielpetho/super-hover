"use client";

import * as React from "react";
import { useSuperHoverRef } from "super-hover/react";
import type {
  SuperHoverEnterEvent,
  SuperHoverLeaveEvent,
} from "super-hover/react";

import graphicsData from "@/data/graphics-x-design.json";
import { cn } from "@/lib/utils";

const items = graphicsData.items;

const IMAGE_SLOT_WIDTH = "18rem";

const DemoRow = React.memo(function DemoRow({
  displayId,
  filename,
  by,
  image,
}: {
  displayId: string;
  filename: string;
  by: string;
  image: string;
}) {
  return (
    <div
      data-super-hover
      data-image={image}
      className={cn(
        "relative isolate grid w-full grid-cols-[4rem_minmax(0,55%)_minmax(0,1fr)] items-center gap-x-8 py-1 text-red-500",
        "transition-[color,background-color,opacity] will-change-[color,background-color,opacity] duration-300 ease-out",
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-red-500 before:opacity-0",
        "before:transition-opacity before:duration-300 before:ease-out",
        "[&[data-super-hover-active]]:text-white",
        "[&[data-super-hover-active]]:transition-none",
        "[&[data-super-hover-active]]:before:opacity-100",
        "[&[data-super-hover-active]]:before:transition-none",
      )}
    >
      <div className="tabular-nums">{displayId}</div>
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
    sweptHitTest: true,
    onEnter: (event: SuperHoverEnterEvent) => {
      const row = event.detail.current;
      if (!(row instanceof HTMLElement)) return;
      const image = row.dataset.image;
      if (!image) return;

      requestAnimationFrame(() => {
        if (!row.isConnected || !row.hasAttribute("data-super-hover-active")) {
          return;
        }

        const img = imageRef.current;
        if (!img) return;
        if (img.src !== image) img.src = image;
        img.style.opacity = "1";
      });
    },
    onLeave: (event: SuperHoverLeaveEvent) => {
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
    <main className="flex h-svh w-full items-center justify-start overflow-hidden bg-white py-4 font-mono text-red pl-12 sm:py-6 lg:pr-0 uppercase">
      <div className="relative h-[min(45rem,90svh)] min-h-0 w-full max-w-[min(80rem,calc(100vw-4rem))]">
        <div
          ref={setListRef}
          className="h-full cursor-pointer overflow-auto"
          style={{ paddingLeft: IMAGE_SLOT_WIDTH }}
        >
          <div className="flex w-full flex-col text-xs sm:text-sm">
            {items.map((item, index) => (
              <DemoRow
                key={item.id}
                displayId={String(index + 1).padStart(3, "0")}
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
          className="pointer-events-none absolute top-0 left-0 z-30 size-44 object-cover opacity-0 sm:size-64"
        />
      </div>
    </main>
  );
}
