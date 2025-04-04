<script setup lang="ts"></script>

<template>
  <div class="hero_area">
    <div class="slot"><slot /></div>
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
      <g class="parallax">
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
  background-color: black;
}

.waves {
  position: absolute;
  width: 100%;
  max-height: 90%;
  bottom: 0;
  left: 0;
}

.parallax > use {
  animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}

.parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 17s;
  fill: rgba($yellow, 0.2);
}

.parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 25s;
  fill: rgba($blue, 0.2);
}

.parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 33s;
}

.parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 40s;
}

@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }

  100% {
    transform: translate3d(85px, 0, 0);
  }
}

/*Shrinking for mobile*/

@media (max-width: 768px) {
  .waves {
    height: 40px;
    min-height: 40px;
  }
}

//.slot * {
//  background-clip: text;
//  -webkit-background-clip: text;
//}
</style>
