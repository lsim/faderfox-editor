<script setup lang="ts">
import FrontPanel from '@/components/FrontPanel.vue';
import MidiSettings from '@/components/MidiSettings.vue';
import SetupListing from '@/components/SetupListing.vue';
import { ref } from 'vue';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';

const groupId = ref<string>('GR01');

const ec4 = useEc4Store();

// Insist that focus doesn't leave the editor
function handleFocusOut(e: FocusEvent) {
  if (!e.relatedTarget) {
    (e.target as HTMLElement | undefined)?.focus?.();
  }
}
</script>

<template>
  <main @focusout="handleFocusOut">
    <MidiSettings id="midisettings" />
    <SetupListing />
    <FrontPanel :group-id="groupId" />

    <div class="credits">
      Web-MIDI Editor for the
      <a href="http://faderfox.de/ec4.html" tabindex="-1">faderfox EC4-MIDI controller</a>.
      Developed by Peter Witzel (<a href="https://www.privatepublic.de" tabindex="-1"
        >privatepublic.de</a
      >) in co-operation with Faderfox. Source code available on
      <a href="https://github.com/privatepublic-de/faderfox-editor" tabindex="-1">github</a>.
      <p class="privacydeclaration">
        <b>Complete Privacy:</b> This web application (page) does not track, store or dispatch any
        data entered here. Visits, appliance or any other interactions with this page are not
        tracked. If in doubt, feel free to check the source code.
      </p>
    </div>
  </main>
</template>

<style scoped lang="scss"></style>
