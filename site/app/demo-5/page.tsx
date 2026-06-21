"use client";

import * as React from "react";

import graphicsData from "@/data/graphics-x-design.json";
import { cn } from "@/lib/utils";

const galleryItems = graphicsData.items.slice(0, 120);
const railItems = Array.from({ length: 3 }, () => galleryItems).flat();

const ITEM_WIDTH_PX = 240;
const ITEM_GAP_PX = 0;
const PROXIMITY_RADIUS_PX = 1000;

type GalleryItem = (typeof galleryItems)[number];

type ActiveItem = Pick<GalleryItem, "id" | "filename" | "by">;

function wrapOffset(value: number, length: number): number {
  if (length <= 0) return 0;
  return ((value % length) + length) % length;
}

function proximityHeight(distance: number): number {
  const influence = Math.max(0, 1 - distance / PROXIMITY_RADIUS_PX);
  return 18 + influence * influence * 8;
}

export default function DemoFivePage() {
  const railRef = React.useRef<HTMLDivElement>(null);
  const offsetRef = React.useRef(0);
  const pointerRef = React.useRef({ x: 0, y: 0, active: false });
  const frameRef = React.useRef<number | null>(null);
  const [activeItem, setActiveItem] = React.useState<ActiveItem>(
    galleryItems[0],
  );

  const updateRail = React.useCallback(() => {
    frameRef.current = null;

    const rail = railRef.current;
    if (!rail) return;

    const segmentWidth = galleryItems.length * (ITEM_WIDTH_PX + ITEM_GAP_PX);
    const wrappedOffset = wrapOffset(offsetRef.current, segmentWidth);
    rail.style.transform = `translate3d(${-segmentWidth - wrappedOffset}px, 0, 0)`;

    const pointer = pointerRef.current;
    let closestIndex = -1;
    let closestDistance = Number.POSITIVE_INFINITY;

    rail.querySelectorAll<HTMLElement>("[data-gallery-index]").forEach((item) => {
      const rect = item.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight * 0.78;
      const targetX = pointer.active ? pointer.x : viewportCenterX;
      const targetY = pointer.active ? pointer.y : viewportCenterY;
      const distance = Math.hypot(centerX - targetX, centerY - targetY);
      const height = proximityHeight(distance);

      item.style.setProperty("--proximity-height", `${height.toFixed(2)}rem`);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = Number(item.dataset.galleryIndex);
      }
    });

    if (closestIndex >= 0 && closestDistance < PROXIMITY_RADIUS_PX * 1.65) {
      const nextItem = galleryItems[closestIndex];
      setActiveItem((current) =>
        current.id === nextItem.id ? current : nextItem,
      );
    }
  }, []);

  const requestRailUpdate = React.useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(updateRail);
  }, [updateRail]);

  React.useEffect(() => {
    pointerRef.current.x = window.innerWidth / 2;
    pointerRef.current.y = window.innerHeight * 0.78;
    requestRailUpdate();

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      offsetRef.current += event.deltaX + event.deltaY;
      requestRailUpdate();
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current = {
        x: event.clientX,
        y: event.clientY,
        active: true,
      };
      requestRailUpdate();
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
      requestRailUpdate();
    };

    const handleResize = () => {
      requestRailUpdate();
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", handleResize);

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [requestRailUpdate]);

  return (
    <main className="relative h-svh w-full overflow-hidden bg-white font-mono uppercase text-red-500 antialiased">
      <section
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 top-[36%] z-20 mx-auto flex max-w-[min(68rem,calc(100vw-2rem))] -translate-y-1/2 flex-col items-center text-center"
      >
        <h1 className="max-w-full truncate text-[clamp(1.8rem,6vw,6.5rem)] leading-[0.9] tracking-normal text-wrap-balance">
          {activeItem.by}
        </h1>
        <p className="mt-4 max-w-full truncate text-xs leading-none tracking-normal text-red-500/70 sm:text-sm">
          {activeItem.filename}
        </p>
      </section>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 h-[31rem] overflow-hidden sm:h-[33rem]">
        <div className="absolute inset-x-0 bottom-0 h-px bg-red-500/25" />
        <div
          ref={railRef}
          className="absolute bottom-0 left-0 flex items-end gap-0 px-0 will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          {railItems.map((item, index) => {
            const galleryIndex = index % galleryItems.length;

            return (
              <figure
                key={`${item.id}-${index}`}
                data-gallery-index={galleryIndex}
                className={cn(
                  "relative h-[var(--proximity-height,15rem)] w-[15rem] shrink-0 overflow-hidden bg-white",
                  "transition-[height] duration-300 ease-out",
                )}
              >
                <img
                  src={item.image}
                  alt=""
                  className="h-full w-full object-cover"
                  decoding="async"
                  draggable={false}
                  loading="lazy"
                />
              </figure>
            );
          })}
        </div>
      </div>
    </main>
  );
}
