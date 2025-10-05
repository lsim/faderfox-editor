<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { watchDebounced } from '@vueuse/core';
import { useSettingsStore } from '@/stores/settings.ts';

export type Range = { from: number; to: number };

const props = withDefaults(
  defineProps<{
    tabindex?: number;
    ranges: Range[];
  }>(),
  {
    tabindex: -1,
  },
);

const model = defineModel<number>({ required: true });

const emit = defineEmits<{
  (event: 'input', value: number): void;
  (event: 'focus', target: FocusEvent): void;
}>();

const input = useTemplateRef<HTMLInputElement>('input');

function getContainingRangeIndex(value: number) {
  return props.ranges?.findIndex((r) => r.from <= value && value <= r.to) ?? -1;
}

function getLowestValue() {
  return props.ranges?.[0].from ?? Number.MIN_VALUE;
}

function getHighestValue() {
  return props.ranges?.[props.ranges.length - 1].to ?? Number.MAX_VALUE;
}

function validate() {
  if (!input.value) return;
  const asNumber = parseInt(input.value.value || '0', 10);
  const lowestValue = getLowestValue();
  let value = isNaN(asNumber) ? lowestValue : asNumber;

  const containingRange = getContainingRangeIndex(value);
  if (containingRange === -1 && props.ranges) {
    // An invalid value was entered. Replace it with a nearby valid value
    let fixedIt = false;
    for (let i = 0; i < props.ranges.length; i++) {
      const range = props.ranges[i];
      if (range.from > value) {
        value = range.to;
        fixedIt = true;
        break;
      }
    }
    if (!fixedIt) {
      value = getHighestValue();
    }
  }
  if (value !== model.value) {
    console.log('correcting model', model.value, 'to', value);
    model.value = value;
  }
  if (input.value.value !== value.toString()) {
    // NOTE: model.value won't change if it is already 16, and we type 1. Hence, the manual update to undo what the user did
    console.log('correcting input', input.value.value, 'to', value.toString());
    input.value.value = value.toString();
  }
}

const { settings } = useSettingsStore();

function handleIncrement() {
  if (settings.preventArrowEditing) return;
  const containingRange = getContainingRangeIndex(model.value);
  if (
    containingRange === -1 ||
    (containingRange === props.ranges.length - 1 &&
      model.value === props.ranges[containingRange].to)
  ) {
    model.value = getHighestValue();
    return;
  }
  if (props.ranges[containingRange].to === model.value) {
    model.value = props.ranges[containingRange + 1].from;
  } else {
    model.value++;
  }
}

function handleDecrement() {
  if (settings.preventArrowEditing) return;
  const containingRange = getContainingRangeIndex(model.value);
  if (
    containingRange === -1 ||
    (containingRange === 0 && model.value === props.ranges[containingRange].from)
  ) {
    model.value = getLowestValue();
    return;
  }
  if (props.ranges[containingRange].from === model.value) {
    model.value = props.ranges[containingRange - 1].to;
  } else {
    model.value--;
  }
}

// Rectify invalid values from both the user and the parent
watchDebounced(() => [model.value, input.value, props.ranges], validate, {
  debounce: 100,
});

defineExpose({
  get value() {
    return model.value;
  },
  focus() {
    input.value?.focus();
  },
});
</script>

<template>
  <input
    ref="input"
    :value="model"
    @keydown.up.exact.prevent.stop="handleIncrement"
    @keydown.down.exact.prevent.stop="handleDecrement"
    @input="model = parseInt(($event.target as HTMLInputElement).value || '0', 10)"
    type="text"
    :tabindex="props.tabindex"
    @focus="emit('focus', $event)"
  />
</template>

<style scoped lang="scss"></style>
