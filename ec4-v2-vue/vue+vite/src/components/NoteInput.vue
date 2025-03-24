<script setup lang="ts">
import { watch, ref } from 'vue';
// From C-2 to G-8
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const noteOptions = [...Array(128).keys()].map((n) => noteToObject(n));

const props = defineProps<{
  modelValue: number;
  tabindex?: number;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', note: number): void;
  (event: 'focus', target: FocusEvent): void;
}>();

const noteInput = ref<HTMLInputElement | undefined>();

function noteToObject(n: number) {
  const name = noteNames[n % 12];
  const octave = Math.round(n / 12) - 2;
  return {
    text: `${name} ${octave || ''}`,
    value: n,
  };
}

watch(
  () => props.tabindex,
  (newVal) => {
    console.log('tabIndex', newVal);
  },
);

watch(
  () => props.modelValue,
  (newVal) => {
    console.log('note value', newVal);
  },
);

defineExpose({
  focus: () => noteInput.value?.focus(),
});
</script>

<template>
  <span class="note-inputs"
    ><input
      class="width_3"
      ref="noteInput"
      :value="props.modelValue"
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
      class="width_3"
      :value="props.modelValue"
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
    min-width: 0;
    flex: 2 0 10px;
    text-align: right;
    margin-right: 3px;
    // Remove the spinner
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
  select {
    min-width: 0;
    flex: 3 0 10px;
    margin-right: 3px;
  }
}
</style>
