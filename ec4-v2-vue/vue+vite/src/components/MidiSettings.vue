<script setup lang="ts">
import useMidi from '@/composables/useMidi.ts';
import { watch, onBeforeUnmount } from 'vue';

const midi = useMidi();

onBeforeUnmount(() => {
  midi.dispose();
});

watch(
  () => midi.inputs.value,
  (newInputs) => {
    if (newInputs.length > 0) {
      const ffInput = newInputs.find((i) => i.device.name === 'Faderfox EC4');
      if (ffInput) {
        midi.selectedInput.value = ffInput;
      } else if (!midi.selectedInput.value) {
        midi.selectedInput.value = newInputs[0];
      }
    }
  },
);

watch(
  () => midi.outputs.value,
  (newOutputs) => {
    if (newOutputs.length > 0) {
      const ffOutput = newOutputs.find((o) => o.device.name === 'Faderfox EC4');
      if (ffOutput) {
        midi.selectedOutput.value = ffOutput;
      } else if (!midi.selectedOutput.value) {
        midi.selectedOutput.value = newOutputs[0];
      }
    }
  },
);
</script>

<template>
  <form id="midisettings" class="pico" v-if="midi.midiSupport.value">
    <label for="midiInDeviceId">MIDI Input:</label>
    <select
      id="midiInDeviceId"
      title="Please select the MIDI interface your EC4 is connected to for input."
      tabindex="-1"
      v-model="midi.selectedInput.value"
    >
      <option v-if="midi.inputs.value.length === 0">(No devices)</option>
      <option v-for="(i, k) in midi.inputs.value" :key="k" :value="i">{{ i.device.name }}</option>
    </select>
    <label for="midiOutDeviceId" tabindex="-1">MIDI Output:</label>
    <select
      id="midiOutDeviceId"
      title="Please select the MIDI interface your EC4 is connected to for output."
      tabindex="-1"
      v-model="midi.selectedOutput.value"
    >
      <option v-if="midi.outputs.value.length === 0">(No devices)</option>
      <option v-for="(o, k) in midi.outputs.value" :key="k" :value="o">
        {{ o.device.name }}
      </option>
    </select>
    <!--    <button-->
    <!--      @click="saveSetupsToDisk"-->
    <!--      type="button"-->
    <!--      id="btnfilesave"-->
    <!--      title="Save editor data as Sysex file"-->
    <!--      tabindex="-1"-->
    <!--    >-->
    <!--      Save to disk-->
    <!--    </button>-->
  </form>
</template>

<style scoped lang="scss">
#midisettings {
  max-width: 255px;
  border: 3px solid #ccc;
  border-radius: 7px;
  padding: 15px;

  label {
    white-space: nowrap;
  }
  display: grid;
  align-items: baseline;
}
</style>
