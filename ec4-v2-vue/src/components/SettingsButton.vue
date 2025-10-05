<script setup lang="ts">
import Modal from '@/components/Modal.vue';
import { ref } from 'vue';
import SettingsContent from '@/components/SettingsContent.vue';

const dialog = ref<{ showIt: (...args: unknown[]) => Promise<void> } | null>(null);

function showIt() {
  dialog.value?.showIt('Settings', null, 'Ok', null).catch(() => {});
}
</script>

<template>
  <div class="settings-button" @click="showIt">
    <!-- Append &#xfe0e; to get the text version of the character (which can be styled with css) -->
    <span class="text">⚙&#xfe0e;</span>
    <modal ref="dialog">
      <template #message>
        <settings-content />
      </template>
    </modal>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/main.scss' as *;
@use '@picocss/pico/scss/colors/index.scss' as *;
// A round button with a cog
.settings-button {
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

  .text {
    margin-top: -2px;
    display: flex;
    font-size: 150%;
  }

  &:hover {
    color: $yellow-200;
    border-color: $yellow-200;
  }
}
</style>
