<script setup lang="ts">
import SingleEncoder from '@/components/SingleEncoder.vue';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import { computed, ref, useTemplateRef, nextTick, onMounted } from 'vue';
import { type ComponentExposed } from 'vue-component-type-helpers';
import { onKeyStroke } from '@vueuse/core';
import CopyPasteWrap from '@/components/CopyPasteWrap.vue';
import useCopyPaste from '@/composables/copy-paste';

const ec4 = useEc4Store();

const copyPaste = useCopyPaste();

const controls = computed(() => {
  return ec4.encoderGroups[ec4.selectedGroupIndex].controls;
});

const nameActive = ref<boolean>(false);

const root = ref<HTMLElement | null>(null);

const selectedRef = useTemplateRef<ComponentExposed<typeof SingleEncoder>[]>('selected');

function focusActiveEncoder() {
  selectedRef.value?.[0]?.focusInput();
}

// Escape returns focus to the active encoder's input
onKeyStroke('Escape', () => {
  if (root.value?.querySelector('input:focus')) return;
  focusActiveEncoder();
});

onKeyStroke(' ', (e) => {
  if (!e.shiftKey) return;
  e.preventDefault();
  e.stopPropagation();
  ec4.editorMode = ec4.editorMode === 'push' ? 'turn' : 'push';
  nextTick(() => {
    focusActiveEncoder();
  });
});

onMounted(() => {
  nextTick(() => {
    focusActiveEncoder();
  });
});
</script>

<template>
  <div id="ctrlcontainer" ref="root" class="encoder-container">
    <copy-paste-wrap
      v-for="(control, index) in controls"
      :key="control.id"
      :can-paste="copyPaste.canPasteEncoder.value"
      @copy="copyPaste.copyEncoder(control)"
      @paste="copyPaste.pasteEncoder(index)"
    >
      <single-encoder
        class="encoder"
        :encoder-id="control.id"
        :index="index"
        :name-active="nameActive"
        @click="ec4.selectedEncoderIndex = index"
        @focus.capture="ec4.selectedEncoderIndex = index"
        @update:name-active="nameActive = $event"
        :class="{ selected: control.id === ec4.selectedEncoderIndex }"
        :selected="control.id === ec4.selectedEncoderIndex"
        :ref="control.id === ec4.selectedEncoderIndex ? 'selected' : undefined"
      />
    </copy-paste-wrap>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/main.scss' as *;
@use '@picocss/pico/scss/colors/index.scss' as *;

#ctrlcontainer {
  &.encoder-container {
    // A 4 x 4 grid of encoders
    display: grid;
    grid-template-columns: repeat(4, 5.8em);
    grid-template-rows: repeat(4, 6.5em);

    .selected {
      // Mark the selected encoder
      border-radius: 10px;

      // Gently pulse the selected encoder
      animation: pulse 5s linear infinite;

      @keyframes pulse {
        0% {
          filter: drop-shadow(0px 3px 20px rgba($blue, 1));
        }
        50% {
          filter: drop-shadow(0px -3px 10px rgba($blue, 0.5));
        }
        100% {
          filter: drop-shadow(0 3px 20px rgba($blue, 1));
        }
      }
    }
  }
}
</style>
