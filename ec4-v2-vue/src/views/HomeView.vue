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
import { Earth, SlidersVertical } from 'lucide-vue-next';
import Store from '@/components/store/Store.vue';
import useApiClient from '@/composables/api-client.ts';
import useToast from '@/composables/toast.ts';
import Toaster from '@/components/Toaster.vue';

const props = defineProps<{
  bundleId?: string;
}>();

const groupId = ref<number>(0);

const toast = useToast();

const ec4 = useEc4Store();
const apiClient = useApiClient();

// Insist that focus doesn't leave the editor inputs
function handleFocusOut(e: FocusEvent) {
  const fromTag = (e.relatedTarget as HTMLElement | undefined)?.tagName;
  // const toTag = (e.target as HTMLElement | undefined)?.tagName;
  console.debug('focus out', fromTag, e.target, e.relatedTarget);
  if ((!fromTag || fromTag === 'A') && e.target) {
    const x = window.scrollX;
    const y = window.scrollY;
    // console.log('focus out', x, y, e.target, e.relatedTarget);
    (e.target as HTMLElement).focus?.();
    window.scrollTo(x, y);
  }
}

// For pulsing the store icon
const newUpdateReceived = ref(false);
watch(apiClient.numUpdates, () => {
  newUpdateReceived.value = true;
  setTimeout(() => {
    newUpdateReceived.value = false;
  }, 2000);
});

watch(
  () => props.bundleId,
  async (newId, oldId) => {
    console.debug('new bundleId', newId, oldId);
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
    <toaster />
    <div class="header">
      <bg-waves class="bg-waves" />
      <div class="store-thumb shadow" @click="ec4.showStore = !ec4.showStore">
        <earth
          class="icon"
          v-if="!ec4.showStore"
          :size="50"
          :class="{ animated: apiClient.token.value, pulsing: newUpdateReceived }"
        /><sliders-vertical class="bordered icon" v-else :size="50" />
      </div>

      <h1>Faderfox EC4 Editor</h1>
    </div>
    <div class="midi-settings">
      <midi-settings v-if="!ec4.showStore" class="shadow" />
    </div>
    <template v-if="!ec4.showStore">
      <setup-listing class="group-selector shadow" />
      <front-panel :group-id="groupId" class="front-panel shadow" />
      <fill-macros class="fill-macros shadow" />
      <stored-confs class="stored-confs" />
    </template>
    <store v-else class="the-store" />
    <div class="credits" v-if="!ec4.showStore">
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
        This web application (page) does not track or transmit any data entered here (unless you
        actively publish a setup). Visits, appliance or any other interactions with this page are
        not tracked. If in doubt, feel free to check the source code.
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
  max-width: 47.8em;
  grid-template-areas:
    'header header header'
    'alignment alignment alignment'
    'group-selector front-panel midi-settings'
    'group-selector front-panel fill-macros'
    'bundles bundles bundles'
    'credits credits credits';
  grid-template-columns: 1fr auto 1fr;
  grid-column-gap: 1em;
  grid-template-rows: auto 0.7em auto 1fr auto;

  .the-store {
    grid-area: alignment;
    grid-row: span 2;
  }

  .header {
    grid-area: header;
    position: relative;
    margin-bottom: 1em;
    h1 {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      justify-self: center;
    }

    .bg-waves {
      z-index: 1;
      height: 7.6em;
    }
    .store-thumb {
      cursor: pointer;
      position: fixed;
      z-index: 10;
      display: flex;
      top: 5em;
      right: 0;
      border: 3px solid;
      border-right: none;
      border-top-left-radius: 50%;
      border-bottom-left-radius: 50%;

      .icon {
        padding: 2px;
        color: $yellow-600;
        border-radius: 50%;

        &.animated {
          animation: rotate 30s linear infinite;
          @keyframes rotate {
            0% {
              color: $yellow-600;
              transform: rotate(0deg);
            }
            50% {
              color: $blue-600;
            }
            100% {
              transform: rotate(360deg);
            }
          }
        }
        &.pulsing {
          animation: pulse 1.5s ease;
          $diameter: 3em;
          @keyframes pulse {
            0% {
              rotate: 0deg;
              box-shadow: 0 0 0 0 rgba($green-500, 0.8);
            }
            50% {
              rotate: 360deg;
              box-shadow: 0 0 0 $diameter rgba($green-800, 0);
            }
            100% {
              rotate: 360deg;
              box-shadow: 0 0 0 $diameter rgba($green-800, 0);
            }
          }
        }
      }
    }
  }

  .midi-settings {
    grid-area: midi-settings;
    align-self: start;
    position: relative;
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
    grid-row: span 1;
  }

  .fill-macros {
    grid-area: fill-macros;
    align-self: start;
    margin-top: 0.8em;
  }

  .credits {
    grid-area: credits;
    padding: 1em;
  }
}
</style>
