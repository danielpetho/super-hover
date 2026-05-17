import {
  createSuperHover,
  type SuperHoverController,
  type SuperHoverMoveEventDetail,
} from "./super-hover";
import "./index.css";

const ITEM_COUNT = 180;
console.log("vanilla-events: super-hover ready");

function buildLabel(index: number): string {
  return `Item ${String(index + 1)}`;
}

function fillEventScroller(container: HTMLElement): void {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < ITEM_COUNT; i += 1) {
    const row = document.createElement("div");
    row.className = "row row--event";
    row.setAttribute("data-super-hover", "");
    row.setAttribute("data-row-id", String(i + 1));

    const label = document.createElement("span");
    label.className = "row-label";
    label.textContent = buildLabel(i);
    row.appendChild(label);
    frag.appendChild(row);
  }
  container.appendChild(frag);
}

const eventList = document.querySelector("#event-list");
const eventActivePill = document.querySelector("#event-active-pill");
const eventMoveCount = document.querySelector("#event-move-count");
const eventMovePoint = document.querySelector("#event-move-point");

if (
  !(eventList instanceof HTMLElement) ||
  !(eventActivePill instanceof HTMLElement) ||
  !(eventMoveCount instanceof HTMLElement) ||
  !(eventMovePoint instanceof HTMLElement)
) {
  throw new Error("Demo containers missing");
}

fillEventScroller(eventList);

let moveCount = 0;

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
  if (!target.dataset.rowId) return;
  eventActivePill.textContent = "None";
});

eventList.addEventListener("superhovermove", (event) => {
  const e = event as CustomEvent<SuperHoverMoveEventDetail>;
  moveCount += 1;
  eventMoveCount.textContent = String(moveCount);
  eventMovePoint.textContent = `${Math.round(e.detail.x)}, ${Math.round(e.detail.y)}`;
});

const pauseInput = document.querySelector("#event-pause");
if (!(pauseInput instanceof HTMLInputElement)) {
  throw new Error("Pause control missing");
}

const hover: SuperHoverController = createSuperHover({ root: eventList });

pauseInput.addEventListener("change", () => {
  if (pauseInput.checked) hover.pause();
  else hover.resume();
});
