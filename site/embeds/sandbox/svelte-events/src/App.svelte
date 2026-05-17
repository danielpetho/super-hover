<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import {
    createSuperHover,
    type SuperHoverController,
    type SuperHoverMoveEventDetail,
  } from "./super-hover";

  const itemCount = 180;
  const items: number[] = Array.from({ length: itemCount }, (_, i) => i + 1);

  let paused = false;

  let elEvent: HTMLDivElement | undefined;
  let activePill = "None";
  let moveCount = 0;
  let movePoint = "—";
  let ctrl: SuperHoverController | undefined;
  let onEnter: ((e: Event) => void) | undefined;
  let onLeave: ((e: Event) => void) | undefined;
  let onMove: ((e: Event) => void) | undefined;
  let eventRoot: HTMLDivElement | undefined;

  onMount(async () => {
    await tick();
    if (!elEvent) return;
    eventRoot = elEvent;
    onEnter = (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const id = t.dataset.rowId;
      if (id) activePill = `Item ${id}`;
    };
    onLeave = (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (t.dataset.rowId) activePill = "None";
    };
    onMove = (e) => {
      const detail = (e as CustomEvent<SuperHoverMoveEventDetail>).detail;
      moveCount += 1;
      movePoint = `${Math.round(detail.x)}, ${Math.round(detail.y)}`;
    };
    elEvent.addEventListener("superhoverenter", onEnter);
    elEvent.addEventListener("superhoverleave", onLeave);
    elEvent.addEventListener("superhovermove", onMove);
    ctrl = createSuperHover({ root: elEvent });
    if (paused) ctrl.pause();
  });

  function syncPause(): void {
    if (!ctrl) return;
    if (paused) ctrl.pause();
    else ctrl.resume();
  }

  onDestroy(() => {
    if (ctrl) ctrl.destroy();
    if (eventRoot && onEnter && onLeave && onMove) {
      eventRoot.removeEventListener("superhoverenter", onEnter);
      eventRoot.removeEventListener("superhoverleave", onLeave);
      eventRoot.removeEventListener("superhovermove", onMove);
    }
  });
</script>

<div class="page">
  <section class="panel" aria-labelledby="event-heading">
    <div class="event-toolbar" aria-live="polite">
      <span class="event-pill-label">Active:</span>
      <span class="event-pill">{activePill}</span>
      <span class="event-pill-label">Moves:</span>
      <span class="event-pill event-pill--metric">{moveCount}</span>
      <span class="event-pill-label">Last:</span>
      <span class="event-pill event-pill--metric">{movePoint}</span>
      <label class="event-toolbar-switch">
        <input type="checkbox" bind:checked={paused} on:change={syncPause} />
        Pause hit-test
      </label>
    </div>
    <div bind:this={elEvent} class="scroller" tabindex="0">
      {#each items as n (n + 10000)}
        <div
          class="row row--event"
          data-super-hover
          data-row-id={String(n)}
        >
          <span class="row-label">Item {n}</span>
        </div>
      {/each}
    </div>
  </section>
</div>
