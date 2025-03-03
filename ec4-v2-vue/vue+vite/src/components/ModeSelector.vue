<script setup lang="ts">
const props = defineProps<{
  mode: 'turn' | 'push';
}>();

const emit = defineEmits<(event: 'update:mode', mode: 'turn' | 'push') => void>();
</script>

<template>
  <div id="modeselect" title="Select encoder function to edit: Turn or push button">
    <a @click="emit('update:mode', 'turn')">Turn</a>
    <a @click="emit('update:mode', 'push')">Push</a>
  </div>
</template>

<style scoped lang="scss">
#node-select {
  color: white;

  a {
    color: inherit;
  }
}
</style>
