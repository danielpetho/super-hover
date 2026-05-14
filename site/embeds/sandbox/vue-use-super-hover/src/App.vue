<template>
  <div class="page">
    <section class="panel" aria-labelledby="event-heading">
      <div class="event-toolbar" aria-live="polite">
        <span class="event-pill-label">Active:</span>
        <span class="event-pill">{{ activePill }}</span>
      </div>
      <div ref="rootRef" class="scroller" tabindex="0">
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
import { ref } from "vue";
import { useSuperHover } from "./super-hover-vue";

const itemCount = 180;
const activePill = ref("None");

const rootRef = useSuperHover({
  onEnter(e: Event) {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const id = t.dataset.rowId;
    if (id) activePill.value = `Item ${id}`;
  },
  onLeave(e: Event) {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.dataset.rowId) activePill.value = "None";
  },
});
</script>
