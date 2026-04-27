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
        <div class="panel-head">
          <h2 id="native-heading">super-hover</h2>
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
import { onMounted, onUnmounted } from "vue";
import { createSuperHover } from "./super-hover";

const itemCount = 180;

let stop: (() => void) | undefined;

onMounted(() => {
  stop = createSuperHover();
});

onUnmounted(() => {
  stop?.();
});
</script>
