<script setup lang="ts">
import { computed, type ComputedRef, ref } from 'vue';
import { encoderScaleOptions, pushButtonScaleOptions, type ScaleOption } from '@/domain/Encoder.ts';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';

const props = withDefaults(
  defineProps<{
    modelValue: number;
    abbreviated?: boolean;
    tabindex?: number;
  }>(),
  {
    abbreviated: false,
  },
);

const ec4 = useEc4Store();

const select = ref<HTMLSelectElement | null>(null);

const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void;
  (event: 'focus', original: FocusEvent): void;
}>();

const options: ComputedRef<ScaleOption[]> = computed(() => {
  return ec4.editorMode === 'turn' ? encoderScaleOptions : pushButtonScaleOptions;
});

function handleChange(e: Event) {
  const selectedValue: number = Number.parseInt((e.target as HTMLSelectElement).value, 10) || 0;
  emit('update:modelValue', selectedValue);
}

defineExpose({
  focus() {
    select.value?.focus();
  },
  get value() {
    return options.value[props.modelValue].short;
  },
});
</script>

<template>
  <select
    :value="props.modelValue"
    @change="handleChange($event)"
    :tabindex="props.tabindex"
    ref="select"
    @focus="emit('focus', $event)"
  >
    <option v-for="n in options" :key="n.value" :value="n.value">
      {{ props.abbreviated ? n.short : n.text }}
    </option>
  </select>
</template>

<style scoped lang="scss"></style>
