"use client";

import { useSandpackConsole } from "@codesandbox/sandpack-react";
import { useEffect } from "react";

type ConsoleMessage = {
  id: string;
  method?: string;
  data?: unknown[];
};

function formatConsoleValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null ||
    value === undefined
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function getLogClassName(method: string): string {
  if (method === "error") {
    return "min-w-max border-b-[0.5px] border-red-500/10 bg-red-500/10 px-3 py-1.5 text-red-600 dark:text-red-300";
  }

  if (method === "warn") {
    return "min-w-max border-b-[0.5px] border-yellow-500/10 bg-yellow-500/10 px-3 py-1.5 text-yellow-700 dark:text-yellow-300";
  }

  return "min-w-max border-b-[0.5px] border-neutral-200 px-3 py-1.5 text-foreground dark:border-editor-border";
}

export function SandboxConsole({
  onLogsChange,
}: {
  onLogsChange: (count: number) => void;
}) {
  const client = useSandpackConsole({
    resetOnPreviewRestart: false,
    showSyntaxError: true,
  });
  const clientLogs = client.logs as ConsoleMessage[];
  const logCount = clientLogs.length;

  useEffect(() => {
    onLogsChange(logCount);
  }, [logCount, onLogsChange]);

  function clear(): void {
    client.reset();
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-editor-bg text-[11px] leading-5">
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain pb-12 font-mono">
        {clientLogs.map((log) => {
          const method = log.method ?? "log";
          const message =
            method === "clear"
              ? "Console was cleared"
              : (log.data ?? []).map(formatConsoleValue).join(" ");

          return (
            <div className={getLogClassName(method)} key={log.id}>
              <span className="mr-2 uppercase text-muted-foreground">
                {method}
              </span>
              <span>{message}</span>
            </div>
          );
        })}
      </div>
      <button
        className="absolute right-3 bottom-3 cursor-pointer rounded-md bg-background/90 px-2.5 py-1 text-[11px] text-muted-foreground ring-[0.5px] ring-black/10 backdrop-blur transition-colors transition-[transform,background-color] hover:bg-neutral-100 hover:text-foreground active:scale-[0.96] dark:bg-neutral-900/90 dark:ring-white/10 dark:hover:bg-neutral-800"
        onClick={clear}
        type="button"
      >
        Clear
      </button>
    </div>
  );
}
