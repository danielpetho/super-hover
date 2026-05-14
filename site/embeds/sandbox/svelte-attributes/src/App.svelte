<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { createSuperHover, type SuperHoverController } from "./super-hover";

  const itemCount = 180;
  const items: number[] = Array.from({ length: itemCount }, (_, i) => i + 1);

  let paused = false;

  let superHover: SuperHoverController | undefined;

  function syncPause(): void {
    if (!superHover) return;
    if (paused) superHover.pause();
    else superHover.resume();
  }

  onMount(() => {
    superHover = createSuperHover();
    if (paused) superHover.pause();
  });

  onDestroy(() => {
    superHover?.destroy();
  });
</script>

<div class="page">
  <div class="compare">
    <section class="panel" aria-labelledby="native-heading">
      <div class="panel-head">
        <h2 id="native-heading">Native <code>:hover</code></h2>
      </div>
      <div class="scroller" tabindex="0">
        {#each items as n (n)}
          <div class="row row--native">
            <span class="row-label">Item {n}</span>
          </div>
        {/each}
      </div>
    </section>

    <section class="panel" aria-labelledby="super-heading">
      <div class="panel-head panel-head--row">
        <h2 id="super-heading">super-hover</h2>
        <label class="pause-switch">
          <input type="checkbox" bind:checked={paused} on:change={syncPause} />
          Pause
        </label>
      </div>
      <div class="scroller" tabindex="0">
        {#each items as n (n)}
          <div class="row row--super" data-super-hover>
            <span class="row-label">Item {n}</span>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>
