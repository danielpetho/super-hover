"use client";

import * as React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export interface ScrambleHoverProps extends React.ComponentPropsWithoutRef<
  typeof motion.span
> {
  text: string;
  scrambleSpeed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: "start" | "end" | "center";
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  scrambledClassName?: string;
  /**
   * When set, scramble is driven by this flag instead of pointer hover
   * (e.g. `superhoverenter` / `superhoverleave`).
   */
  active?: boolean;
}

const ScrambleHover: React.FC<ScrambleHoverProps> = ({
  text,
  scrambleSpeed = 50,
  maxIterations = 10,
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
  className,
  scrambledClassName,
  sequential = false,
  revealDirection = "start",
  active: controlledActive,
  ...props
}) => {
  const [displayText, setDisplayText] = React.useState(text);
  const [isHovering, setIsHovering] = React.useState(false);
  const [isScrambling, setIsScrambling] = React.useState(false);
  const [revealedIndices, setRevealedIndices] = React.useState(
    () => new Set<number>(),
  );
  const hasPerCharStyling = Boolean(scrambledClassName);

  const isEngaged =
    controlledActive !== undefined
      ? controlledActive || isScrambling
      : isHovering;

  React.useEffect(() => {
    setDisplayText(text);
    if (hasPerCharStyling) {
      setRevealedIndices(new Set());
    }
  }, [text]);

  React.useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let currentIteration = 0;
    const revealed = new Set<number>();

    const availableChars = useOriginalCharsOnly
      ? Array.from(new Set(text.split(""))).filter((char) => char !== " ")
      : characters.split("");

    const getNextIndex = () => {
      const textLength = text.length;
      switch (revealDirection) {
        case "start":
          return revealed.size;
        case "end":
          return textLength - 1 - revealed.size;
        case "center": {
          const middle = Math.floor(textLength / 2);
          const offset = Math.floor(revealed.size / 2);
          const nextIndex =
            revealed.size % 2 === 0 ? middle + offset : middle - offset - 1;

          if (
            nextIndex >= 0 &&
            nextIndex < textLength &&
            !revealed.has(nextIndex)
          ) {
            return nextIndex;
          }

          for (let i = 0; i < textLength; i++) {
            if (!revealed.has(i)) return i;
          }
          return 0;
        }
        default:
          return revealed.size;
      }
    };

    const shuffleText = (source: string) => {
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

        for (let i = nonSpaceChars.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nonSpaceChars[i], nonSpaceChars[j]] = [
            nonSpaceChars[j]!,
            nonSpaceChars[i]!,
          ];
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
          return availableChars[
            Math.floor(Math.random() * availableChars.length)
          ]!;
        })
        .join("");
    };

    if (!isEngaged) {
      setDisplayText(text);
      revealed.clear();
      if (hasPerCharStyling) {
        setRevealedIndices(new Set());
      }
      setIsScrambling(false);
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }

    setIsScrambling(true);
    // Apply first frame immediately so hover feels instant.
    const step = () => {
      if (sequential) {
        if (revealed.size < text.length) {
          const nextIndex = getNextIndex();
          revealed.add(nextIndex);
          if (hasPerCharStyling) {
            setRevealedIndices(new Set(revealed));
          }
          setDisplayText(shuffleText(text));
        } else {
          if (intervalId) clearInterval(intervalId);
          setIsScrambling(false);
        }
      } else {
        setDisplayText(shuffleText(text));
        currentIteration += 1;
        if (currentIteration >= maxIterations) {
          if (intervalId) clearInterval(intervalId);
          setIsScrambling(false);
          setDisplayText(text);
        }
      }
    };

    step();
    intervalId = setInterval(step, scrambleSpeed);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    isEngaged,
    text,
    characters,
    scrambleSpeed,
    useOriginalCharsOnly,
    sequential,
    revealDirection,
    maxIterations,
    hasPerCharStyling,
  ]);

  const usePointerHover = controlledActive === undefined;

  return (
    <motion.span
      onHoverStart={usePointerHover ? () => setIsHovering(true) : undefined}
      onHoverEnd={usePointerHover ? () => setIsHovering(false) : undefined}
      className={cn(
        "block min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap",
        className,
      )}
      {...props}
    >
      <span className="sr-only">{displayText}</span>
      {hasPerCharStyling ? (
        <span aria-hidden="true" className="inline-block min-w-0 max-w-full">
          {displayText.split("").map((char, index) => (
            <span
              key={index}
              className={cn(
                revealedIndices.has(index) || !isScrambling || !isEngaged
                  ? undefined
                  : scrambledClassName,
              )}
            >
              {char}
            </span>
          ))}
        </span>
      ) : (
        <span aria-hidden="true" className="inline-block min-w-0 max-w-full">
          {displayText}
        </span>
      )}
    </motion.span>
  );
};

export default React.memo(ScrambleHover);
