<script setup lang="ts">
import EncoderPanel from '@/components/EncoderPanel.vue';
import ModeSelector from '@/components/ModeSelector.vue';
import Oled from '@/components/Oled.vue';
import { type FieldType } from '@/domain/Encoder.ts';
import { ref } from 'vue';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';

const props = defineProps<{
  groupId: number;
}>();

const ec4 = useEc4Store();

const activeField = ref<FieldType>('name');

const oled = ref<InstanceType<typeof Oled> | null>(null);

// IDEA: Shift + Ctrl + nav could select a range of encoders (eg for inserting incremental values

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
    switch (e.key) {
      case 'o':
        const focused = document.activeElement as HTMLInputElement | null;
        const isInOled = focused?.closest('.oled');
        if (isInOled) {
          // Switch focus to active encoder
          const idx = ec4.selectedEncoderIndex;
          setTimeout(() => (ec4.selectedEncoderIndex = idx));
        } else {
          // Switch focus to active field in oled
          oled.value?.focusActiveField();
        }
        e.preventDefault();
        e.stopPropagation();
        break;
      default:
        break;
    }
  }
}
</script>

<template>
  <main @keydown.capture="handleKeyDown">
    <ModeSelector class="mode-selector" />
    <Oled
      v-if="ec4.selectedEncoderIndex != null"
      :encoder-id="ec4.selectedEncoderIndex"
      :group-id="ec4.selectedGroupIndex"
      :active-field="activeField"
      ref="oled"
      class="oled"
      @update:active-field="activeField = $event"
    />

    <EncoderPanel
      @select-encoder="ec4.selectedEncoderIndex = $event"
      class="encoders"
      :active-field="activeField"
      :group-id="props.groupId"
      :selected-encoder-id="ec4.selectedEncoderIndex"
    />

    <div class="fillnumbers" title="Fill with ascending values in chosen direction">
      Fill &quot;<span>Numbers</span>&quot;:
      <a href="" class="asbutton" data-action="filltopbottom">from top left to bottom right</a>
      <a href="" class="asbutton" data-action="fillbottomtop">from bottom left to top right</a>
    </div>
  </main>
</template>

<style scoped lang="scss">
$oled-height: 130px;
$oled-width: 300px;

main {
  // This grid was tweaked to fit the outlines of the EC4 controller
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: 73px 30px $oled-height 30px 480px 20px;
  grid-template-areas:
    'margin-left margin-top margin-right'
    'margin-left mode-selector margin-right'
    'margin-left oled margin-right'
    'margin-left spacer margin-right'
    'margin-left encoders margin-right'
    'margin-left fillnumbers margin-right';
  justify-items: center;
  width: 500px;
  height: 818px;
  background: url('../assets/ec4.jpg') no-repeat;
  // The picture has a few too many pixels on the right, so make it a bit too big on that axis
  background-size: 101% 100%;

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
    padding-top: 10px;
  }

  .fillnumbers {
    grid-area: fillnumbers;
    display: none;
  }
}
</style>
