<script setup lang="ts">
import FrontPanel from '@/components/FrontPanel.vue';
import MidiSettings from '@/components/MidiSettings.vue';
import SetupListing from '@/components/SetupListing.vue';
import { ref, watch } from 'vue';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import useFileStorage from '@/composables/fileStorage.ts';
import StoredConfs from '@/components/StoredConfs.vue';
import { Ec4Bundle } from '@/domain/Ec4Bundle.ts';
import BgWaves from '@/components/BgWaves.vue';
import { onKeyStroke } from '@vueuse/core';

const props = defineProps<{
  bundleId?: string;
}>();

const groupId = ref<number>(0);

const ec4 = useEc4Store();
const fileStorage = useFileStorage();

// Insist that focus doesn't leave the editor inputs
function handleFocusOut(e: FocusEvent) {
  const fromTag = (e.relatedTarget as HTMLElement | undefined)?.tagName;
  // const toTag = (e.target as HTMLElement | undefined)?.tagName;
  if ((!fromTag || fromTag === 'A') && e.target) {
    const x = window.scrollX;
    const y = window.scrollY;
    // console.log('focus out', x, y, e.target, e.relatedTarget);
    (e.target as HTMLElement).focus?.();
    window.scrollTo(x, y);
  }
}

// Make download link available to fileStorage composable
const downloadLink = ref<HTMLAnchorElement | null>(null);
watch(
  () => downloadLink.value,
  (link) => {
    fileStorage.setDownloadLink(link);
  },
);

watch(
  () => props.bundleId,
  (newId, oldId) => {
    console.log('new bundleId', newId, oldId);
    if (newId) {
      ec4.loadBundle(Number.parseInt(newId, 10));
    } else if (oldId) {
      ec4.activeBundle = Ec4Bundle.createEmpty();
    }
  },
  { immediate: true },
);

onKeyStroke(' ', (e) => {
  if (!e.shiftKey) return;
  e.preventDefault();
  e.stopPropagation();
  ec4.editorMode = ec4.editorMode === 'push' ? 'turn' : 'push';
  ec4.controlFocusRequests++;
});
onKeyStroke('q', (e) => {
  if (!e.ctrlKey) return;
  e.preventDefault();
  e.stopPropagation();
  ec4.selectedSetupIndex = Math.max(0, ec4.selectedSetupIndex - 1);
});
onKeyStroke('a', (e) => {
  if (!e.ctrlKey) return;
  e.preventDefault();
  e.stopPropagation();
  ec4.selectedSetupIndex = Math.min(16 - 1, ec4.selectedSetupIndex + 1);
});
onKeyStroke('t', (e) => {
  if (!e.ctrlKey) return;
  e.preventDefault();
  e.stopPropagation();
  ec4.selectedGroupIndex = Math.max(0, ec4.selectedGroupIndex - 1);
});
onKeyStroke('g', (e) => {
  if (!e.ctrlKey) return;
  e.preventDefault();
  e.stopPropagation();
  ec4.selectedGroupIndex = Math.min(16 - 1, ec4.selectedGroupIndex + 1);
});
</script>

<template>
  <main @focusout="handleFocusOut" id="home">
    <a
      :href="fileStorage.blobUrl.value"
      ref="downloadLink"
      download="ec4-sysex.syx"
      style="display: none"
    ></a>
    <div class="header">
      <bg-waves class="bg-waves" />
      <h1>Faderfox EC4 Editor</h1>
    </div>
    <midi-settings class="midi-settings" />
    <setup-listing class="group-selector" />
    <front-panel :group-id="groupId" class="front-panel" />

    <StoredConfs class="stored-confs" />
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
  margin: 0 10%;
  width: auto;
  display: grid;
  grid-template-areas:
    'header header header'
    'alignment alignment alignment'
    'group-selector front-panel midi-settings'
    'bundles bundles bundles'
    'credits credits credits';
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: auto 25px auto auto;

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
    grid-row: span 2;
  }

  .stored-confs {
    grid-area: bundles;
    margin-right: 1em;
  }

  .credits {
    grid-area: credits;
    padding: 1em;
  }
}
</style>
