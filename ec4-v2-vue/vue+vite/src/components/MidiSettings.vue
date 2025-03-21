<script setup lang="ts">
import useMidi from '@/composables/useMidi.ts';
import { watch, onBeforeUnmount } from 'vue';
import useConfirm from '@/composables/confirm.ts';
import Confirm from '@/components/Confirm.vue';

const midi = useMidi();

const confirm = useConfirm();

onBeforeUnmount(() => midi.dispose());

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

function loadSysexFromFile() {
  midi.protocol.value
    ?.setSetupAndGroup(0, 0)
    .then(() => {
      return midi.protocol.value?.getSetupAndGroup();
    })
    .then((setupAndGroup) => {
      if (!setupAndGroup) return;
      console.log(
        'Setup and group response',
        Array.from(setupAndGroup).map((x) => x.toString(16)),
      );
      return midi.protocol.value?.requestGroupSnapshot();
    })
    .then((response) => {
      console.log('Snapshot response', response);
    });
  confirm
    .showIt(
      'Load Sysex File',
      'Please select a Sysex file with EC4 settings to load.',
      'Load file',
      'Cancel',
    )
    .then(() => {
      console.log('Load file');
    })
    .catch(() => {
      console.log('Cancelled');
    });
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
    <button type="button" title="Send editor data to your EC4" tabindex="-1">Send to EC4 ⮕</button>
    <button
      @click="loadSysexFromFile"
      type="button"
      title="Load a Sysex file with EC4 settings"
      tabindex="-1"
    >
      Load file
    </button>
    <button type="button" id="btnfilesave" title="Save editor data as Sysex file" tabindex="-1">
      Save file
    </button>
    <a href="#" id="upgradeFirmware">Upgrade EC4 to firmware 2.0</a>
    <table>
      <thead>
        <tr>
          <th>Received</th>
          <th># Setups</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>23:30:10</td>
          <td>16</td>
        </tr>
        <tr>
          <td>14:20:50</td>
          <td>1</td>
        </tr>
      </tbody>
    </table>
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
