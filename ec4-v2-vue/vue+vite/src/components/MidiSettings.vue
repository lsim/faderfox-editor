<script setup lang="ts">
import useMidi from '@/composables/useMidi.ts';
import { watch, onBeforeUnmount, ref, nextTick } from 'vue';
import useConfirm from '@/composables/confirm.ts';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import { generateSysexData, parseSetupsFromSysex } from '@/memoryLayout.ts';
import useFileStorage from '@/composables/fileStorage.ts';
import { useStorage } from '@/composables/storage.ts';

const midi = useMidi();
const ec4 = useEc4Store();

const confirm = useConfirm();

onBeforeUnmount(() => {
  midi.dispose();
});

watch(
  () => midi.inputs.value,
  (newInputs) => {
    if (newInputs.length > 0) {
      midi.selectedInput.value =
        newInputs.find((i) => i.device.name === 'Faderfox EC4') || newInputs[0];
    }
  },
);

watch(
  () => midi.outputs.value,
  (newOutputs) => {
    if (newOutputs.length > 0) {
      midi.selectedOutput.value =
        newOutputs.find((o) => o.device.name === 'Faderfox EC4') || newOutputs[0];
    }
  },
);

// function loadSysexData() {
//   confirm
//     .showIt('Load Sysex Data', 'This will overwrite all existing settings.', 'Load data', 'Cancel')
//     .then(() => {
//       ec4.loadState();
//     })
//     .catch((e) => {
//       console.log('Data not saved', e);
//     });
// }
//
const fileStorage = useFileStorage();

function saveSetupsToDisk() {
  const bytes = generateSysexData(ec4.encoderSetups);
  fileStorage.saveSysexDataToDisk(bytes);
}

const storage = useStorage();

function saveSetupsToDb() {
  const bytes = generateSysexData(ec4.encoderSetups);
  storage.addBundle(bytes);
}
</script>

<template>
  <form id="midisettings" class="pico" v-if="midi.midiSupport.value">
    <Confirm>
      <!--      <template v-slot:message>Foobar</template>-->
    </Confirm>
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
    <!--    <button type="button" id="btnreceive" title="Receive settings from your EC4" tabindex="-1">-->
    <!--      Receive from EC4-->
    <!--    </button>-->
    <!--    <button-->
    <!--      type="button"-->
    <!--      title="Send editor data to your EC4"-->
    <!--      tabindex="-1"-->
    <!--    >-->
    <!--      Send to EC4 ⮕-->
    <!--    </button>-->
    <button
      @click="saveSetupsToDb"
      type="button"
      title="Save editor data to database"
      tabindex="-1"
    >
      Save to DB
    </button>
    <!--    <button-->
    <!--      @click="loadSysexData"-->
    <!--      type="button"-->
    <!--      title="Load a Sysex file with EC4 settings"-->
    <!--      tabindex="-1"-->
    <!--    >-->
    <!--      Load file-->
    <!--    </button>-->
    <button
      @click="saveSetupsToDisk"
      type="button"
      id="btnfilesave"
      title="Save editor data as Sysex file"
      tabindex="-1"
    >
      Save to disk
    </button>
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
