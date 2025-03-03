<script setup lang="ts">
import EncoderPanel from '@/components/EncoderPanel.vue';
import ModeSelector from '@/components/ModeSelector.vue';
import Oled from '@/components/Oled.vue';
import type { Encoder, EncoderGroup, FieldType } from '@/domain/Encoder.ts';
import { ref } from 'vue';

const props = defineProps<{
  encoderGroup: EncoderGroup;
}>();

const emit = defineEmits<(event: 'update:group', group: EncoderGroup) => void>();

const mode = ref<'turn' | 'push'>('turn');

const selectedEncoder = ref<Encoder | null>(null);

const activeField = ref<FieldType>(null);

function updateEncoder(encoder: Encoder) {
  console.log('TODO updateEncoder', encoder);
}
</script>

<template>
  <main>
    <ModeSelector @update:mode="mode = $event" class="mode-selector" :mode="mode" />
    <div class="margin-top"></div>
    <div class="margin-left"></div>
    <div class="margin-right"></div>
    <Oled
      :encoder="selectedEncoder"
      :active-field="activeField"
      class="oled"
      @update-active-field="activeField = $event"
      @update:encoder="updateEncoder"
    />

    <div class="spacer"></div>

    <EncoderPanel
      @select-encoder="selectedEncoder = $event"
      class="encoders"
      :active-field="activeField"
      :encoders="props.encoderGroup.encoders"
      :selected-encoder="selectedEncoder"
      :mode="mode"
    />

    <div class="fillnumbers" title="Fill with ascending values in chosen direction">
      Fill &quot;<span>Numbers</span>&quot;:
      <a class="asbutton" data-action="filltopbottom">from top left to bottom right</a>
      <a class="asbutton" data-action="fillbottomtop">from bottom left to top right</a>
    </div>
  </main>
</template>

<style scoped lang="scss">
main {
  // This grid was tweaked to fit the outlines of the EC4 controller
  display: grid;
  grid-template-columns: 24px 1fr 30px;
  grid-template-rows: 16px 85px 132px 30px 480px 20px;
  grid-template-areas:
    'mode-selector mode-selector mode-selector'
    'margin-left margin-top margin-right'
    'margin-left oled margin-right'
    'margin-left spacer margin-right'
    'margin-left encoders margin-right'
    'margin-left fillnumbers margin-right';
  box-sizing: border-box;
  margin: 0 auto;
  width: 500px;
  height: 818px;
  background: url('../assets/ec4.jpg') no-repeat;
  background-size: 100% 100%;
  text-align: center;

  .mode-selector {
    grid-area: mode-selector;
  }

  .margin-top {
    grid-area: margin-top;
  }

  .oled {
    grid-area: oled;
    position: relative;
    left: 95px;
    width: calc(100% - 190px);
    height: 130px;
    border-radius: 6px;
    border: 1px solid #fff;
  }

  .spacer {
    grid-area: spacer;
  }

  .encoders {
    grid-area: encoders;
    padding-left: 5px;
    padding-top: 10px;
  }

  .fillnumbers {
    grid-area: fillnumbers;
  }

  .margin-left {
    grid-area: margin-left;
  }

  .margin-right {
    grid-area: margin-right;
  }
}
</style>
