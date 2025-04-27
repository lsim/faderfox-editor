<script setup lang="ts">
import { ref, computed } from 'vue';
// From C-2 to G-8
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const noteOptions = [...Array(128).keys()].map((n) => noteToObject(n));

const props = defineProps<{
  tabindex?: number;
}>();

const value = defineModel<number>();

const emit = defineEmits<{
  (event: 'update:modelValue', note: number): void;
  (event: 'focus', target: FocusEvent): void;
}>();

const noteInput = ref<HTMLInputElement | undefined>();

function noteToObject(n: number) {
  const name = noteNames[n % 12];
  const octave = Math.round(n / 12) - 2;
  return {
    text: `${name}${octave || ''}`,
    value: n,
  };
}

const numDecimals = computed(() => {
  return value.value?.toFixed(0).length ?? 0;
});

defineExpose({
  focus: () => noteInput.value?.focus(),
  get value() {
    return noteOptions[value.value ?? -1]?.text ?? '';
  },
});
</script>

<template>
  <span class="note-inputs"
    ><input
      :class="`decimals-${numDecimals}`"
      ref="noteInput"
      :value="value"
      type="number"
      :tabindex="props.tabindex ?? -1"
      @input="
        emit(
          'update:modelValue',
          parseInt((($event.target as HTMLInputElement) || undefined)?.value ?? '0', 10),
        )
      "
      maxlength="3"
      @focus="emit('focus', $event)"
    /><select
      :value="value"
      :tabindex="props.tabindex ?? -1"
      @change="
        emit('update:modelValue', parseInt(($event.target as HTMLOptionElement)?.value ?? '0', 10))
      "
      @focus="emit('focus', $event)"
    >
      <option v-for="n in noteOptions" :key="n.value" :value="n.value">{{ n.text }}</option>
    </select>
  </span>
</template>

<style scoped lang="scss">
.note-inputs {
  display: flex;

  max-width: 100%;
  input {
    transition: flex 0.2s ease;
    &.decimals-1 {
      flex: 1 0 1em;
    }
    &.decimals-2 {
      flex: 1 0 1.5em;
    }
    &.decimals-3 {
      flex: 1 0 2.5em;
    }
    min-width: 0;
    text-align: right;
    margin-right: 2px;
    // Remove the spinner
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
  select {
    min-width: 0;
    text-align: left;
    flex: 3 0 2em;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }
}
</style>
