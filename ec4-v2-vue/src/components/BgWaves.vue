<script setup lang="ts">
import { ref, watch } from 'vue';
import { useIdle } from '@vueuse/core';

const { idle } = useIdle();

const paused = ref(false);

watch(
  idle,
  (newValue) => {
    paused.value = !newValue;
  },
  { immediate: true },
);
</script>

<template>
  <div class="hero_area">
    <svg
      class="waves"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 24 150 28"
      preserveAspectRatio="none"
      shape-rendering="auto"
    >
      <defs>
        <path
          id="gentle-wave"
          d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
        />
      </defs>
      <g class="parallax" :class="{ paused: paused }">
        <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(0,0,0,0.7" />
        <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(0,0,0,0.5)" />
        <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(0,0,0,0.3)" />
        <use xlink:href="#gentle-wave" x="48" y="7" fill="rgba(0,0,0,0.5)" />
      </g>
    </svg>
  </div>
</template>

<style scoped lang="scss">
@use '@picocss/pico/scss/colors/index.scss' as *;
.hero_area {
  position: relative;
  height: 100vh;
  background-color: transparent;
}

.waves {
  position: absolute;
  width: 100%;
  max-height: 90%;
  bottom: 0;
  left: 0;
}

.parallax {
  > use {
    animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
  }

  &.paused > use {
    animation-play-state: paused;
  }

  > use:nth-child(1) {
    animation-delay: -12s;
    animation-duration: 17s;
    fill: rgba($yellow-300, 0.3);
  }

  > use:nth-child(2) {
    animation-delay: -23s;
    animation-duration: 30s;
    fill: rgba($blue-500, 0.3);
  }

  > use:nth-child(3) {
    animation-delay: -44s;
    animation-duration: 40s;
  }

  > use:nth-child(4) {
    animation-delay: -15s;
    animation-duration: 60s;
  }
}

@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }

  100% {
    transform: translate3d(85px, 0, 0);
  }
}
</style>
