<template>
  <div class="page">
    <div class="compare">
      <section class="panel" aria-labelledby="native-heading">
        <div class="panel-head">
          <h2 id="native-heading">Native <code>:hover</code></h2>
        </div>
        <div class="scroller" tabindex="0">
          <div
            v-for="n in itemCount"
            :key="'n' + n"
            class="row row--native"
          >
            <span class="row-label">Item {{ n }}</span>
          </div>
        </div>
      </section>

      <section class="panel" aria-labelledby="super-heading">
        <div class="panel-head panel-head--row">
          <h2 id="super-heading">super-hover</h2>
          <label class="pause-switch">
            <input v-model="ui.paused" type="checkbox" @change="syncPause" />
            Pause
          </label>
        </div>
        <div class="scroller" tabindex="0">
          <div
            v-for="n in itemCount"
            :key="'s' + n"
            class="row row--super"
            data-super-hover
          >
            <span class="row-label">Item {{ n }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from "vue";
import { createSuperHover, type SuperHoverController } from "./super-hover";

const itemCount = 180;

const ui = reactive({ paused: false });

let superHover: SuperHoverController | undefined;

function syncPause(): void {
  if (!superHover) return;
  if (ui.paused) superHover.pause();
  else superHover.resume();
}

onMounted(() => {
  superHover = createSuperHover();
  if (ui.paused) superHover.pause();
});

onUnmounted(() => {
  superHover?.destroy();
});
</script>
