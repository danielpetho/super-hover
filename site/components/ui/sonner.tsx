"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            "border-border border-[0.5px] bg-background text-foreground shadow-2xl rounded-xl!",
          title: "text-sm font-medium",
          icon: "text-foreground",
        },
      }}
    />
  );
}
