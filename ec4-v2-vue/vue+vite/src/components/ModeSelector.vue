<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';

const { t } = useI18n();

const ec4 = useEc4Store();
</script>

<template>
  <div id="modeselect" title="Select encoder function to edit: Turn or push button">
    <a
      href=""
      @click.prevent="ec4.setEditorMode('turn')"
      :class="{ active: ec4.editorMode === 'turn' }"
      >{{ t('EDITOR_MODE_TURN') }}</a
    >
    <a
      href=""
      @click.prevent="ec4.setEditorMode('push')"
      :class="{ active: ec4.editorMode === 'push' }"
      >{{ t('EDITOR_MODE_PUSH') }}</a
    >
  </div>
</template>

<style scoped lang="scss">
@use '../assets/main.scss' as *;
@use '@picocss/pico/scss/colors/index.scss' as *;

#modeselect {
  border: 1px solid white;
  border-bottom: none;
  border-top-left-radius: 0.5em;
  border-top-right-radius: 0.5em;
  display: flex;
  justify-content: space-around;
  align-items: center;
  color: $textColor;
  padding: 4px;

  a {
    text-decoration: none;
    color: inherit;
    filter: brightness(0.6);

    &.active {
      filter: brightness(1);
      color: $yellow;
    }
  }
}
</style>
