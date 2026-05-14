<script lang="ts">
  import { superHover } from "./super-hover-svelte";

  const itemCount = 180;
  const items: number[] = Array.from({ length: itemCount }, (_, i) => i + 1);

  let activePill = "None";

  const hoverHandlers = {
    onEnter(e: Event) {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const id = t.dataset.rowId;
      if (id) activePill = `Item ${id}`;
    },
    onLeave(e: Event) {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (t.dataset.rowId) activePill = "None";
    },
  };
</script>

<div class="page">
  <section class="panel" aria-labelledby="event-heading">
    <div class="event-toolbar" aria-live="polite">
      <span class="event-pill-label">Active:</span>
      <span class="event-pill">{activePill}</span>
    </div>
    <div class="scroller" tabindex="0" use:superHover={hoverHandlers}>
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
