"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const TOC_IO_ROOT_MARGIN = "0% 0% -80% 0%";

const tocMotionTransition = (reduced: boolean) =>
  reduced
    ? { duration: 0 }
    : { duration: 0.3, ease: "easeOut" as const };

/** Active heading via viewport intersection (same idea as dashboard TOC). */
function useActiveHeadingItem(ids: string[]) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (ids.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: TOC_IO_ROOT_MARGIN, threshold: 0 },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [ids]);

  return [activeId, setActiveId] as const;
}

export function DocToc({
  backHref,
  backLabel = "Back",
}: {
  backHref?: string;
  backLabel?: string;
}) {
  const reduceMotion = useReducedMotion();
  const transition = tocMotionTransition(Boolean(reduceMotion));

  const [items, setItems] = React.useState<{ id: string; label: string }[]>([]);

  const itemIdsKey = items.map((item) => item.id).join("\0");
  const itemIds = React.useMemo(() => items.map((item) => item.id), [itemIdsKey]);

  const [activeId, setActiveId] = useActiveHeadingItem(itemIds);

  React.useEffect(() => {
    const root = document.querySelector("[data-doc-content]");
    if (!root) return;

    const collect = () => {
      const h2s = Array.from(root.querySelectorAll("h2[id]")) as HTMLHeadingElement[];
      setItems(
        h2s.map((el) => ({
          id: el.id,
          label: el.textContent?.trim() ?? "",
        })),
      );
    };

    collect();

    const mo = new MutationObserver(collect);
    mo.observe(root, { childList: true, subtree: true, characterData: true });

    return () => mo.disconnect();
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Sections"
      className="fixed left-0 top-0 z-40 hidden max-h-screen w-56 overscroll-contain pt-65 ml-8 pr-2 lg:block xl:pl-5"
    >
      {backHref ? (
        <Link
          href={backHref}
          draggable={false}
          className="group mb-4 flex origin-left items-center gap-2 pb-3 text-base leading-snug transition-colors transition-transform duration-200 ease-out active:scale-97 group-hover:-translate-x-0.5"
        >
          <span
            aria-hidden
            className="inline-block text-xl leading-none text-muted-foreground transition-transform duration-200 ease-out group-hover:-translate-x-0.5 group-hover:text-foreground"
          >
            ←
          </span>
          <motion.span
            className="inline-block"
            initial={false}
            whileHover={{
              fontVariationSettings: "'wght' 500",
              color: "var(--foreground)",
              transition,
            }}
            animate={{
              fontVariationSettings: "'wght' 400",
              color: "var(--muted-foreground)",
              transition,
            }}
          >
            {backLabel}
          </motion.span>
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
                  "block origin-left text-base leading-snug transition-[scale] duration-200 ease-out select-none active:scale-97",
                )}
                draggable={false}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(id);
                  if (!el) return;
                  el.scrollIntoView({
                    behavior: reduceMotion ? "auto" : "smooth",
                    block: "start",
                  });
                  window.history.replaceState(null, "", `#${id}`);
                  setActiveId(id);
                }}
              >
                <motion.span
                  className="inline-block w-full"
                  initial={false}
                  whileHover={{
                    fontVariationSettings: "'wght' 500",
                    color: "var(--foreground)",
                    transition,
                  }}
                  animate={{
                    fontVariationSettings: active ? "'wght' 500" : "'wght' 400",
                    color: active
                      ? "var(--foreground)"
                      : "var(--muted-foreground)",
                    transition,
                  }}
                >
                  {label}
                </motion.span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
