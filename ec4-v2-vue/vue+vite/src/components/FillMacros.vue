<script setup lang="ts">
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import useMacros from '@/composables/macros.ts';
import { computed } from 'vue';
import {
  encoderModes,
  encoderScaleOptions,
  encoderTypes,
  pushButtonModes,
  pushButtonScaleOptions,
  pushButtonTypes,
} from '@/domain/Encoder.ts';

const ec4 = useEc4Store();

const currentValue = computed(() => {
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

const macros = useMacros();
</script>

<template>
  <form class="fill-macros pico">
    <h3>
      <span v-if="ec4.activeNumberField">{{ currentValue }} ({{ ec4.activeNumberField }})</span>
    </h3>
    <button
      v-if="ec4.activeNumberField"
      @click.prevent="
        macros.copyToAll(ec4.selectedControl.numbers[ec4.activeNumberField], ec4.activeNumberField)
      "
    >
      Copy to all
    </button>
    <button @click.prevent="macros.copyToAll(1, 'channel')">Increment from</button>
    <button @click.prevent="macros.copyToAll(2, 'channel')">Decrement from</button>
    <span><button>Clear names</button><button>----</button></span>
    <button>Reset encoder</button>
  </form>
</template>

<style scoped lang="scss">
.fill-macros {
  display: flex;
  flex-direction: column;
  border: 2px solid white;
  border-radius: 6px;
  padding: 15px;

  > button,
  > span {
    margin-bottom: 10px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  > span {
    display: flex;
    justify-content: space-between;
    button {
      flex: 1 0 auto;
      &:not(:last-child) {
        margin-right: 10px;
      }
    }
  }
}
</style>
