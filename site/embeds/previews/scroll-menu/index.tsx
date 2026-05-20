"use client";

import * as React from "react";
import { useSuperHoverRef } from "super-hover/react";

import { cn } from "@/lib/utils";
import { HoverModeSwitch } from "@/embeds/previews/hover-mode-switch";

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
  const [superHoverOn, setSuperHoverOn] = React.useState(true);
  const [activeId, setActiveId] = React.useState<string | null>(
    menuItems[0]?.id ?? null,
  );
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
      if (!superHoverOn) return;

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
    <div className="flex h-[min(27rem,70vh)] w-full select-none flex-col gap-2">
      <HoverModeSwitch
        superHoverOn={superHoverOn}
        onSuperHoverOnChange={setSuperHoverOn}
      />

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 z-10 flex w-full overflow-hidden rounded-xl border-[0.5px] border-border bg-background outline-none"
          role="menu"
        >
          <div className="relative h-full w-[8.5rem] shrink-0 sm:w-[12rem]">
            <div
              ref={setListRef}
              className="h-full overflow-y-auto overscroll-contain"
            >
              <div className="flex flex-col gap-0.5">
                {menuItems.map((item) => (
                  <MenuRow
                    active={item.id === activeId}
                    item={item}
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                    onNativeEnter={() => {
                      if (!superHoverOn) setActiveId(item.id);
                    }}
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
              <div className="absolute inset-0 flex flex-col overflow-hidden">
                <div className="flex items-start justify-between gap-2 px-3 pt-3 pb-2 sm:gap-3 sm:px-4 sm:pt-4">
                  <div className="min-w-0 leading-tight">
                    <div className="truncate text-base font-medium text-foreground sm:text-xl">
                      {activeItem.label}
                    </div>
                    {/* <div className="inline-flex items-center text-xs text-muted-foreground tabular-nums">
                      <span className=" w-[2rem]">
                        File{activeItem.imageCount === 1 ? "" : "s"}:
                      </span>
                      <span className="w-[3ch] text-left">
                        {activeItem.imageCount}
                      </span>
                    </div> */}
                  </div>
                  <div className="rounded-full px-1.5 py-0.5 text-[10px] text-muted-foreground tabular-nums sm:px-2 sm:text-xs">
                    {activeItem.imageCount} file{activeItem.imageCount === 1 ? "" : "s"}
                  </div>
                </div>

                <div className="mt-2 min-h-0 flex-1 overflow-y-auto px-3 sm:mt-4 sm:px-4">
                  <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
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

function MenuRow({
  active,
  item,
  onClick,
  onNativeEnter,
}: {
  active: boolean;
  item: MenuItem;
  onClick: () => void;
  onNativeEnter: () => void;
}) {
  return (
    <div
      data-super-hover
      data-option-id={item.id}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onClick();
      }}
      onMouseEnter={onNativeEnter}
      role="menuitem"
      tabIndex={0}
      className={cn(
        "flex cursor-default items-center gap-2 px-1.5 py-1 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-2 sm:py-1.5 sm:text-sm",
        active && "bg-editor-bg",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-foreground">{item.label}</div>
        <div className="truncate text-[10px] text-muted-foreground sm:text-[11px]">
          {item.createdAt}
        </div>
      </div>
    </div>
  );
}
