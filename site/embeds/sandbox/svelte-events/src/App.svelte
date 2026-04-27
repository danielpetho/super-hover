<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { createSuperHover } from "./super-hover";

  const itemCount = 180;
  const items: number[] = Array.from({ length: itemCount }, (_, i) => i + 1);

  let elEvent: HTMLDivElement | undefined;
  let activePill = "None";
  let stop: (() => void) | undefined;
  let onEnter: ((e: Event) => void) | undefined;
  let onLeave: ((e: Event) => void) | undefined;
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
    elEvent.addEventListener("superhoverenter", onEnter);
    elEvent.addEventListener("superhoverleave", onLeave);
    stop = createSuperHover({ root: elEvent });
  });

  onDestroy(() => {
    if (stop) stop();
    if (eventRoot && onEnter && onLeave) {
      eventRoot.removeEventListener("superhoverenter", onEnter);
      eventRoot.removeEventListener("superhoverleave", onLeave);
    }
  });
</script>

<div class="page">
  <section class="panel" aria-labelledby="event-heading">
    <div class="event-toolbar" aria-live="polite">
      <span class="event-pill-label">Active:</span>
      <span class="event-pill">{activePill}</span>
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
