<script setup lang="ts">
import { computed, ref } from 'vue';
import useCopyPaste from '@/composables/copy-paste';
import { Copy, ClipboardPaste, CloudUpload } from 'lucide-vue-next';
import useApiClient from '@/composables/api-client.ts';

const props = withDefaults(
  defineProps<{
    alwaysShow?: boolean;
    canPaste: boolean;
    showPublishLink?: boolean;
  }>(),
  {
    alwaysShow: false,
    showPublishLink: false,
  },
);

const apiClient = useApiClient();

const emit = defineEmits<{
  (event: 'copy', e: MouseEvent): void;
  (event: 'paste', e: MouseEvent): void;
  (event: 'publish', e: MouseEvent): void;
}>();

const copyPaste = useCopyPaste();

const isHovered = ref(false);

const showCopy = computed(() => copyPaste.copyMode.value && (props.alwaysShow || isHovered.value));
const showPaste = computed(
  () => copyPaste.copyMode.value && props.canPaste && (props.alwaysShow || isHovered.value),
);
const showPublish = computed(() => copyPaste.copyMode.value && isHovered.value);
</script>

<template>
  <div class="wrapper" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <slot></slot>
    <div class="copy-wrapper">
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
    <a
      class="publish-button"
      :class="{ in: showPublish }"
      v-if="showPublishLink"
      @click="emit('publish', $event)"
      title="Publish"
      tabindex="-1"
    >
      <cloud-upload class="icon" />
    </a>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/main.scss' as *;
@use '@picocss/pico/scss/colors/index.scss' as *;

.wrapper {
  position: relative;

  .copy-wrapper {
    display: grid;
    pointer-events: none;
    position: absolute;
    overflow: hidden;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
  }

  .copy-button,
  .paste-button,
  .publish-button {
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

  .publish-button {
    left: 0;
    &.in {
      left: -30px;
    }
  }
}
</style>
