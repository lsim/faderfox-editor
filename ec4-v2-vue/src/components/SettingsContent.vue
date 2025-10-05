<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings.ts';

const { settings } = useSettingsStore();
</script>

<template>
  <form class="pico settings-grid" v-if="settings">
    <label for="preventArrowEditing" class="labels">Disable up/down arrow key editing</label>
    <input
      id="preventArrowEditing"
      class="controls"
      type="checkbox"
      v-model="settings.preventArrowEditing"
    />
  </form>
</template>

<style scoped lang="scss">
.settings-grid {
  display: grid;
  .labels {
    align-self: center;
    grid-column: 1;
  }
  .controls {
    align-self: center;
    grid-column: 2;
  }
}
</style>
