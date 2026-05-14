<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { createSuperHover, type SuperHoverController } from "./super-hover";

  const itemCount = 180;
  const items: number[] = Array.from({ length: itemCount }, (_, i) => i + 1);

  let superHover: SuperHoverController | undefined;

  onMount(() => {
    superHover = createSuperHover();
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
      <div class="panel-head">
        <h2 id="super-heading">super-hover</h2>
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
