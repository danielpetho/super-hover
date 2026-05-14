"use client";

import * as React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

const TRACK_W = 36;
const TRACK_H = 20;
const TRACK_PAD = 2;
const THUMB_H = TRACK_H - TRACK_PAD * 2;
const THUMB_W = THUMB_H;
const THUMB_TRAVEL = TRACK_W - TRACK_PAD * 2.75 - THUMB_W;

const spring = {
  type: "spring" as const,
  stiffness: 620,
  damping: 30,
};

export type SwitchProps = Omit<
  React.ComponentProps<"button">,
  "role" | "onClick"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

function Switch({
  className,
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  id,
  ...props
}: SwitchProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked);
  const isControlled = checkedProp !== undefined;
  const checked = isControlled ? checkedProp : uncontrolled;

  const toggle = React.useCallback(() => {
    if (disabled) return;
    const next = !checked;
    if (!isControlled) setUncontrolled(next);
    onCheckedChange?.(next);
  }, [checked, disabled, isControlled, onCheckedChange]);

  return (
    <button
      data-slot="switch"
      id={id}
      type="button"
      role="switch"
      disabled={disabled}
      aria-checked={checked}
      onClick={toggle}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent outline-none transition-colors duration-200 ease-out",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        checked ? "bg-neutral-300 dark:bg-neutral-600" : "bg-neutral-300 dark:bg-neutral-600",
        className,
      )}
      style={{ width: TRACK_W, height: TRACK_H, padding: TRACK_PAD }}
      {...props}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none block rounded-full bg-white shadow-sm "
        style={{
          width: THUMB_W,
          height: THUMB_H,
          minWidth: THUMB_W,
          minHeight: THUMB_H,
        }}
        animate={{ x: checked ? THUMB_TRAVEL : 0 }}
        transition={spring}
      />
    </button>
  );
}

export { Switch };
