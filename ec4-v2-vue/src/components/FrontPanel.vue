<script setup lang="ts">
import EncoderPanel from '@/components/EncoderPanel.vue';
import ModeSelector from '@/components/ModeSelector.vue';
import Oled from '@/components/Oled.vue';
import { ref, watch } from 'vue';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import LegendButton from '@/components/LegendButton.vue';
import { onKeyStroke } from '@vueuse/core';
import { Undo2, Redo2 } from 'lucide-vue-next';
import Badger from '@/components/Badger.vue';

const props = defineProps<{
  groupId: number;
}>();

const ec4 = useEc4Store();

function handleEncoderNav(e: KeyboardEvent) {
  const selectedRow = Math.floor(ec4.selectedEncoderIndex / 4);
  const selectedCol = ec4.selectedEncoderIndex % 4;
  let newSelectedRow = selectedRow;
  let newSelectedCol = selectedCol;
  switch (e.key) {
    case 'ArrowUp':
      newSelectedRow = Math.round((selectedRow - 1 + 4) % 4);
      break;
    case 'ArrowDown':
      newSelectedRow = Math.round((selectedRow + 1 + 4) % 4);
      break;
    case 'ArrowRight':
      newSelectedCol = Math.round((selectedCol + 1 + 4) % 4);
      break;
    case 'ArrowLeft':
      newSelectedCol = Math.round((4 + selectedCol - 1) % 4);
      break;
    default:
      return;
  }
  ec4.selectedEncoderIndex = newSelectedRow * 4 + newSelectedCol;
  e.preventDefault();
  e.stopPropagation();
}

const showSaveIndicator = ref(false);

watch(
  () => ec4.lastStateSaved,
  () => {
    showSaveIndicator.value = true;
    setTimeout(() => {
      showSaveIndicator.value = false;
    }, 2000);
  },
);
watch(
  () => ec4.editorMode,
  (newMode) => {
    if (newMode === 'push') ec4.activeField = 'pb_channel';
    else ec4.activeField = 'channel';
  },
);

// Let Alt + Shift + Up/Down/Left/Right keys move focus between encoders
onKeyStroke(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'], (e) => {
  if (e.altKey && e.shiftKey) {
    handleEncoderNav(e);
  }
});
</script>

<template>
  <main>
    <div class="beta-notice dymo-label">BETA</div>
    <div id="save-indicator" v-if="showSaveIndicator">💾</div>
    <badger
      color="rgba(blue, 0.7)"
      :value="ec4.history.undoSize.toString()"
      class="undo"
      :hide="!ec4.history.canUndo"
    >
      <button
        :disabled="!ec4.history.canUndo"
        :class="{ 'can-do': ec4.history.canUndo }"
        class="history-button"
        @click="ec4.history.undo()"
      >
        <undo-2 class="icon" />
      </button>
    </badger>
    <badger
      color="blue"
      :value="ec4.history.redoSize.toString()"
      class="redo"
      :hide="!ec4.history.canRedo"
    >
      <button
        :disabled="!ec4.history.canRedo"
        :class="{ 'can-do': ec4.history.canRedo }"
        class="history-button"
        @click="ec4.history.redo()"
      >
        <redo-2 class="icon" />
      </button>
    </badger>
    <legend-button id="legend-button" />
    <mode-selector class="mode-selector" />
    <oled
      v-if="ec4.selectedEncoderIndex != null"
      :encoder-id="ec4.selectedEncoderIndex"
      :group-id="ec4.selectedGroupIndex"
      class="oled"
    />

    <encoder-panel class="encoders" :active-field="ec4.activeField" :group-id="props.groupId" />

    <input
      type="text"
      class="bundle-name dymo-label"
      placeholder="Bundle name"
      :value="ec4.activeBundleName"
      @input="ec4.setBundleName(($event.target as HTMLInputElement).value)"
    />
  </main>
</template>

<style scoped lang="scss">
@use '@picocss/pico/scss/colors/index.scss' as *;
$oled-height: 8.58em;
$oled-width: 17.5em;

main {
  // This grid was tweaked to fit the outlines of the EC4 controller
  position: relative;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: 3.7em 1.3em $oled-height 1.3em 26.3em;
  grid-template-areas:
    'margin-left margin-top margin-right'
    'margin-left mode-selector margin-right'
    'margin-left oled margin-right'
    'margin-left spacer margin-right'
    'margin-left encoders margin-right'
    'margin-left bundle-name margin-right';
  justify-items: center;
  width: 26.3em;
  height: 44.1em;
  // The size and position of the picture is adjusted to fit the absolute size of the controls
  background: url('../assets/ec4.jpg') no-repeat -0.83em -0.69em;
  background-size: 28.2em 45.5em;
  border-radius: 0.5em;

  .mode-selector {
    grid-area: mode-selector;
    z-index: 2;
    width: 5.5em;
    border: 1px solid black;
    filter: drop-shadow(0 -0.2em 0.3rem rgba($white, 0.3));
  }

  .oled {
    grid-area: oled;
    z-index: 1;
    padding: 3px;
    width: $oled-width;
    height: $oled-height;
    border-radius: 6px;
    border: 1px solid rgba(black, 0.8);
    filter: drop-shadow(-0.1em -0.1em 0.3rem rgba($white, 0.3));
  }

  .encoders {
    grid-area: encoders;
  }

  .fillnumbers {
    grid-area: fillnumbers;
    display: none;
  }

  .bundle-name {
    grid-area: bundle-name;
    grid-row: span 2;
    padding-right: 1em;
    text-align: center;
    margin-top: 0.3em;
    height: 1.5em;
    outline: none;
  }

  $diameter: 39px;
  #save-indicator {
    text-align: center;
    line-height: $diameter;
    position: absolute;
    top: 243px;
    left: 233px;
    width: $diameter;
    height: $diameter;
    border-radius: 50%;
    filter: drop-shadow(0 0 0.5rem $green-800);
    opacity: 0;

    animation: pulse 1.5s ease;
    @keyframes pulse {
      0% {
        opacity: 1;
        rotate: 0deg;
        box-shadow: 0 0 0 0 rgba($green-700, 0.8);
      }
      50% {
        rotate: 360deg;
        opacity: 1;
        box-shadow: 0 0 0 $diameter rgba($green-800, 0);
      }
      100% {
        rotate: 360deg;
        opacity: 0;
      }
    }
  }

  .beta-notice {
    position: absolute;
    padding-right: 0.2em;
    padding-left: 0.5em;
    padding-bottom: 0.2em;
    font-size: 150%;
    left: 3em;
    top: 1.4em;
    rotate: -10deg;
  }
}
#legend-button {
  position: absolute;
  top: 3.8em;
  right: 1.3em;
}

.undo,
.redo {
  position: absolute;
  width: 2em;
  height: 2em;
}
.undo {
  top: 9.4em;
  left: 1.3em;
}
.redo {
  top: 9.5em;
  right: 1.3em;
}

.history-button {
  color: $yellow-500;
  border: 2px solid $yellow-500;
  background: transparent;
  height: 100%;

  border-radius: 50%;
  &.can-do {
    cursor: pointer;
    color: $yellow-200;
    border-color: $yellow-200;
  }
}
</style>
