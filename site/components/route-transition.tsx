import { ViewTransition } from "react";
import type * as React from "react";

export function RouteTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ default: "route-blur-fade" }}
      exit={{ default: "route-blur-fade" }}
    >
      {children}
    </ViewTransition>
  );
}
