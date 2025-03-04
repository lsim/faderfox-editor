<script setup lang="ts">
import EncoderPanel from '@/components/EncoderPanel.vue';
import ModeSelector from '@/components/ModeSelector.vue';
import Oled from '@/components/Oled.vue';
import { type FieldType } from '@/domain/Encoder.ts';
import { ref } from 'vue';

const props = defineProps<{
  groupId: string;
}>();

const mode = ref<'turn' | 'push'>('turn');

const activeField = ref<FieldType>('address');

const selectedEncoderId = ref<string | null>('00');
</script>

<template>
  <main>
    <ModeSelector @update:mode="mode = $event" class="mode-selector" :mode="mode" />
    <Oled
      v-if="selectedEncoderId"
      :encoder-id="selectedEncoderId"
      :group-id="props.groupId"
      :active-field="activeField"
      class="oled"
      @update:active-field="activeField = $event"
    />

    <EncoderPanel
      @select-encoder="selectedEncoderId = $event"
      class="encoders"
      :active-field="activeField"
      :group-id="groupId"
      :selected-encoder-id="selectedEncoderId"
      :mode="mode"
    />

    <div class="fillnumbers" title="Fill with ascending values in chosen direction">
      Fill &quot;<span>Numbers</span>&quot;:
      <a href class="asbutton" data-action="filltopbottom">from top left to bottom right</a>
      <a href class="asbutton" data-action="fillbottomtop">from bottom left to top right</a>
    </div>
  </main>
</template>

<style scoped lang="scss">
$oled-height: 130px;
$oled-width: 300px;

main {
  // This grid was tweaked to fit the outlines of the EC4 controller
  display: grid;
  grid-template-columns: 24px 1fr 30px;
  grid-template-rows: 73px 30px $oled-height 30px 480px 20px;
  grid-template-areas:
    'margin-left margin-top margin-right'
    'margin-left mode-selector margin-right'
    'margin-left oled margin-right'
    'margin-left spacer margin-right'
    'margin-left encoders margin-right'
    'margin-left fillnumbers margin-right';
  justify-items: center;
  margin: 0 auto;
  width: 500px;
  height: 818px;
  background: url('../assets/ec4.jpg') no-repeat;
  background-size: 100% 100%;

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
  }
}
</style>
