import {
  createSuperHover,
  type SuperHoverController,
} from "./super-hover";
import "./index.css";

const ITEM_COUNT = 180;

type RowMode = "native" | "super";

function buildLabel(index: number): string {
  return `Item ${String(index + 1)}`;
}

function fillScroller(container: HTMLElement, mode: RowMode): void {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < ITEM_COUNT; i += 1) {
    const row = document.createElement("div");
    row.className = `row row--${mode}`;

    if (mode !== "native") {
      row.setAttribute("data-super-hover", "");
    }

    const label = document.createElement("span");
    label.className = "row-label";
    label.textContent = buildLabel(i);
    row.appendChild(label);
    frag.appendChild(row);
  }
  container.appendChild(frag);
}

const nativeList = document.querySelector("#native-list");
const superList = document.querySelector("#super-list");

if (
  !(nativeList instanceof HTMLElement) ||
  !(superList instanceof HTMLElement)
) {
  throw new Error("Demo containers missing");
}

fillScroller(nativeList, "native");
fillScroller(superList, "super");

const pauseInput = document.querySelector("#super-pause");
if (!(pauseInput instanceof HTMLInputElement)) {
  throw new Error("Pause control missing");
}

const hover: SuperHoverController = createSuperHover();

pauseInput.addEventListener("change", () => {
  if (pauseInput.checked) hover.pause();
  else hover.resume();
});
