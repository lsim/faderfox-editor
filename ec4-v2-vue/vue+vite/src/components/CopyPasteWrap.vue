<script setup lang="ts">
import { computed, ref } from 'vue';
import useCopyPaste from '@/composables/copy-paste';
const props = withDefaults(
  defineProps<{
    alwaysShow?: boolean;
    canPaste: boolean;
  }>(),
  {
    alwaysShow: false,
  },
);

const emit = defineEmits<{
  (event: 'copy', e: MouseEvent): void;
  (event: 'paste', e: MouseEvent): void;
}>();

const copyPaste = useCopyPaste();

const isHovered = ref(false);

const showCopy = computed(() => copyPaste.copyMode.value && (props.alwaysShow || isHovered.value));
const showPaste = computed(
  () => copyPaste.copyMode.value && props.canPaste && (props.alwaysShow || isHovered.value),
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
  overflow: hidden;
}

.copy-button,
.paste-button {
  display: flex;
  padding: 2px;
  align-items: center;
  position: absolute;
  top: 10%;
  height: 20%;
  min-height: 1.5em;
  opacity: 0;
  transition:
    opacity 0.3s ease,
    left 0.3s ease,
    right 0.3s ease;
  font-size: 70%;
  font-weight: bold;
  text-transform: uppercase;
  background: $white;
  border: 1px solid $black;
  cursor: pointer;
  pointer-events: none;
  z-index: 1;
  border-radius: 10%;
  color: $black;

  &.in {
    opacity: 0.9;
    pointer-events: all;
  }
}
.copy-button {
  left: -100%;
  &.in {
    left: 0;
  }
}
.paste-button {
  right: -100%;
  &.in {
    right: 0;
  }
}
</style>
