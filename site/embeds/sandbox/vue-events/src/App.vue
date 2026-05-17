<template>
  <div class="page">

      <section class="panel" aria-labelledby="event-heading">
        <div class="event-toolbar" aria-live="polite">
          <span class="event-pill-label">Active:</span>
          <span class="event-pill">{{ activePill }}</span>
          <span class="event-pill-label">Moves:</span>
          <span class="event-pill event-pill--metric">{{ moveCount }}</span>
          <span class="event-pill-label">Last:</span>
          <span class="event-pill event-pill--metric">{{ movePoint }}</span>
          <label class="event-toolbar-switch">
            <input v-model="paused" type="checkbox" @change="syncPause" />
            Pause hit-test
          </label>
        </div>
        <div ref="elEvent" class="scroller" tabindex="0">
        <div
          v-for="n in itemCount"
          :key="'e' + n"
          class="row row--event"
          data-super-hover
          :data-row-id="String(n)"
        >
          <span class="row-label">Item {{ n }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import {
  createSuperHover,
  type SuperHoverController,
  type SuperHoverMoveEventDetail,
} from "./super-hover";

const itemCount = 180;
const elEvent = ref<HTMLElement | null>(null);
const activePill = ref("None");
const moveCount = ref(0);
const movePoint = ref("—");
const paused = ref(false);

let superHover: SuperHoverController | undefined;
let onEnter: ((e: Event) => void) | undefined;
let onLeave: ((e: Event) => void) | undefined;
let onMove: ((e: Event) => void) | undefined;
let eventRoot: HTMLElement | null = null;

onMounted(async () => {
  await nextTick();
  const root = elEvent.value;
  if (!root) return;
  eventRoot = root;
  onEnter = (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const id = t.dataset.rowId;
    if (id) activePill.value = `Item ${id}`;
  };
  onLeave = (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.dataset.rowId) activePill.value = "None";
  };
  onMove = (e) => {
    const detail = (e as CustomEvent<SuperHoverMoveEventDetail>).detail;
    moveCount.value += 1;
    movePoint.value = `${Math.round(detail.x)}, ${Math.round(detail.y)}`;
  };
  root.addEventListener("superhoverenter", onEnter);
  root.addEventListener("superhoverleave", onLeave);
  root.addEventListener("superhovermove", onMove);
  superHover = createSuperHover({ root });
  if (paused.value) superHover.pause();
});

function syncPause(): void {
  if (!superHover) return;
  if (paused.value) superHover.pause();
  else superHover.resume();
}

onUnmounted(() => {
  superHover?.destroy();
  if (eventRoot && onEnter && onLeave && onMove) {
    eventRoot.removeEventListener("superhoverenter", onEnter);
    eventRoot.removeEventListener("superhoverleave", onLeave);
    eventRoot.removeEventListener("superhovermove", onMove);
  }
});
</script>
