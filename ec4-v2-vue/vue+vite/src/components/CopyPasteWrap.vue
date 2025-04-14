<script setup lang="ts">
import { computed, ref } from 'vue';
import useCopyPaste from '@/composables/copy-paste';
import { Copy, ClipboardPaste } from 'lucide-vue-next';
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
    <a
      class="copy-button"
      :class="{ in: showCopy }"
      @click="emit('copy', $event)"
      title="Copy"
      tabindex="-1"
    >
      <copy class="icon" />
    </a>
    <a
      class="paste-button"
      :class="{ in: showPaste }"
      @click="emit('paste', $event)"
      title="Paste"
      tabindex="-1"
    >
      <clipboard-paste class="icon" />
    </a>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/main.scss' as *;
@use '@picocss/pico/scss/colors/index.scss' as *;

.wrapper {
  position: relative;
  overflow: hidden;
  display: grid;

  .copy-button,
  .paste-button {
    position: absolute;
    align-self: center;
    top: 10%;
    padding: 2px;
    cursor: pointer;
    opacity: 0;
    display: flex;
    background-color: $black;
    pointer-events: none;
    border-radius: 50%;
    transition:
      opacity 0.3s ease,
      left 0.3s ease,
      right 0.3s ease,
      filter 0.2s ease;
    z-index: 2;
    border: solid 2px rgba(255, 255, 255, 0.6);

    &:hover {
      filter: drop-shadow(0 0 0.3rem $white);
    }

    &.in {
      opacity: 1;
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
}
</style>
