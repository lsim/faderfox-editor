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
$oled-height: 130px;
$oled-width: 300px;

main {
  // This grid was tweaked to fit the outlines of the EC4 controller
  position: relative;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: 73px 30px $oled-height 30px 480px 20px;
  grid-template-areas:
    'margin-left margin-top margin-right'
    'margin-left mode-selector margin-right'
    'margin-left oled margin-right'
    'margin-left spacer margin-right'
    'margin-left encoders margin-right'
    'margin-left fillnumbers margin-right'
    'margin-left bundle-name margin-right';
  justify-items: center;
  width: 500px;
  height: 818px;
  background: url('../assets/ec4.jpg') no-repeat;
  // The picture has a few too many pixels on the right, so make it a bit too big on that axis
  background-size: 101.3% 100%;

  .mode-selector {
    grid-area: mode-selector;
    width: 100px;
  }

  .oled {
    grid-area: oled;
    width: $oled-width;
    height: $oled-height;
    border-radius: 6px;
    border: 1px solid #fff;
  }

  .encoders {
    grid-area: encoders;
    padding-left: 5px;
  }

  .fillnumbers {
    grid-area: fillnumbers;
    display: none;
  }

  .bundle-name {
    grid-area: bundle-name;
    grid-row: span 2;
    padding-right: 20px;
    text-align: center;
    margin-top: 5px;
    height: 30px;
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
    font-size: 150%;
    left: 3.5em;
    top: 1.7em;
    rotate: -10deg;
  }
}
#legend-button {
  position: absolute;
  top: 81px;
  right: 35px;
}

.undo,
.redo {
  position: absolute;
  width: 42px;
  height: 42px;
  left: 37px;
}
.undo {
  top: 180px;
}
.redo {
  top: 79px;
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
