"use client";

import * as React from "react";
import { SoundProvider } from "@web-kits/audio/react";
import { usePathname } from "next/navigation";

import { DocSiteFooter } from "@/components/doc-site-footer";
import { RouteTransition } from "@/components/route-transition";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showFooter = !pathname.startsWith("/demo-");
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [volume, setVolume] = React.useState(8.0);

  return (
    <SoundProvider
      enabled={soundEnabled}
      volume={volume}
      onEnabledChange={setSoundEnabled}
      onVolumeChange={setVolume}
    >
      <RouteTransition>
        <>
          {children}
          {showFooter ? <DocSiteFooter className="pb-12" /> : null}
        </>
      </RouteTransition>
    </SoundProvider>
  );
}
