<script setup lang="ts">
import useMidi from '@/composables/useMidi.ts';
import { Midi } from '@/composables/useMidi.ts';
import { ref, watch, onBeforeUnmount } from 'vue';

const midi = await useMidi();

onBeforeUnmount(() => midi.dispose());

const selectedInput = ref<Midi | null>(null);
const selectedOutput = ref<Midi | null>(null);

// foo
watch(
  () => midi.inputs.value,
  (newInputs) => {
    if (newInputs.length > 0) {
      selectedInput.value = newInputs.find((i) => i.device.name === 'Faderfox EC4') || newInputs[0];
    }
  },
  { immediate: true },
);

watch(
  () => midi.outputs.value,
  (newOutputs) => {
    if (newOutputs.length > 0) {
      selectedOutput.value =
        newOutputs.find((o) => o.device.name === 'Faderfox EC4') || newOutputs[0];
    }
  },
  { immediate: true },
);
</script>

<template>
  <div id="midisettings">
    <div class="field">
      <label for="midiInDeviceId">MIDI Input:</label>
      <select
        id="midiInDeviceId"
        title="Please select the MIDI interface your EC4 is connected to for input."
        tabindex="-1"
        :disabled="midi.midiSupport.value === false"
        v-model="selectedInput"
      >
        <option v-if="midi.inputs.value.length === 0">(No devices)</option>
        <option v-for="(i, k) in midi.inputs.value" :key="k" :value="i">{{ i.device.name }}</option>
      </select>
    </div>
    <div class="field">
      <label for="midiOutDeviceId" tabindex="-1">MIDI Output:</label>
      <select
        id="midiOutDeviceId"
        title="Please select the MIDI interface your EC4 is connected to for output."
        tabindex="-1"
        :disabled="midi.midiSupport.value === false"
        v-model="selectedOutput"
      >
        <option v-if="midi.outputs.value.length === 0">(No devices)</option>
        <option v-for="(o, k) in midi.outputs.value" :key="k" :value="o">
          {{ o.device.name }}
        </option>
      </select>
    </div>
    <div id="tb">
      <button type="button" id="btnreceive" title="Receive settings from your EC4" tabindex="-1">
        Receive from EC4
      </button>
      <button type="button" id="btntransfer" title="Send editor data to your EC4" tabindex="-1">
        Send to EC4
      </button>
      <button
        type="button"
        id="btnfileload"
        title="Load a Sysex file with EC4 settings"
        tabindex="-1"
        style="margin-left: 2em"
      >
        Load file
      </button>
      <button type="button" id="btnfilesave" title="Save editor data as Sysex file" tabindex="-1">
        Save file
      </button>
      <a href="#" id="upgradeFirmware">Upgrade EC4 to firmware 2.0</a>
    </div>
  </div>
</template>

<style scoped lang="scss">
#midisettings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  .field {
  }
}
</style>
