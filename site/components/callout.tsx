import React from "react";
import { cn } from "@/lib/utils";
import { docSnippetSurfaceClasses } from "@/lib/doc-snippet-surface";
import { Info, TriangleAlert } from "lucide-react";

interface CalloutProps {
  children: React.ReactNode;
  variant?: "info" | "warning" | "neutral";
  badge?: {
    type: "icon" | "badge";
    content?: React.ReactNode;
  };
  className?: string;
}

export function Callout({
  children,
  variant = "info",
  badge,
  className,
}: CalloutProps) {
  const baseClasses = "rounded-2xl p-6 relative";

  const variantClasses = {
    info: "bg-blue-50",
    warning: "bg-red-50 border border-red-200",
  };

  const getIcon = () => {
    if (variant === "warning") {
      return <TriangleAlert size={20} />;
    }
    return (
      <Info size={20} className="w-9 h-9 rounded-full p-1.5 border-none" />
    );
  };

  if (variant === "neutral" && badge?.type === "icon") {
    return (
      <div className={cn("relative p-5", docSnippetSurfaceClasses, className)}>
        <div className="flex gap-3">
          <Info
            className="mt-[3px] size-[16px] shrink-0 text-neutral-600 dark:text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
          <div
            className={cn(
              "min-w-0 text-sm leading-5 text-pretty text-neutral-700 dark:text-muted-foreground",
              "[&_code]:rounded-md [&_code]:border [&_code]:border-neutral-200 [&_code]:bg-editor-bg [&_code]:px-1.5 [&_code]:py-px [&_code]:font-fira-mono [&_code]:text-[13px] [&_code]:text-neutral-800 [&_code]:dark:border-editor-border [&_code]:dark:text-neutral-200",
              "[&_p]:m-0",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "neutral") {
    return (
      <div className={cn("relative p-6", docSnippetSurfaceClasses, className)}>
        <div className="text-[15px] leading-relaxed text-neutral-700 dark:text-muted-foreground [&_p]:m-0">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      {badge && (
        <div className="absolute -top-4 -right-3">
          {badge.type === "badge" ? (
            <span
              className={cn(
                "inline-flex items-center px-3 py-1 rounded-lg text-base font-medium",
                variant === "info"
                  ? "bg-blue-200 text-blue"
                  : "bg-red-100 text-red-800",
              )}
            >
              {badge.content}
            </span>
          ) : (
            <div
              className={cn(
                "flex items-center justify-center rounded-full",
                variant === "info" ? "text-blue bg-blue-200" : "text-red-600",
              )}
            >
              {getIcon()}
            </div>
          )}
        </div>
      )}
      <div
        className={cn(
          variant === "info"
            ? "text-blue [&_code]:border-none [&_code]:bg-blue-200"
            : "text-red-800 [&_code]:border-none",
        )}
      >
        {children}
      </div>
    </div>
  );
}
