"use client";

import * as React from "react";
import {
  Clock3Icon,
  FileIcon,
} from "lucide-react";
import { createSuperHover } from "super-hover";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Commit = {
  hash: string;
  message: string;
  author: string;
  avatar: string;
  avatarGradient: string;
  avatarUrl?: string;
  relativeTime: string;
  timestamp: string;
  filesChanged: number;
  additions: number;
  deletions: number;
};

const MODE_LABEL_GRID =
  "inline-grid shrink-0 origin-center grid-cols-1 grid-rows-1 text-base select-none after:pointer-events-none after:col-start-1 after:row-start-1 after:invisible after:origin-center after:whitespace-nowrap after:font-medium after:content-[attr(data-ghost)]";

const MODE_LABEL_BTN =
  "cursor-pointer rounded-sm border-0 bg-transparent p-0 font-inherit outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const GIT_COMMITS_RAW = `
d3e9a47|Daniel Petho|2026-05-22T10:15:22+02:00|demo|3|252|8
e28d7f9|Daniel Petho|2026-05-21T10:54:54+02:00|patch|1|1|1
7952181|Daniel Petho|2026-05-21T09:45:14+02:00|update url|1|2|1
d227126|Daniel Petho|2026-05-21T09:39:11+02:00|tests|4|509|11
a4521d3|Daniel Petho|2026-05-20T23:22:42+02:00|bump version|1|1|1
6dfc9e6|Daniel Petho|2026-05-20T23:19:37+02:00|scroll, demo update|2|9|9
8ae1572|Daniel Petho|2026-05-20T23:12:03+02:00|nits|4|65|25
ed98d1a|Daniel Petho|2026-05-20T22:54:39+02:00|update link, demo|5|10|10
5af1b63|Daniel Petho|2026-05-20T20:40:44+02:00|patch version|1|1|1
b2301d9|Daniel Petho|2026-05-20T20:38:42+02:00|fix footer link|1|1|1
e15b797|Daniel Petho|2026-05-20T20:35:29+02:00|docs update|11|174|56
249f1ed|Daniel Petho|2026-05-20T12:03:36+02:00|update docs, mailto comp, agentation, sonner|16|343|96
fef2d45|Daniel Petho|2026-05-19T23:10:36+02:00|new icons|2|0|0
92fae69|Daniel Petho|2026-05-19T23:08:09+02:00|favicons, rename|6|28|22
913a037|Daniel Petho|2026-05-19T22:56:55+02:00|add og image|1|0|0
918687e|Daniel Petho|2026-05-19T22:56:43+02:00|og image|1|130|0
0b139fa|Daniel Petho|2026-05-19T11:34:16+02:00|bunch of updates|9|200|127
6369423|Daniel Petho|2026-05-18T23:21:37+02:00|tweak demo|14|343|39
1d4d806|Daniel Petho|2026-05-17T22:00:41+02:00|fix scroll|1|5|3
86cfd22|Daniel Petho|2026-05-17T21:11:46+02:00|more docs tweak|8|1206|376
b72c151|Daniel Petho|2026-05-17T20:58:58+02:00|more docs tweak|1|129|10
7a007d8|Daniel Petho|2026-05-17T20:16:47+02:00|tweak docs|1|59|53
7c5364f|Daniel Petho|2026-05-17T14:19:56+02:00|more design nits|5|20|13
ab8b36e|Daniel Petho|2026-05-17T14:03:33+02:00|nits|1|4|4
b799713|Daniel Petho|2026-05-17T13:53:41+02:00|console sandbox|3|98|10
2bc40e9|Daniel Petho|2026-05-17T12:59:06+02:00|sandbox nits|8|65|73
988c63a|Daniel Petho|2026-05-17T12:11:51+02:00|scrollable tabs|1|9|10
910d0ff|Daniel Petho|2026-05-17T11:56:03+02:00|update dev sandboxes|9|101|5
219ebca|Daniel Petho|2026-05-17T09:33:28+02:00|comments|1|6|2
7e6c64a|Daniel Petho|2026-05-16T22:53:27+02:00|nits|1|17|3
02209cb|Daniel Petho|2026-05-14T23:49:37+02:00|nits|2|4|3
5e8c7bf|Daniel Petho|2026-05-14T23:49:12+02:00|update dep array|1|7|4
3e22633|Daniel Petho|2026-05-14T23:40:45+02:00|callbacks CustomEvent-typed|4|73|24
b721bdf|Daniel Petho|2026-05-14T23:30:12+02:00|resume should hit test accuratley|2|4|5
9b21933|Daniel Petho|2026-05-14T23:17:28+02:00|iframe|1|19|3
406c2f8|Daniel Petho|2026-05-14T22:32:10+02:00|update lock|1|63|63
6025f71|Daniel Petho|2026-05-14T22:31:58+02:00|upgrade next|1|4|4
559784a|Daniel Petho|2026-05-14T22:26:45+02:00|more embeds|50|1312|33
a3df17b|Daniel Petho|2026-05-14T17:41:17+02:00|refactor deactive|1|10|13
4af2322|Daniel Petho|2026-05-14T17:34:13+02:00|better destroy|11|99|40
1f2afe8|Daniel Petho|2026-05-14T16:52:55+02:00|preserve state|1|1|1
d2fabd3|Daniel Petho|2026-05-14T16:35:41+02:00|add move events|5|106|6
8bd75cf|Daniel Petho|2026-05-14T16:20:20+02:00|demo update|9|68|72
12839f5|Daniel Petho|2026-05-14T15:59:55+02:00|add event details|1|34|4
cafa052|Daniel Petho|2026-05-14T12:55:49+02:00|better cancel / leave events|1|12|2
b8e8084|Daniel Petho|2026-05-14T12:30:12+02:00|make it work with iframes|1|22|15
b2c71f2|Daniel Petho|2026-05-14T12:18:55+02:00|filter pointer types|5|31|72
816f451|Daniel Petho|2026-05-10T15:03:19+02:00|patch|1|1|1
3a0d572|Daniel Petho|2026-05-10T14:38:52+02:00|update README|1|6|4
315c54e|Daniel Petho|2026-05-10T14:36:37+02:00|agent docs|10|1070|9
a70a344|Daniel Petho|2026-05-10T10:38:35+02:00|sitemap;llms.txt;md files|7|172|0
c412522|Daniel Petho|2026-05-10T10:38:24+02:00|sitemap;llms.txt;md files|1|12|3
dcf3374|Daniel Petho|2026-05-10T09:27:20+02:00|update READMEs|3|67|14
81a2d2c|Daniel Petho|2026-05-09T23:27:24+02:00|toc|4|24|10
8ca3c1d|Daniel Petho|2026-05-09T20:19:00+02:00|update docs|4|23|35
6ecdd2b|Daniel Petho|2026-05-08T14:55:10+02:00|scroll|3|11|4
3089e82|Daniel Petho|2026-05-08T14:43:39+02:00|nits|3|10|10
223e6fd|Daniel Petho|2026-05-07T19:12:34+02:00|more design nits|10|239|20
d0bbe8b|Daniel Petho|2026-05-07T18:46:07+02:00|design nits|20|147|39
cdfb696|Daniel Petho|2026-05-07T17:51:25+02:00|padding|2|11|2
d1fab0b|Daniel Petho|2026-05-07T16:41:39+02:00|update docs|6|59|7
19b1394|Daniel Petho|2026-05-06T19:38:41+02:00|more docs update|7|110|30
1c2e48d|Daniel Petho|2026-05-06T14:23:00+02:00|api props and update docs|6|287|358
82e675e|Daniel Petho|2026-05-03T21:48:47+02:00|update docs|7|83|64
eb3c86b|Daniel Petho|2026-05-03T20:24:39+02:00|nits|6|45|28
44f1093|Daniel Petho|2026-05-03T14:14:14+02:00|doc-wide framework selector|17|700|583
40d9c8b|Daniel Petho|2026-05-03T12:05:14+02:00|props table|5|321|26
3e2060e|Daniel Petho|2026-05-03T10:24:42+02:00|fix highlight; footer|6|75|53
c2cbc8c|Daniel Petho|2026-05-02T16:34:34+02:00|footer|9|65|18
f44be1e|Daniel Petho|2026-05-02T15:28:47+02:00|nits and docs|7|51|47
3e9bf14|Daniel Petho|2026-05-01T19:13:41+02:00|better example|1|49|45
ca85875|Daniel Petho|2026-05-01T19:11:30+02:00|feat(site): Prism syntax highlighting for Svelte snippets|5|199|10
99b93de|Daniel Petho|2026-05-01T11:57:20+02:00|add vue and svelte helpers|9|434|23
8ac5db9|Daniel Petho|2026-05-01T11:06:46+02:00|pointer events|5|19|20
5e9d8a6|Daniel Petho|2026-04-30T21:51:25+02:00|scroll contain and color|17|176|17
0bc54bf|Daniel Petho|2026-04-30T16:23:19+02:00|better toc|1|79|75
b42ca88|Daniel Petho|2026-04-30T15:40:46+02:00|improve demo|3|121|64
5bbad3e|Daniel Petho|2026-04-30T15:12:51+02:00|only use scan on dev|1|9|5
e056ac9|Daniel Petho|2026-04-30T15:08:43+02:00|fix|1|1|1
0d1f06e|Daniel Petho|2026-04-30T14:47:29+02:00|update build cmd|1|1|1
649640a|Daniel Petho|2026-04-30T14:33:42+02:00|add react sandboxes|16|523|0
7d49928|Daniel Petho|2026-04-30T13:11:08+02:00|add vercel conf: remove changelog|4|59|1
caba476|Daniel Petho|2026-04-30T11:23:56+02:00|add author|3|40|42
bfc7224|Daniel Petho|2026-04-30T09:39:56+02:00|route transitions, animations|11|283|55
88919f0|Daniel Petho|2026-04-28T23:34:34+02:00|restructure|5|235|12
dac1d9c|Daniel Petho|2026-04-28T23:24:29+02:00|simple usage|3|83|5
6750ca6|Daniel Petho|2026-04-28T23:16:54+02:00|nits|2|13|2
94bfb77|Daniel Petho|2026-04-28T23:06:56+02:00|framework tabs|5|198|0
633a677|Daniel Petho|2026-04-28T21:38:16+02:00|use lib for sandboxes|1|32|0
a8081fe|Daniel Petho|2026-04-28T11:50:10+02:00|customize super-hover events and polish album preview|12|268|44
d621f07|Daniel Petho|2026-04-27T20:59:43+02:00|svelte, vue, ts sandboxes|41|2454|250
49ccfac|Daniel Petho|2026-04-24T22:24:25+02:00|react pkg|11|268|112
ba4e86a|Daniel Petho|2026-04-24T14:20:17+02:00|sandbox nits|3|11|3
ac670fe|Daniel Petho|2026-04-23T22:48:30+02:00|reset code|2|17|0
6fc4f35|Daniel Petho|2026-04-23T22:41:51+02:00|colors|7|88|40
8fbf391|Daniel Petho|2026-04-22T10:19:31+02:00|reorg dev demos|21|731|180
5460b38|Daniel Petho|2026-04-20T20:28:15+02:00|more light theme|5|93|19
f98ef40|Daniel Petho|2026-04-20T18:37:25+02:00|light theme|6|121|29
eccd3e3|Daniel Petho|2026-04-20T18:05:08+02:00|nits|6|28|11
aa65a27|Daniel Petho|2026-04-19T22:35:19+02:00|design nits|10|220|72
a80e741|Daniel Petho|2026-04-19T19:33:08+02:00|tweak demo|5|154|85
66515aa|Daniel Petho|2026-04-19T17:21:51+02:00|demo|9|1905|55
860f869|Daniel Petho|2026-04-18T22:43:51+02:00|feat: init; scaffold|66|12684|0
`.trim();

function avatarFor(author: string): string {
  return author
    .split(" ")
    .map((part) => part[0])
    .join("");
}

function avatarGradientFor(index: number): string {
  const hueA = (index * 47 + 184) % 360;
  const hueB = (index * 71 + 24) % 360;
  return `linear-gradient(135deg, hsl(${hueA} 78% 58%), hsl(${hueB} 82% 42%))`;
}

function formatRelativeTime(date: Date): string {
  const now = new Date("2026-05-24T12:00:00+02:00");
  const diffHours = Math.max(
    1,
    Math.round((now.getTime() - date.getTime()) / 3_600_000),
  );

  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.round(diffHours / 24);
  return diffDays === 1 ? "yesterday" : `${diffDays} days ago`;
}

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

const commits: Commit[] = GIT_COMMITS_RAW.split("\n").map((line, index) => {
  const [hash, author, isoDate, message, filesChanged, additions, deletions] =
    line.split("|");
  const date = new Date(isoDate);

  return {
    hash,
    message,
    author,
    avatar: avatarFor(author),
    avatarGradient: avatarGradientFor(index),
    avatarUrl:
      author === "Daniel Petho" ? "https://github.com/danielpetho.png" : undefined,
    relativeTime: formatRelativeTime(date),
    timestamp: formatTimestamp(date),
    filesChanged: Number(filesChanged),
    additions: Number(additions),
    deletions: Number(deletions),
  };
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getPointerY(event: Event): number | null {
  if (event instanceof MouseEvent) return event.clientY;

  const detail = (event as CustomEvent<{ y?: number }>).detail;
  return typeof detail?.y === "number" ? detail.y : null;
}

type HoverModeSwitchProps = {
  className?: string;
  superHoverOn: boolean;
  onSuperHoverOnChange: (superHoverOn: boolean) => void;
};

function HoverModeSwitch({
  className,
  superHoverOn,
  onSuperHoverOnChange,
}: HoverModeSwitchProps) {
  const switchId = React.useId();

  return (
    <div className={cn("flex w-full items-center font-satoshi px-2", className)}>
      <button
        type="button"
        aria-pressed={!superHoverOn}
        className={cn(
          MODE_LABEL_BTN,
          "flex min-h-11 min-w-0 flex-1 basis-0 items-center justify-end py-2 pl-1 pr-3",
        )}
        onClick={() => onSuperHoverOnChange(false)}
      >
        <span data-ghost="Native hover" className={MODE_LABEL_GRID}>
          <span
            className={cn(
              "col-start-1 row-start-1 origin-center transition-[color,font-weight] duration-200 ease-out",
              !superHoverOn
                ? "font-medium text-neutral-950"
                : "font-normal text-neutral-500",
            )}
          >
            Native hover
          </span>
        </span>
      </button>
      <Switch
        id={switchId}
        className="relative z-10"
        checked={superHoverOn}
        onCheckedChange={onSuperHoverOnChange}
        aria-label="Hover mode: Native hover when off, super hover when on"
      />
      <button
        type="button"
        aria-pressed={superHoverOn}
        className={cn(
          MODE_LABEL_BTN,
          "flex min-h-11 min-w-0 flex-1 basis-0 items-center justify-start py-2 pl-3 pr-1",
        )}
        onClick={() => onSuperHoverOnChange(true)}
      >
        <span data-ghost="Super hover" className={MODE_LABEL_GRID}>
          <span
            className={cn(
              "col-start-1 row-start-1 origin-center transition-[color,font-weight] duration-200 ease-out",
              superHoverOn
                ? "font-medium text-neutral-950"
                : "font-normal text-neutral-500",
            )}
          >
            Super hover
          </span>
        </span>
      </button>
    </div>
  );
}

export default function DemoTwoPage() {
  const [superHoverOn, setSuperHoverOn] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [isPanelVisible, setIsPanelVisible] = React.useState(false);
  const [panelTop, setPanelTop] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);
  const detailsRef = React.useRef<HTMLElement>(null);
  const commit = activeIndex === null ? commits[0] : (commits[activeIndex] ?? commits[0]);

  const updateActiveCommit = React.useCallback((event: Event) => {
    const root = listRef.current;
    const pointerY = getPointerY(event);
    if (!(event.target instanceof Element) || !root || pointerY === null) {
      return;
    }

    const row = event.target.closest<HTMLElement>("[data-commit-index]");
    if (!row || !root.contains(row)) return;

    const nextIndex = Number(row.dataset.commitIndex);
    if (!Number.isFinite(nextIndex)) return;

    const rootRect = root.getBoundingClientRect();
    const panelHeight = detailsRef.current?.offsetHeight ?? 168;
    const maxTop = Math.max(0, rootRect.height - panelHeight);
    const nextTop = clamp(pointerY - rootRect.top - panelHeight / 2, 0, maxTop);

    setActiveIndex(nextIndex);
    setIsPanelVisible(true);
    setPanelTop(nextTop);
  }, []);

  React.useEffect(() => {
    const root = listRef.current;
    if (!root) return;

    const ctrl = superHoverOn ? createSuperHover({ root }) : null;
    const handleLeave = () => {
      setIsPanelVisible(false);
      setActiveIndex(null);
    };

    if (superHoverOn) {
      root.addEventListener("superhoverenter", updateActiveCommit);
      root.addEventListener("superhovermove", updateActiveCommit);
    }
    root.addEventListener("mousemove", updateActiveCommit);
    root.addEventListener("mouseover", updateActiveCommit);
    root.addEventListener("mouseleave", handleLeave);

    return () => {
      root.removeEventListener("superhoverenter", updateActiveCommit);
      root.removeEventListener("superhovermove", updateActiveCommit);
      root.removeEventListener("mousemove", updateActiveCommit);
      root.removeEventListener("mouseover", updateActiveCommit);
      root.removeEventListener("mouseleave", handleLeave);
      ctrl?.destroy();
    };
  }, [superHoverOn, updateActiveCommit]);

  return (
    <main className="relative flex h-svh w-full items-center justify-center overflow-hidden bg-[#ffffff] px-6 pr-[320px] py-6 font-overused-grotesk text-neutral-900">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-[min(25rem,82svh)] w-[min(40rem,80%)] items-center justify-center">
          <div
            ref={listRef}
            className="relative h-full w-[20rem] overflow-visible rounded-none border-[0.5px] border-neutral-300 bg-white shadow-xl/5"
          >
            <div className="h-full overflow-y-auto overflow-x-hidden py-1.5">
              {commits.map((item, index) => (
                <div
                  key={item.hash}
                  data-super-hover
                  data-commit-index={index}
                  className={cn(
                    "group/commit relative grid min-h-7 cursor-default grid-cols-[0.7rem_minmax(0,1fr)] items-center gap-1 px-2.5 py-0.5 text-[13px] leading-[1.25] text-neutral-600",
                    "before:absolute before:bottom-0 before:left-[0.641rem] before:top-0 before:w-px before:bg-[#f97316]/45",
                    "transition-colors ease-out",
                    superHoverOn
                      ? "[&[data-super-hover-active]]:bg-neutral-100 [&[data-super-hover-active]]:text-neutral-950"
                      : "hover:bg-neutral-100 hover:text-neutral-950",
                    isPanelVisible && activeIndex === index
                      ? "bg-neutral-100 text-neutral-950"
                      : null,
                  )}
                >
                  <span className="absolute left-[0.4375rem] top-1/2 size-2 -translate-y-1/2 rounded-full bg-[#f97316]" />
                  <span aria-hidden />
                  <div className="flex min-w-0 items-baseline gap-2">
                    <span className="truncate leading-[1.25]">{item.message}</span>
                    <span className="shrink-0 truncate text-xs leading-[1.25] text-neutral-600">
                      {item.author}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {isPanelVisible ? (
              <CommitDetails commit={commit} ref={detailsRef} top={panelTop} />
            ) : null}
          </div>
        </div>

      </div>
      <HoverModeSwitch
        className="absolute bottom-30 left-1/2 w-[20rem] -translate-x-1/2"
        superHoverOn={superHoverOn}
        onSuperHoverOnChange={setSuperHoverOn}
      />
    </main>
  );
}

function CommitDetails({
  commit,
  ref,
  top,
}: {
  commit: Commit;
  ref: React.RefObject<HTMLElement | null>;
  top: number;
}) {
  return (
    <aside
      ref={ref}
      className="absolute left-[calc(100%+0.25rem)] top-0 z-30 w-[22rem] overflow-hidden rounded-none border-[0.5px] border-neutral-300 bg-white text-[13px] text-neutral-900 transition-transform duration-400 ease-out shadow-xl/5"
      style={{ transform: `translate3d(0, ${top}px, 0)` }}
    >
      <div className="border-b border-neutral-200 px-1.5 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          {commit.avatarUrl ? (
            <div
              aria-hidden
              className="size-6 shrink-0 rounded-full bg-cover bg-center outline outline-1 outline-black/10"
              style={{ backgroundImage: `url(${commit.avatarUrl})` }}
            />
          ) : (
            <div
              className="grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white outline outline-1 outline-black/10"
              style={{ backgroundImage: commit.avatarGradient }}
            >
              {commit.avatar}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1.5 leading-none">
              <span className="font-semibold text-neutral-700">{commit.author}</span>
              <Clock3Icon aria-hidden className="size-3 text-neutral-600" />
              <span className="truncate text-xs tabular-nums text-neutral-600">
                {commit.relativeTime} ({commit.timestamp})
              </span>
            </div>
            <div className="mt-1 text-xs truncate leading-none text-neutral-600">
              {commit.message}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 px-2.5 py-2">
        <div className="flex items-center gap-1.5 text-neutral-600">
          <span className="tabular-nums text-xs">
            {commit.filesChanged} {commit.filesChanged === 1 ? "file" : "files"} changed,
          </span>
          <span className="font-medium tabular-nums text-xs text-emerald-600">
            {commit.additions} insertions(+),
          </span>
          <span className="font-medium tabular-nums text-xs text-red-500">
            {commit.deletions} deletions(-)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-[2px] bg-neutral-100 py-0.5 font-mono text-xs tabular-nums text-neutral-600 text-xs">
            <FileIcon aria-hidden className="size-3" />
            {commit.hash}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-neutral-600">
            <GithubMarkIcon aria-hidden className="size-3.5" />
            Open on GitHub
          </span>
        </div>
      </div>
    </aside>
  );
}

function GithubMarkIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 98 96" fill="currentColor" aria-hidden {...props}>
      <path d="M41.4395 69.3848C28.8066 67.8535 19.9062 58.7617 19.9062 46.9902C19.9062 42.2051 21.6289 37.0371 24.5 33.5918C23.2559 30.4336 23.4473 23.7344 24.8828 20.959C28.7109 20.4805 33.8789 22.4902 36.9414 25.2656C40.5781 24.1172 44.4062 23.543 49.0957 23.543C53.7852 23.543 57.6133 24.1172 61.0586 25.1699C64.0254 22.4902 69.2891 20.4805 73.1172 20.959C74.457 23.543 74.6484 30.2422 73.4043 33.4961C76.4668 37.1328 78.0937 42.0137 78.0937 46.9902C78.0937 58.7617 69.1934 67.6621 56.3691 69.2891C59.623 71.3945 61.8242 75.9883 61.8242 81.252L61.8242 91.2051C61.8242 94.0762 64.2168 95.7031 67.0879 94.5547C84.4102 87.9512 98 70.6289 98 49.1914C98 22.1074 75.9883 0 48.9043 0C21.8203 0 0 22.1074 0 49.1914C0 70.4375 13.4941 88.0469 31.6777 94.6504C34.2617 95.6074 36.75 93.8848 36.75 91.3008L36.75 83.6445C35.4102 84.2188 33.6875 84.6016 32.1562 84.6016C25.8398 84.6016 22.1074 81.1563 19.4277 74.7441C18.375 72.1602 17.2266 70.6289 15.0254 70.3418C13.877 70.2461 13.4941 69.7676 13.4941 69.1934C13.4941 68.0449 15.4082 67.1836 17.3223 67.1836C20.0977 67.1836 22.4902 68.9063 24.9785 72.4473C26.8926 75.2227 28.9023 76.4668 31.2949 76.4668C33.6875 76.4668 35.2187 75.6055 37.4199 73.4043C39.0469 71.7773 40.291 70.3418 41.4395 69.3848Z" />
    </svg>
  );
}
