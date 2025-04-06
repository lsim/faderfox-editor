<script setup lang="ts">
import { computed, ref } from 'vue';
const props = defineProps<{
  copyActive: boolean;
  alwaysShow: boolean;
  canPaste: boolean;
}>();

const emit = defineEmits<{
  (event: 'copy', e: MouseEvent): void;
  (event: 'paste', e: MouseEvent): void;
}>();

const isHovered = ref(false);

const showCopy = computed(() => props.copyActive && (props.alwaysShow || isHovered.value));
const showPaste = computed(
  () => props.copyActive && props.canPaste && (props.alwaysShow || isHovered.value),
);
</script>

<template>
  <div class="wrapper" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <slot></slot>
    <div class="copy-button" :class="{ in: showCopy }" @click="emit('copy', $event)">copy</div>
    <div class="paste-button" :class="{ in: showPaste }" @click="emit('paste', $event)">paste</div>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/main.scss' as *;
@use '@picocss/pico/scss/colors/index.scss' as *;

.wrapper {
  position: relative;
}

.copy-button,
.paste-button {
  position: absolute;
  top: 1px;
  opacity: 0;
  transition:
    opacity 0.3s ease,
    left 0.3s ease,
    right 0.3s ease;
  font-size: 0.4em;
  font-weight: bold;
  line-height: 4em;
  text-transform: uppercase;
  rotate: -90deg;
  background-color: $white;
  border: 1px solid $black;
  cursor: pointer;

  width: 3.9em;
  color: $black;
  &.in {
    opacity: 0.8;
  }
}
$radius: 4px;
.copy-button {
  left: -3em;
  border-bottom-right-radius: $radius;
  border-bottom-left-radius: $radius;
  border-top: none;
  &.in {
    left: -0.7em;
  }
}
.paste-button {
  right: -3em;
  border-top-right-radius: $radius;
  border-top-left-radius: $radius;
  border-bottom: none;
  &.in {
    right: -0.7em;
  }
}
</style>
