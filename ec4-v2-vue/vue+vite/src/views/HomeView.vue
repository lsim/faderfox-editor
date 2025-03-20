<script setup lang="ts">
import FrontPanel from '@/components/FrontPanel.vue';
import MidiSettings from '@/components/MidiSettings.vue';
import SetupListing from '@/components/SetupListing.vue';
import { ref } from 'vue';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';

const groupId = ref<number>(0);

const ec4 = useEc4Store();

// Insist that focus doesn't leave the editor
function handleFocusOut(e: FocusEvent) {
  if (!e.relatedTarget) {
    (e.target as HTMLElement | undefined)?.focus?.();
  }
}
</script>

<template>
  <main @focusout="handleFocusOut" id="home">
    <h1 class="header">Web-MIDI Editor for the faderfox EC4-MIDI controller</h1>
    <MidiSettings class="midi-settings" />
    <SetupListing class="group-selector" />
    <FrontPanel :group-id="groupId" class="front-panel" />

    <!--    <div class="credits">-->
    <!--      Web-MIDI Editor for the-->
    <!--      <a href="http://faderfox.de/ec4.html" tabindex="-1">faderfox EC4-MIDI controller</a>.-->
    <!--      Developed by Peter Witzel (<a href="https://www.privatepublic.de" tabindex="-1"-->
    <!--        >privatepublic.de</a-->
    <!--      >) in co-operation with Faderfox. Source code available on-->
    <!--      <a href="https://github.com/privatepublic-de/faderfox-editor" tabindex="-1">github</a>.-->
    <!--      <p class="privacydeclaration">-->
    <!--        <b>Complete Privacy:</b> This web application (page) does not track, store or dispatch any-->
    <!--        data entered here. Visits, appliance or any other interactions with this page are not-->
    <!--        tracked. If in doubt, feel free to check the source code.-->
    <!--      </p>-->
    <!--    </div>-->
  </main>
</template>

<style scoped lang="scss">
#home {
  margin: 0 10%;
  width: auto;
  display: grid;
  grid-template-areas:
    'header header header'
    'group-selector front-panel midi-settings'
    'footer footer footer';
  grid-template-columns: 1fr auto 1fr;

  .header {
    grid-area: header;
    margin-bottom: 3em;
  }

  .midi-settings {
    grid-area: midi-settings;
    align-self: baseline;
  }

  .group-selector {
    grid-area: group-selector;
    align-self: baseline;
    justify-self: end;
  }

  .front-panel {
    grid-area: front-panel;
    justify-self: start;
  }

  .credits {
    margin-left: 30%;
    margin-right: 30%;
    justify-self: end;
    grid-area: footer;
  }
}
</style>
