<script setup lang="ts">
import FrontPanel from '@/components/FrontPanel.vue';
import MidiSettings from '@/components/MidiSettings.vue';
import SetupListing from '@/components/SetupListing.vue';
import { ref, watch } from 'vue';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import StoredConfs from '@/components/StoredConfs.vue';
import BgWaves from '@/components/BgWaves.vue';
import { onKeyStroke } from '@vueuse/core';
import FillMacros from '@/components/FillMacros.vue';

const props = defineProps<{
  bundleId?: string;
}>();

const groupId = ref<number>(0);

const ec4 = useEc4Store();

// Insist that focus doesn't leave the editor inputs
function handleFocusOut(e: FocusEvent) {
  const fromTag = (e.relatedTarget as HTMLElement | undefined)?.tagName;
  // const toTag = (e.target as HTMLElement | undefined)?.tagName;
  console.log('focus out', fromTag, e.target, e.relatedTarget);
  if ((!fromTag || fromTag === 'A') && e.target) {
    const x = window.scrollX;
    const y = window.scrollY;
    // console.log('focus out', x, y, e.target, e.relatedTarget);
    (e.target as HTMLElement).focus?.();
    window.scrollTo(x, y);
  }
}

watch(
  () => props.bundleId,
  async (newId, oldId) => {
    console.log('new bundleId', newId, oldId);
    if (!newId) return;
    try {
      await ec4.loadBundle(Number.parseInt(newId, 10));
      return;
    } catch (e) {
      console.warn(e);
      // No usable bundle id - reset the editor
      await ec4.newBundle();
    }
  },
  { immediate: true },
);

const isCtrl = (e: KeyboardEvent) => e.ctrlKey || e.metaKey;

onKeyStroke('PageUp', (e) => {
  if (!isCtrl(e)) return;
  e.preventDefault();
  e.stopPropagation();
  if (e.shiftKey) {
    ec4.selectedGroupIndex = Math.max(0, ec4.selectedGroupIndex - 1);
  } else {
    ec4.selectedSetupIndex = Math.max(0, ec4.selectedSetupIndex - 1);
  }
});
onKeyStroke('PageDown', (e) => {
  if (!isCtrl(e)) return;
  e.preventDefault();
  e.stopPropagation();
  if (e.shiftKey) {
    ec4.selectedGroupIndex = Math.min(16 - 1, ec4.selectedGroupIndex + 1);
  } else {
    ec4.selectedSetupIndex = Math.min(16 - 1, ec4.selectedSetupIndex + 1);
  }
});
</script>

<template>
  <main @focusout="handleFocusOut" id="home">
    <div class="header">
      <bg-waves class="bg-waves" />
      <h1>Faderfox EC4 Editor</h1>
    </div>
    <midi-settings class="midi-settings" />
    <setup-listing class="group-selector" />
    <front-panel :group-id="groupId" class="front-panel" />

    <stored-confs class="stored-confs" />
    <fill-macros class="fill-macros" />
    <div class="credits">
      <h3>Credits</h3>
      <p>
        This version of the EC4 Web-MIDI editor for the Faderfox EC4 was (re)built by Lars Ole Avery
        Simonsen (<a href="https://github.com/lsim" tabindex="-1">lsim</a>). It borrows lots of code
        from the awesome original
        <a href="https://github.com/privatepublic-de/faderfox-editor" tabindex="-1">editor</a>
        developed by Peter Witzel in co-operation with Faderfox.
      </p>
      <p>
        Source code available on
        <a href="https://github.com/lsim/faderfox-editor" tabindex="-1">github</a>.
      </p>
      <h3>Complete Privacy:</h3>
      <p class="privacydeclaration">
        This web application (page) does not track or transmit any data entered here. Visits,
        appliance or any other interactions with this page are not tracked. If in doubt, feel free
        to check the source code.
      </p>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '@picocss/pico/scss/colors/index.scss' as *;

#home {
  margin: 0 auto;
  width: auto;
  display: grid;
  max-width: 1000px;
  grid-template-areas:
    'header header header'
    'alignment alignment alignment'
    'group-selector front-panel midi-settings'
    'group-selector front-panel fill-macros'
    'bundles bundles bundles'
    'credits credits credits';
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: auto 25px auto 1fr auto;

  .header {
    grid-area: header;
    h1 {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      justify-self: center;
    }

    .bg-waves {
      z-index: 1;
      height: 12vh;
    }
  }

  .midi-settings {
    grid-area: midi-settings;
    align-self: start;
  }

  .group-selector {
    grid-area: group-selector;
    align-self: start;
    justify-self: end;
  }

  .front-panel {
    grid-area: front-panel;
    grid-row: span 3;
  }

  .stored-confs {
    grid-area: bundles;
    margin-right: 1em;
    grid-row: span 1;
  }

  .fill-macros {
    grid-area: fill-macros;
    align-self: start;
    margin-top: 15px;
  }

  .credits {
    grid-area: credits;
    padding: 1em;
  }
}
</style>
