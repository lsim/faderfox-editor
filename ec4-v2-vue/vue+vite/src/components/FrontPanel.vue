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
    <Oled
      :encoder="selectedEncoder"
      :active-field="activeField"
      class="oled"
      @update-active-field="activeField = $event"
      @update:encoder="updateEncoder"
    />

    <EncoderPanel
      @select-encoder="selectedEncoder = $event"
      class="encoders"
      :active-field="activeField"
      :encoders="props.encoders"
      :selected-encoder="selectedEncoder"
      :mode="mode"
    />
  </main>
</template>

<style scoped lang="scss">
main {
  display: grid;
  grid-template-columns: 10px 1fr 10px;
  grid-template-rows: 16px 10px 1fr 1fr 10px;
  grid-template-areas:
    'mode-selector mode-selector mode-selector'
    'margin-left margin-top margin-right'
    'margin-left oled margin-right'
    'margin-left encoders margin-right'
    'margin-left margin-bottom margin-right';
  box-sizing: border-box;
  margin: 0 auto;
  width: 500px;
  height: 818px;
  background: url('../assets/ec4.jpg') no-repeat;
  background-size: 100% 100%;
  background-position-y: 16px;
  position: relative;

  .oled {
    grid-area: oled;
    position: relative;
    left: 110px;
    top: 90px;
    width: calc(100% - 220px);
    height: 130px;
    border-radius: 6px;
    border: 1px solid #fff;
  }

  .encoders {
    grid-area: encoders;
    //transform: translateX(-50%);
  }

  .mode-selector {
    grid-area: mode-selector;
  }
}
</style>
