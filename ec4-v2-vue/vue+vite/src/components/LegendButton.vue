<script setup lang="ts">
import Modal from '@/components/Modal.vue';
import LegendContent from '@/components/LegendContent.vue';
import { ref } from 'vue';
import { onKeyStroke } from '@vueuse/core';

const dialog = ref<{ showIt: (...args: unknown[]) => Promise<void> } | null>(null);

function showIt() {
  dialog.value?.showIt('Keyboard shortcuts', null, 'Got it', null).catch(() => {});
}

onKeyStroke('?', (e) => {
  e.preventDefault();
  showIt();
});
</script>

<template>
  <div class="legend-button" @click="showIt">
    ?<modal ref="dialog">
      <template #message>
        <legend-content />
      </template>
    </modal>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/main.scss' as *;
@use '@picocss/pico/scss/colors/index.scss' as *;
// A round button with a question mark
.legend-button {
  background: transparent;
  font-weight: bold;
  color: $yellow-500;
  border: 2px solid $yellow-500;
  cursor: pointer;
  width: 2em;
  height: 2em;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    color: $yellow-200;
    border-color: $yellow-200;
  }
}
</style>
