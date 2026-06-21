"use client";

import * as React from "react";
import { createSuperHover } from "super-hover";

import { cn } from "@/lib/utils";

const ROWS = 60;
const COLS = 80;
const cells = Array.from({ length: ROWS * COLS }, (_, index) => index);

type Mode = "native" | "super-hover" | "swept";

const MODES: { value: Mode; label: string }[] = [
  { value: "native", label: "Native hover" },
  { value: "super-hover", label: "Super hover" },
  { value: "swept", label: "Super hover + swept" },
];

export default function SweptHitTestGridPreview() {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [mode, setMode] = React.useState<Mode>("swept");

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || mode === "native") return;

    const ctrl = createSuperHover({
      root,
      sweptHitTest: mode === "swept",
      sweptHitTestMargin: 1600,
    });

    return () => ctrl.destroy();
  }, [mode]);

  return (
    <div className="flex h-[min(28rem,70vh)] w-full flex-col bg-background">
      <div className="flex items-center justify-center gap-2 px-4 py-3">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            aria-pressed={mode === m.value}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              mode === m.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div
        ref={rootRef}
        className="min-h-0 flex-1 overflow-auto overscroll-contain! border-border border-[0.5px] rounded-2xl"
      >
        <div
          className="grid w-max"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(1.25rem, 1.25rem))`,
          }}
        >
          {cells.map((index) => (
            <span
              key={index}
              data-super-hover={mode !== "native" ? "" : undefined}
              aria-label={`Cell ${index + 1}`}
              className={cn(
                "relative size-5 overflow-hidden shadow-[inset_0_0_0_1px_rgb(0_0_0/0.05)] before:absolute before:inset-0 before:bg-blue-500 before:opacity-0 before:transition-opacity before:duration-300 before:ease-out dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]",
                mode === "native"
                  ? "hover:before:duration-0 hover:before:opacity-100"
                  : "data-super-hover-active:before:duration-0 data-super-hover-active:before:opacity-100",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
