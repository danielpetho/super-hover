<template>
  <div class="page">

    <section class="panel" aria-labelledby="event-heading">
      <div class="event-toolbar" aria-live="polite">
        <span class="event-pill-label">Active:</span>
        <span class="event-pill">{{ activePill }}</span>
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
import { createSuperHover, type SuperHoverController } from "./super-hover";

const itemCount = 180;
const elEvent = ref<HTMLElement | null>(null);
const activePill = ref("None");

let superHover: SuperHoverController | undefined;
let onEnter: ((e: Event) => void) | undefined;
let onLeave: ((e: Event) => void) | undefined;
let eventRoot: HTMLElement | null = null;

onMounted(async () => {
  await nextTick();
  if (!elEvent.value) return;
  eventRoot = elEvent.value;
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
  eventRoot.addEventListener("superhoverenter", onEnter);
  eventRoot.addEventListener("superhoverleave", onLeave);
  superHover = createSuperHover({ root: eventRoot });
});

onUnmounted(() => {
  superHover?.destroy();
  if (eventRoot && onEnter && onLeave) {
    eventRoot.removeEventListener("superhoverenter", onEnter);
    eventRoot.removeEventListener("superhoverleave", onLeave);
  }
});
</script>
