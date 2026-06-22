"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
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

const MODE_LABEL_GRID =
  "inline-grid shrink-0 origin-center grid-cols-1 grid-rows-1 select-none before:pointer-events-none before:invisible before:col-start-1 before:row-start-1 before:origin-center before:whitespace-nowrap before:font-medium before:content-[attr(data-ghost)]";

const modeTransition = (reduced: boolean) =>
  reduced ? { duration: 0 } : { duration: 0.25, ease: "easeOut" as const };

export default function SweptHitTestGridPreview() {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const transition = modeTransition(Boolean(reduceMotion));
  const [mode, setMode] = React.useState<Mode>("swept");

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || mode === "native") return;

    const ctrl = createSuperHover({
      root,
      sweptHitTest: mode === "swept",
      sweptHitTestMargin: 100,
    });

    return () => ctrl.destroy();
  }, [mode]);

  return (
    <div className="flex h-[min(28rem,70vh)] w-full flex-col bg-background">
      <div className="flex items-center justify-center gap-4 px-4 py-3">
        {MODES.map((m) => {
          const active = mode === m.value;

          return (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              aria-pressed={active}
              className="h-auto cursor-pointer rounded-none border-0 bg-transparent px-0 py-1 text-base text-muted-foreground shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span data-ghost={m.label} className={MODE_LABEL_GRID}>
                <motion.span
                  className="col-start-1 row-start-1 inline-block origin-center"
                  initial={false}
                  whileHover={{
                    fontVariationSettings: "'wght' 500",
                    color: "var(--foreground)",
                    transition,
                  }}
                  animate={{
                    fontVariationSettings: active ? "'wght' 500" : "'wght' 400",
                    color: active
                      ? "var(--foreground)"
                      : "var(--muted-foreground)",
                    transition,
                  }}
                >
                  {m.label}
                </motion.span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        ref={rootRef}
        className="min-h-0 flex-1 overflow-auto overscroll-contain! border-border border-[0.5px] rounded-2xl"
      >
        <div
          className="grid w-max"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(2rem, 2rem))`,
          }}
        >
          {cells.map((index) => (
            <span
              key={index}
              data-super-hover={mode !== "native" ? "" : undefined}
              aria-label={`Cell ${index + 1}`}
              className={cn(
                "relative size-8 overflow-hidden will-change-scroll shadow-[inset_0_0_0_1px_rgb(0_0_0/0.05)] before:absolute before:inset-0 before:bg-blue-500 before:opacity-0 before:transition-opacity before:duration-200 before:ease-out dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]",
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
