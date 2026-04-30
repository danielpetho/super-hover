"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Long, eased scroll — browser `smooth` is too fast to tune. */
const SCROLL_DURATION_MS = 500;

function getScrollPaddingTopPx(): number {
  const raw = getComputedStyle(document.documentElement).scrollPaddingTop;
  const px = parseFloat(raw);
  return Number.isFinite(px) ? px : 112;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function smoothScrollToElement(el: HTMLElement, durationMs: number) {
  const padding = getScrollPaddingTopPx();
  const targetY = el.getBoundingClientRect().top + window.scrollY - padding;

  if (prefersReducedMotion()) {
    window.scrollTo(0, targetY);
    return;
  }

  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / durationMs, 1);
    const eased = easeInOutCubic(t);
    window.scrollTo(0, startY + distance * eased);
    if (t < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

export function DocToc({
  backHref,
  backLabel = "Back",
}: {
  backHref?: string;
  backLabel?: string;
}) {
  const [items, setItems] = React.useState<{ id: string; label: string }[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const root = document.querySelector("[data-doc-content]");
    if (!root) return;

    const collect = () => {
      const h2s = Array.from(root.querySelectorAll("h2[id]")) as HTMLHeadingElement[];
      setItems(
        h2s.map((el) => ({
          id: el.id,
          label: el.textContent?.trim() ?? "",
        }))
      );
    };

    collect();

    const mo = new MutationObserver(collect);
    mo.observe(root, { childList: true, subtree: true, characterData: true });

    return () => mo.disconnect();
  }, []);

  React.useEffect(() => {
    if (items.length === 0) return;

    const offset = 140;

    const updateActive = () => {
      const scrollY = window.scrollY;
      let current = items[0]?.id ?? null;

      for (const { id } of items) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + scrollY;
        if (scrollY + offset >= top - 2) {
          current = id;
        }
      }
      setActiveId(current);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Sections"
      className="fixed left-0 top-0 z-40 hidden max-h-screen w-56 overflow-y-auto pt-64 ml-8 pr-2 lg:block xl:pl-5"
    >
      {backHref ? (
        <Link
          href={backHref}
          draggable={false}
          className="group mb-4 flex items-center gap-2 pb-3 text-base leading-snug text-muted-foreground transition-colors hover:text-foreground active:scale-97 transition-transform group-hover:-translate-x-0.5 duration-200 ease-out"
        >
          <span
            aria-hidden
            className="inline-block text-xl leading-none transition-transform duration-200 ease-out group-hover:-translate-x-0.5"
          >
            ←
          </span>
          {backLabel}
        </Link>
      ) : null}
      <ul className="space-y-1">
        {items.map(({ id, label }) => {
          const active = activeId === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                className={cn(
                  "block text-base leading-snug transition-colors active:scale-98 transition-[scale] duration-200 ease-out select-none",
                  active
                    ? "font-medium text-black dark:text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                draggable={false}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(id);
                  if (!el) return;
                  smoothScrollToElement(el, SCROLL_DURATION_MS);
                  window.history.replaceState(null, "", `#${id}`);
                  setActiveId(id);
                }}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
