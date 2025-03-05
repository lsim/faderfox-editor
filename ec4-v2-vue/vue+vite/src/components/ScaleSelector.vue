<script setup lang="ts">
import { computed, ComputedRef } from 'vue';
import { encoderScaleOptions, pushButtonScaleOptions, type ScaleOption } from '@/domain/Encoder.ts';

const props = withDefaults(
  defineProps<{
    modelValue: number;
    abbreviated?: boolean;
    mode: 'turn' | 'push';
  }>(),
  {
    abbreviated: false,
  },
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void;
}>();

const options: ComputedRef<ScaleOption[]> = computed(() => {
  return props.mode === 'turn' ? encoderScaleOptions : pushButtonScaleOptions;
});
</script>

<template>
  <select
    :value="props.modelValue"
    @change="emit('update:modelValue', parseInt($event.target.value, 10))"
  >
    <option v-for="n in options" :key="n.value" :value="n.value">
      {{ props.abbreviated ? n.short : n.text }}
    </option>
  </select>
</template>

<style scoped lang="scss"></style>
