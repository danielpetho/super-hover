"use client";

import * as React from "react";
import { Check, Mail } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { toast } from "sonner";

import { mdxAnchorClassName } from "@/lib/mdx-anchor-class";
import { cn } from "@/lib/utils";

const mailIconVariants: Variants = {
  idle: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", duration: 0.3, bounce: 0 },
  },
  copied: {
    opacity: 0,
    scale: 0.25,
    filter: "blur(4px)",
    transition: { type: "spring", duration: 0.3, bounce: 0 },
  },
};

const checkIconVariants: Variants = {
  idle: {
    opacity: 0,
    scale: 0.25,
    filter: "blur(4px)",
    transition: { type: "spring", duration: 0.3, bounce: 0 },
  },
  copied: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", duration: 0.3, bounce: 0 },
  },
};

export function MailTo({
  email,
  children,
  className,
}: {
  email: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast("Email copied", {
        icon: <Check className="size-4" />,
        description: email,
      });
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy email");
    }
  }

  return (
    <button
      type="button"
      className={cn(
        mdxAnchorClassName(),
        "cursor-pointer border-0 bg-transparent p-0",
        className,
      )}
      onClick={copyEmail}
      aria-label={`Copy email address ${email}`}
    >
      {children ?? email}
      <span className="relative ml-1 mt-[1.5px] inline-flex size-[13px] items-center justify-center">
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 inline-flex items-center justify-center"
          animate={copied ? "copied" : "idle"}
          variants={mailIconVariants}
        >
          <Mail size={13} strokeWidth={2.5} />
        </motion.span>
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 inline-flex items-center justify-center"
          animate={copied ? "copied" : "idle"}
          variants={checkIconVariants}
        >
          <Check size={13} strokeWidth={2.5} />
        </motion.span>
      </span>
    </button>
  );
}
