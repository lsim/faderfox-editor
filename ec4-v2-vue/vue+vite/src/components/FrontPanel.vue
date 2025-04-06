<script setup lang="ts">
import EncoderPanel from '@/components/EncoderPanel.vue';
import ModeSelector from '@/components/ModeSelector.vue';
import Oled from '@/components/Oled.vue';
import type { FieldType } from '@/domain/Encoder.ts';
import { ref, watch } from 'vue';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import LegendButton from '@/components/LegendButton.vue';

const props = defineProps<{
  groupId: number;
}>();

const ec4 = useEc4Store();

const activeField = ref<FieldType>('channel');

function handleEncoderNav(e: KeyboardEvent) {
  const selectedRow = Math.floor(ec4.selectedEncoderIndex / 4);
  const selectedCol = ec4.selectedEncoderIndex % 4;
  let newSelectedRow = selectedRow;
  let newSelectedCol = selectedCol;
  switch (e.key) {
    case 'e':
      newSelectedRow = Math.round((selectedRow - 1 + 4) % 4);
      break;
    case 'd':
      newSelectedRow = Math.round((selectedRow + 1 + 4) % 4);
      break;
    case 'f':
      newSelectedCol = Math.round((selectedCol + 1 + 4) % 4);
      break;
    case 's':
      newSelectedCol = Math.round((4 + selectedCol - 1) % 4);
      break;
    default:
      return;
  }
  ec4.selectedEncoderIndex = newSelectedRow * 4 + newSelectedCol;
  e.preventDefault();
  e.stopPropagation();
}

function handleKeyDown(e: KeyboardEvent) {
  // Let Ctrl + s/d/f/e keys move focus between encoders
  if (e.ctrlKey || e.metaKey) {
    if (['e', 'd', 'f', 's'].includes(e.key)) {
      handleEncoderNav(e);
      return;
    }
  }
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
    if (newMode === 'push') activeField.value = 'pb_channel';
    else activeField.value = 'channel';
  },
);
</script>

<template>
  <main @keydown.capture="handleKeyDown">
    <div class="beta-notice dymo-label">BETA</div>
    <div id="save-indicator" v-if="showSaveIndicator">💾</div>
    <legend-button id="legend-button" />
    <mode-selector class="mode-selector" />
    <oled
      v-if="ec4.selectedEncoderIndex != null"
      :encoder-id="ec4.selectedEncoderIndex"
      :group-id="ec4.selectedGroupIndex"
      :active-field="activeField"
      class="oled"
      @update:active-field="activeField = $event"
    />

    <encoder-panel
      class="encoders"
      :active-field="activeField"
      :group-id="props.groupId"
      :selected-encoder-id="ec4.selectedEncoderIndex"
    />

    <!--    <div class="fillnumbers" title="Fill with ascending values in chosen direction">-->
    <!--      Fill &quot;<span>Numbers</span>&quot;:-->
    <!--      <a href="" class="asbutton" data-action="filltopbottom">from top left to bottom right</a>-->
    <!--      <a href="" class="asbutton" data-action="fillbottomtop">from bottom left to top right</a>-->
    <!--    </div>-->

    <input
      type="text"
      class="bundle-name dymo-label"
      placeholder="Bundle name"
      v-model="ec4.activeBundle.name"
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
  top: 80px;
  right: 34px;
}
</style>
