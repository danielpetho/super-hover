"use client";

import * as React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

type ScrambleParams = {
  scrambleSpeed?: number;
  maxIterations?: number;
  useOriginalCharsOnly?: boolean;
  characters?: string;
};

/**
 * `revealed` stays empty in non-sequential mode, matching `ScrambleHover`.
 */
function buildShuffle(
  useOriginalCharsOnly: boolean,
  characters: string,
  textForCharPool: string,
): (source: string) => string {
  const revealed = new Set<number>();
  const availableChars = useOriginalCharsOnly
    ? Array.from(new Set(textForCharPool.split(""))).filter((c) => c !== " ")
    : characters.split("");

  return (source: string) => {
    if (useOriginalCharsOnly) {
      const positions = source.split("").map((char, i) => ({
        char,
        isSpace: char === " ",
        index: i,
        isRevealed: revealed.has(i),
      }));
      const nonSpaceChars = positions
        .filter((p) => !p.isSpace && !p.isRevealed)
        .map((p) => p.char);
      for (let i = nonSpaceChars.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [nonSpaceChars[i], nonSpaceChars[j]] = [nonSpaceChars[j]!, nonSpaceChars[i]!];
      }
      let charIndex = 0;
      return positions
        .map((p) => {
          if (p.isSpace) return " ";
          if (p.isRevealed) return source[p.index]!;
          return nonSpaceChars[charIndex++]!;
        })
        .join("");
    }
    return source
      .split("")
      .map((char, i) => {
        if (char === " ") return " ";
        if (revealed.has(i)) return source[i]!;
        return availableChars[Math.floor(Math.random() * availableChars.length)]!;
      })
      .join("");
  };
}

type ListRowProps = {
  title: string;
  artist: string;
  yearLabel: string;
} & ScrambleParams;

/**
 * Three text columns, one `superhoverenter` / `superhoverleave` pair for the whole row, three
 * independent non-sequential scrambles (DOM `textContent` only).
 */
export function ScrambleSuperListRow({
  title,
  artist,
  yearLabel,
  scrambleSpeed = 50,
  maxIterations = 10,
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
}: ListRowProps) {
  const rowRef = React.useRef<HTMLDivElement | null>(null);
  const tVis = React.useRef<HTMLSpanElement | null>(null);
  const tSr = React.useRef<HTMLSpanElement | null>(null);
  const aVis = React.useRef<HTMLSpanElement | null>(null);
  const aSr = React.useRef<HTMLSpanElement | null>(null);
  const yVis = React.useRef<HTMLSpanElement | null>(null);
  const ySr = React.useRef<HTMLSpanElement | null>(null);

  const texts = [title, artist, yearLabel] as const;
  const vis = [tVis, aVis, yVis] as const;
  const sr = [tSr, aSr, ySr] as const;

  React.useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const n = 3;
    const visEls = vis.map((r) => r.current);
    if (visEls.some((v) => !v)) return;

    const shufflers = [
      buildShuffle(useOriginalCharsOnly, characters, title),
      buildShuffle(useOriginalCharsOnly, characters, artist),
      buildShuffle(useOriginalCharsOnly, characters, yearLabel),
    ];

    const setBoths = [0, 1, 2].map(
      (i) => (s: string) => {
        visEls[i]!.textContent = s;
        const srel = sr[i]!.current;
        if (srel) srel.textContent = s;
      },
    );

    const intervalIds: (ReturnType<typeof setInterval> | undefined)[] = [
      undefined,
      undefined,
      undefined,
    ];

    const onEnter = () => {
      for (let c = 0; c < n; c += 1) {
        if (intervalIds[c] !== undefined) {
          clearInterval(intervalIds[c]!);
          intervalIds[c] = undefined;
        }
      }

      for (let i = 0; i < n; i += 1) {
        const t = texts[i]!;
        const sh = shufflers[i]!;
        let currentIteration = 0;
        const step = () => {
          setBoths[i]!(sh(t));
          currentIteration += 1;
          if (currentIteration >= maxIterations) {
            if (intervalIds[i] !== undefined) {
              clearInterval(intervalIds[i]!);
              intervalIds[i] = undefined;
            }
            setBoths[i]!(t);
          }
        };
        step();
        if (currentIteration < maxIterations) {
          intervalIds[i] = setInterval(step, scrambleSpeed);
        }
      }
    };

    const onLeave = () => {
      for (let c = 0; c < n; c += 1) {
        if (intervalIds[c] !== undefined) {
          clearInterval(intervalIds[c]!);
          intervalIds[c] = undefined;
        }
        setBoths[c]!(texts[c]!);
      }
    };

    row.addEventListener("superhoverenter", onEnter);
    row.addEventListener("superhoverleave", onLeave);

    return () => {
      for (let c = 0; c < n; c += 1) {
        if (intervalIds[c] !== undefined) {
          clearInterval(intervalIds[c]!);
        }
      }
      row.removeEventListener("superhoverenter", onEnter);
      row.removeEventListener("superhoverleave", onLeave);
    };
  }, [
    title,
    artist,
    yearLabel,
    scrambleSpeed,
    maxIterations,
    useOriginalCharsOnly,
    characters,
  ]);

  return (
    <div
      ref={rowRef}
      data-super-hover
      className={cn(
        "col-span-3 grid cursor-default select-none grid-cols-subgrid gap-x-3 border-y border-transparent py-1.5",
        "[&[data-super-hover-active]]:border-y-black",
      )}
    >
      <div className="min-w-0 pl-3">
        <motion.span className="block min-w-0 max-w-full overflow-hidden text-ellipsis text-left whitespace-nowrap">
          <span className="sr-only" ref={tSr}>
            {title}
          </span>
          <span
            ref={tVis}
            aria-hidden
            className="inline-block min-w-0 max-w-full"
          >
            {title}
          </span>
        </motion.span>
      </div>
      <div className="min-w-0">
        <motion.span className="block min-w-0 max-w-full overflow-hidden text-ellipsis text-left  whitespace-nowrap">
          <span className="sr-only" ref={aSr}>
            {artist}
          </span>
          <span
            ref={aVis}
            aria-hidden
            className="inline-block min-w-0 max-w-full"
          >
            {artist}
          </span>
        </motion.span>
      </div>
      <div className="min-w-0 pr-3 text-right">
        <motion.span className="block min-w-0 max-w-full overflow-hidden text-ellipsis text-right tabular-nums whitespace-nowrap">
          <span className="sr-only" ref={ySr}>
            {yearLabel}
          </span>
          <span
            ref={yVis}
            aria-hidden
            className="inline-block min-w-0 max-w-full"
          >
            {yearLabel}
          </span>
        </motion.span>
      </div>
    </div>
  );
}

type Props = {
  text: string;
} & ScrambleParams & { className?: string };

/**
 * One cell: same *look* as `ScrambleHover` in non-sequential mode, but the animation only updates
 * `textContent` (no per-frame `setState`). List rows should use `ScrambleSuperListRow` so
 * the row has a single `superhoverenter` / `superhoverleave` pair.
 */
export function ScrambleSuperRowText({
  text,
  scrambleSpeed = 50,
  maxIterations = 10,
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
  className,
  ...rest
}: Props & Omit<React.ComponentPropsWithoutRef<typeof motion.span>, keyof Props>) {
  const visRef = React.useRef<HTMLSpanElement | null>(null);
  const srRef = React.useRef<HTMLSpanElement | null>(null);

  React.useLayoutEffect(() => {
    const vis = visRef.current;
    const sr = srRef.current;
    if (!vis) return;
    const row = vis.closest<HTMLElement>("[data-super-hover]");
    if (!row) return;

    const shuffleText = buildShuffle(
      useOriginalCharsOnly,
      characters,
      text,
    );

    const setBoth = (s: string) => {
      vis.textContent = s;
      if (sr) sr.textContent = s;
    };

    let intervalId: ReturnType<typeof setInterval> | undefined;

    const onEnter = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
      let currentIteration = 0;
      const step = () => {
        setBoth(shuffleText(text));
        currentIteration += 1;
        if (currentIteration >= maxIterations) {
          if (intervalId !== undefined) {
            clearInterval(intervalId);
            intervalId = undefined;
          }
          setBoth(text);
        }
      };
      step();
      if (currentIteration < maxIterations) {
        intervalId = setInterval(step, scrambleSpeed);
      }
    };

    const onLeave = () => {
      // if (intervalId !== undefined) {
      //   clearInterval(intervalId);
      //   intervalId = undefined;
      // }
      // setBoth(text);
    };

    row.addEventListener("superhoverenter", onEnter);
    row.addEventListener("superhoverleave", onLeave);

    return () => {
      if (intervalId !== undefined) clearInterval(intervalId);
      row.removeEventListener("superhoverenter", onEnter);
      row.removeEventListener("superhoverleave", onLeave);
    };
  }, [text, characters, scrambleSpeed, maxIterations, useOriginalCharsOnly]);

  return (
    <motion.span
      className={cn(
        "block min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap",
        className,
      )}
      {...rest}
    >
      <span className="sr-only" ref={srRef}>
        {text}
      </span>
      <span
        ref={visRef}
        aria-hidden
        className="inline-block min-w-0 max-w-full"
      >
        {text}
      </span>
    </motion.span>
  );
}

export default ScrambleSuperRowText;
