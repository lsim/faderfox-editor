<script setup lang="ts">

</script>

<template>
  <div id="midisettings">
    <div class="field">
      <label for="midiInDeviceId">MIDI Input:</label>
      <select
        id="midiInDeviceId"
        title="Please select the MIDI interface your EC4 is connected to for input."
        tabindex="-1"
      ><option>(No devices)</option></select
      >
    </div>
    <div class="field">
      <label for="midiOutDeviceId" tabindex="-1">MIDI Output:</label>
      <select
        id="midiOutDeviceId"
        title="Please select the MIDI interface your EC4 is connected to for output."
        tabindex="-1"
      ><option>(No devices)</option></select
      >
    </div>
    <div id="tb">
      <button
        type="button"
        id="btnreceive"
        title="Receive settings from your EC4"
        tabindex="-1"
      >
        Receive from EC4
      </button>
      <button
        type="button"
        id="btntransfer"
        title="Send editor data to your EC4"
        tabindex="-1"
      >
        Send to EC4
      </button>
      <button
        type="button"
        id="btnfileload"
        title="Load a Sysex file with EC4 settings"
        tabindex="-1"
        style="margin-left: 2em;"
      >
        Load file
      </button>
      <button
        type="button"
        id="btnfilesave"
        title="Save editor data as Sysex file"
        tabindex="-1"
      >
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
