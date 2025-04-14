<script setup lang="ts">
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import useMacros from '@/composables/macros.ts';
import { ArrowDown01, ArrowDown10, Eraser, ReplaceAll, CircleDashed } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import {
  encoderModes,
  encoderScaleOptions,
  encoderTypes,
  pushButtonModes,
  pushButtonScaleOptions,
  pushButtonTypes,
} from '@/domain/Encoder.ts';

const ec4 = useEc4Store();

const currentValueText = computed(() => {
  if (!ec4.activeNumberField || !ec4.selectedControl) return '';
  switch (ec4.activeNumberField) {
    case 'scale':
      return encoderScaleOptions[ec4.selectedControl.numbers.scale].short;
    case 'type':
      return encoderTypes[ec4.selectedControl.numbers.type].short;
    case 'mode':
      return encoderModes[ec4.selectedControl.numbers.mode].text;
    case 'pb_display':
      return pushButtonScaleOptions[ec4.selectedControl.numbers.pb_display].short;
    case 'pb_type':
      return pushButtonTypes[ec4.selectedControl.numbers.pb_type].short;
    case 'pb_mode':
      return pushButtonModes[ec4.selectedControl.numbers.pb_mode].text;
    default:
      return ec4.selectedControl.numbers[ec4.activeNumberField];
  }
});

const currentPropIsEnum = computed(() => {
  return (
    ec4.activeNumberField &&
    ['type', 'pb_type', 'mode', 'pb_mode', 'scale', 'pb_display'].includes(ec4.activeNumberField)
  );
});

const nameToSet = ref('');

const macros = useMacros();
</script>

<template>
  <form class="fill-macros pico">
    <h3>Macros</h3>
    <span v-if="ec4.activeNumberField" class="value-display"
      >{{ ec4.activeNumberField }}: {{ currentValueText }}</span
    >
    <button
      v-if="ec4.activeNumberField"
      class="copy-to-all"
      @click.prevent="
        macros.copyToAll(ec4.selectedControl.numbers[ec4.activeNumberField], ec4.activeNumberField)
      "
      title="Copy value to all"
    >
      <replace-all class="icon" />
    </button>
    <button
      v-if="ec4.activeNumberField"
      class="increment-from"
      :disabled="currentPropIsEnum"
      @click.prevent="
        macros.incrementFrom(
          ec4.selectedControl.numbers[ec4.activeNumberField],
          ec4.activeNumberField,
        )
      "
      title="Increment from"
    >
      <arrow-down-0-1 class="icon" />
    </button>
    <button
      v-if="ec4.activeNumberField"
      class="decrement-from"
      :disabled="currentPropIsEnum"
      @click.prevent="
        macros.incrementFrom(
          ec4.selectedControl.numbers[ec4.activeNumberField],
          ec4.activeNumberField,
          -1,
        )
      "
      title="Decrement from"
    >
      <arrow-down-1-0 class="icon" />
    </button>
    <button class="set-name" @click.prevent="macros.setAllNames(nameToSet)" title="Set all names">
      <eraser class="icon" />
    </button>
    <input
      type="text"
      placeholder="Name"
      title="Name to set"
      class="name-to-set"
      v-model="nameToSet"
    />
    <button @click.prevent="macros.resetEncoder()" title="Reset encoder" class="reset-encoder">
      <circle-dashed class="icon" />
    </button>
  </form>
</template>

<style scoped lang="scss">
@use '@picocss/pico/scss/colors/index.scss' as *;
.fill-macros {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
  border: 2px solid white;
  border-radius: 6px;
  padding: 15px;

  h3 {
    grid-column: 1 / span 2;
    grid-row: 1;
    justify-self: center;
  }

  .value-display {
    text-transform: capitalize;
    grid-column: 1 / span 2;
    grid-row: 2;
  }

  .copy-to-all {
    grid-row: 3;
  }

  .increment-from,
  .decrement-from {
    grid-row: 4;
  }

  .set-name,
  .name-to-set {
    grid-row: 5;
    margin-bottom: 0;
  }
}
</style>
