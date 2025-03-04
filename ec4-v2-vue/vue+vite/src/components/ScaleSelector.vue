<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string | undefined;
    abbreviated?: boolean;
  }>(),
  {
    abbreviated: false,
  },
);

const emit = defineEmits(['update:modelValue']);

const scaleOptions = ref([
  { text: 'display off', value: 0 },
  { text: '0...127', value: 1 },
  { text: '0...100', value: 2 },
  { text: '0...1000', value: 3 },
  { text: '-63...+63', value: 4 },
  { text: '-50...+50', value: 5 },
  { text: '-500...+500', value: 6 },
  { text: 'ON / OFF', value: 7 },
  { text: '9999', value: 8 },
]);

const abbreviatedOptions = ref([
  { text: 'off', value: 0 },
  { text: '127', value: 1 },
  { text: '100', value: 2 },
  { text: '1000', value: 3 },
  { text: '±63', value: 4 },
  { text: '±50', value: 5 },
  { text: '±500', value: 6 },
  { text: 'ONOF', value: 7 },
  { text: '9999', value: 8 },
]);

const options = computed(() => {
  if (props.abbreviated) {
    return abbreviatedOptions.value;
  }
  return scaleOptions.value;
});
</script>

<template>
  <select
    data-watch="scale"
    :value="props.modelValue"
    @change="emit('update:modelValue', $event.target.value)"
  >
    <option v-for="n in options" :key="n.value" :value="n.value">{{ n.text }}</option>
  </select>
</template>

<style scoped lang="scss"></style>
