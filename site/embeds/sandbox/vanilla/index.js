import { createSuperHover } from "./super-hover";
import "./index.css";

const ITEM_COUNT = 180;
console.log("super-hover sandbox ready");

function buildLabel(index) {
  return `Item ${String(index + 1)}`;
}

function fillScroller(container, mode) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < ITEM_COUNT; i += 1) {
    const row = document.createElement("div");
    row.className = `row row--${mode}`;

    if (mode !== "native") {
      row.setAttribute("data-super-hover", "");
    }
    if (mode === "event") {
      row.setAttribute("data-row-id", String(i + 1));
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
const eventList = document.querySelector("#event-list");
const eventActivePill = document.querySelector("#event-active-pill");

if (
  !(nativeList instanceof HTMLElement) ||
  !(superList instanceof HTMLElement) ||
  !(eventList instanceof HTMLElement) ||
  !(eventActivePill instanceof HTMLElement)
) {
  throw new Error("Demo containers missing");
}

fillScroller(nativeList, "native");
fillScroller(superList, "super");
fillScroller(eventList, "event");

eventList.addEventListener("superhoverenter", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const id = target.dataset.rowId;
  if (!id) return;
  eventActivePill.textContent = `Item ${id}`;
});

eventList.addEventListener("superhoverleave", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const id = target.dataset.rowId;
  if (!id) return;
  eventActivePill.textContent = "None";
});

createSuperHover();
