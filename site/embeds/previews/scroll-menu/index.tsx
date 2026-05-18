"use client";

import * as React from "react";
import { useSuperHoverRef } from "super-hover/react";

import { cn } from "@/lib/utils";

const ARENA_BASE_URL = "https://api.are.na/v2";
const DEFAULT_ARENA_CHANNEL_SLUG = "grafik-j9_shkfbj2e";

type ArenaImage = {
  id: string;
  title: string;
  url: string;
};

type ArenaImageSource = {
  url?: string | null;
};

type ArenaBlock = {
  id: number | string;
  title?: string | null;
  image?: {
    display?: ArenaImageSource | null;
    large?: ArenaImageSource | null;
    original?: ArenaImageSource | null;
    square?: ArenaImageSource | null;
    thumb?: ArenaImageSource | null;
  } | null;
};

type ArenaChannelResponse = {
  contents?: ArenaBlock[];
};

const menuItems = Array.from({ length: 72 }, (_, index) => {
  const folders = [
    "Archive",
    "Untitled",
    "Graphic",
    "Typography",
    "Research Archive",
    "Poster Studies",
    "Book Covers",
    "Identity Drafts",
    "Layout Tests",
    "Reference Boards",
    "Scan Library",
    "Exhibition Notes",
    "Print Tests",
    "Type Specimens",
    "Found Images",
    "Moodboards",
  ];
  const createdAtDates = [
    "Today at 16.13",
    "Today at 14.42",
    "Today at 09.08",
    "Yesterday at 18.35",
    "Yesterday at 11.24",
    "15. May 2026 at 18.04",
    "15. May 2026 at 09.32",
    "12. May 2026 at 20.17",
    "8. May 2026 at 13.48",
    "2. May 2026 at 10.06",
    "28. Apr 2026 at 17.29",
    "19. Apr 2026 at 08.55",
  ];
  const imageCounts = [
    7, 18, 31, 12, 42, 26, 63, 15, 29, 54, 93, 22, 37, 118, 10, 46, 71, 33,
    24, 152, 16, 58, 81, 28, 39, 200, 19, 67, 44, 105, 13, 36,
  ];
  const imageCount = imageCounts[index % imageCounts.length];
  const size = formatFolderSize(imageCount, index);
  const createdAt = createdAtDates[index % createdAtDates.length];
  const baseLabel = folders[index % folders.length];
  const repeat = Math.floor(index / folders.length);

  return {
    id: `menu-${index}`,
    index,
    label: repeat === 0 ? baseLabel : `${baseLabel} ${repeat}`,
    createdAt,
    imageCount,
    images: `${imageCount} image${imageCount === 1 ? "" : "s"}`,
    size,
  };
});

type MenuItem = (typeof menuItems)[number];

export default function ScrollMenuPreview() {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [arenaImages, setArenaImages] = React.useState<ArenaImage[]>([]);
  const [isLoadingArenaImages, setIsLoadingArenaImages] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const activeItem =
    activeId === null
      ? null
      : (menuItems.find((item) => item.id === activeId) ?? null);
  const activeImages = React.useMemo(() => {
    if (!activeItem || arenaImages.length === 0) return [];

    return Array.from({ length: activeItem.imageCount }, (_, index) => {
      const imageIndex = (activeItem.index * 3 + index) % arenaImages.length;
      return arenaImages[imageIndex];
    });
  }, [activeItem, arenaImages]);

  React.useEffect(() => {
    let ignore = false;

    async function loadArenaImages() {
      setIsLoadingArenaImages(true);

      try {
        const url = new URL(
          `${ARENA_BASE_URL}/channels/${DEFAULT_ARENA_CHANNEL_SLUG}`,
        );
        url.searchParams.set("per", "48");

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load Are.na channel");

        const data = (await response.json()) as ArenaChannelResponse;
        const images =
          data.contents
            ?.map(getArenaImage)
            .filter((image): image is ArenaImage => image !== null) ?? [];

        if (!ignore) setArenaImages(images);
      } catch {
        if (!ignore) setArenaImages([]);
      } finally {
        if (!ignore) setIsLoadingArenaImages(false);
      }
    }

    void loadArenaImages();

    return () => {
      ignore = true;
    };
  }, []);

  const superHoverRef = useSuperHoverRef({
    onEnter(event) {
      const el = event.detail.current;
      if (!(el instanceof HTMLElement)) return;
      const optionId = el.dataset.optionId;
      if (!optionId) return;

      setActiveId(optionId);
    },
  });

  const setListRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      scrollRef.current = el;
      superHoverRef(el);
    },
    [superHoverRef],
  );

  return (
    <div className="flex h-full w-full items-center justify-start">
      <div className="relative h-[23rem] w-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 z-10 flex w-full overflow-hidden rounded-lg border-[0.5px] border-border bg-background outline-none"
          role="menu"
        >
          <div className="relative h-full w-[12rem] shrink-0">
            <div
              ref={setListRef}
              className="h-full overflow-y-auto overscroll-contain p-1.5"
            >
              <div className="flex flex-col gap-0.5">
                {menuItems.map((item) => (
                  <MenuRow
                    active={item.id === activeId}
                    item={item}
                    key={item.id}
                  />
                ))}
              </div>
            </div>
          </div>

          <div
            className="relative min-w-0 flex-1 border-l-[0.5px] border-border"
            aria-live="polite"
          >
            {activeItem ? (
              <div className="absolute inset-0 flex flex-col overflow-hidden p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-medium text-foreground">
                      {activeItem.label}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {activeItem.images} · {activeItem.size}
                    </div>
                  </div>
                  <div className="max-w-[8.5rem] truncate rounded-full bg-editor-bg px-2 py-0.5 text-[11px] text-muted-foreground">
                    {activeItem.createdAt}
                  </div>
                </div>

                <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                  <div className="grid grid-cols-4 gap-1">
                    {isLoadingArenaImages ? (
                      <ArenaImageLoader count={activeItem.imageCount} />
                    ) : (
                      activeImages.map((image, index) => (
                        <ArenaImageTile
                          image={image}
                          key={`${image.id}-${index}`}
                        />
                      ))
                    )}
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function getArenaImage(block: ArenaBlock): ArenaImage | null {
  const url =
    block.image?.display?.url ??
    block.image?.large?.url ??
    block.image?.square?.url ??
    block.image?.thumb?.url ??
    block.image?.original?.url;

  if (!url) return null;

  return {
    id: String(block.id),
    title: block.title ?? "Are.na image",
    url,
  };
}

function formatFolderSize(imageCount: number, index: number) {
  const averageImageKb = 110 + ((index * 37) % 180);
  const totalKb = 260 + imageCount * averageImageKb;

  if (totalKb < 1000) return `${totalKb} KB`;

  return `${(totalKb / 1000).toFixed(1)} MB`;
}

function ArenaImageLoader({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => (
    <div
      aria-hidden
      className="aspect-square animate-pulse bg-editor-bg"
      key={index}
      style={{ animationDelay: `${index * 90}ms` }}
    />
  ));
}

function ArenaImageTile({ image }: { image: ArenaImage }) {
  return (
    <div
      aria-label={image.title}
      className="aspect-square bg-editor-bg bg-cover bg-center"
      role="img"
      style={{ backgroundImage: `url(${JSON.stringify(image.url)})` }}
    />
  );
}

function MenuRow({ active, item }: { active: boolean; item: MenuItem }) {
  return (
    <div
      data-super-hover
      data-option-id={item.id}
      role="menuitem"
      className={cn(
        "flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
        active && "bg-editor-bg",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-foreground">{item.label}</div>
        <div className="truncate text-[11px] text-muted-foreground">
          {item.createdAt}
        </div>
      </div>
    </div>
  );
}
