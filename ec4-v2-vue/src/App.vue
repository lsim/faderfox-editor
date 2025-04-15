<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <RouterView />
</template>

<style lang="scss">
@use '@picocss/pico/scss/pico' with (
  $theme-color: 'slate',
  $parent-selector: '.pico'
);
@use '@/assets/main.scss';
</style>
