"use client";

import * as React from "react";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const MODE_LABEL_GRID =
  "inline-grid shrink-0 origin-center grid-cols-1 grid-rows-1 text-base select-none after:pointer-events-none after:col-start-1 after:row-start-1 after:invisible after:origin-center after:whitespace-nowrap after:font-medium after:content-[attr(data-ghost)]";

const MODE_LABEL_BTN =
  "group cursor-pointer rounded-sm border-0 bg-transparent p-0 font-inherit outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

type HoverModeSwitchProps = {
  className?: string;
  superHoverOn: boolean;
  onSuperHoverOnChange: (superHoverOn: boolean) => void;
};

export function HoverModeSwitch({
  className,
  superHoverOn,
  onSuperHoverOnChange,
}: HoverModeSwitchProps) {
  const switchId = React.useId();

  return (
    <div className={cn("flex w-full items-center px-2", className)}>
      <button
        type="button"
        aria-pressed={superHoverOn}
        className={cn(
          MODE_LABEL_BTN,
          "flex min-h-11 min-w-0 flex-1 basis-0 items-center justify-end py-2 pl-1 pr-3",
        )}
        onClick={() => onSuperHoverOnChange(true)}
      >
        <span data-ghost="Super hover" className={MODE_LABEL_GRID}>
          <span
            className={cn(
              "col-start-1 row-start-1 origin-center transition-[color,font-weight] duration-200 ease-out group-hover:text-foreground",
              superHoverOn
                ? "font-medium text-foreground"
                : "font-normal text-muted-foreground",
            )}
          >
            Super hover
          </span>
        </span>
      </button>
      <Switch
        id={switchId}
        className="relative z-10"
        checked={!superHoverOn}
        onCheckedChange={(checked) => onSuperHoverOnChange(!checked)}
        aria-label="Hover mode: Super hover when on, native when off"
      />
      <button
        type="button"
        aria-pressed={!superHoverOn}
        className={cn(
          MODE_LABEL_BTN,
          "flex min-h-11 min-w-0 flex-1 basis-0 items-center justify-start py-2 pl-3 pr-1",
        )}
        onClick={() => onSuperHoverOnChange(false)}
      >
        <span data-ghost="Native hover" className={MODE_LABEL_GRID}>
          <span
            className={cn(
              "col-start-1 row-start-1 origin-center transition-[color,font-weight] duration-200 ease-out group-hover:text-foreground",
              !superHoverOn
                ? "font-medium text-foreground"
                : "font-normal text-muted-foreground",
            )}
          >
            Native hover
          </span>
        </span>
      </button>
    </div>
  );
}
