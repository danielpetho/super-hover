import { createSuperHover } from "super-hover";

const ITEM_COUNT = 180;

function fillScroller(container: HTMLElement, mode: "native" | "super"): void {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < ITEM_COUNT; i += 1) {
    const row = document.createElement("div");
    row.className =
      mode === "super" ? "row row--super" : "row row--native";
    if (mode === "super") {
      row.setAttribute("data-super-hover", "");
    }

    const label = document.createElement("span");
    label.className = "row-label";
    label.textContent = `Item ${String(i + 1)} — keep the pointer fixed and scroll this list`;
    row.appendChild(label);
    frag.appendChild(row);
  }
  container.appendChild(frag);
}

const nativeList = document.querySelector("#native-list");
const superList = document.querySelector("#super-list");

if (!(nativeList instanceof HTMLElement) || !(superList instanceof HTMLElement)) {
  throw new Error("Demo containers missing");
}

fillScroller(nativeList, "native");
fillScroller(superList, "super");

createSuperHover();
