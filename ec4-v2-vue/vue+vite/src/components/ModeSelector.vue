<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps<{
  mode: 'turn' | 'push';
}>();

const emit = defineEmits<{
  (event: 'update:mode', mode: 'turn' | 'push'): void;
}>();
</script>

<template>
  <div id="modeselect" title="Select encoder function to edit: Turn or push button">
    <a
      href
      @click.prevent="emit('update:mode', 'turn')"
      :class="{ active: props.mode === 'turn' }"
      >{{ t('EDITOR_MODE_TURN') }}</a
    >
    <a
      href
      @click.prevent="emit('update:mode', 'push')"
      :class="{ active: props.mode === 'push' }"
      >{{ t('EDITOR_MODE_PUSH') }}</a
    >
  </div>
</template>

<style scoped lang="scss">
@use '../assets/main.scss' as *;
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

    &.active {
      background-color: $active-field-color;
      border-radius: 0.3em;
      box-shadow: 0 0 10px $active-field-color;
    }
  }
}
</style>
