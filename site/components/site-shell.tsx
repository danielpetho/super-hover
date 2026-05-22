"use client";

import { usePathname } from "next/navigation";

import { DocSiteFooter } from "@/components/doc-site-footer";
import { RouteTransition } from "@/components/route-transition";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showFooter = pathname !== "/demo-1";

  return (
    <RouteTransition>
      <>
        {children}
        {showFooter ? <DocSiteFooter className="pb-12" /> : null}
      </>
    </RouteTransition>
  );
}
