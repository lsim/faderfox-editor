<script setup lang="ts">

import EncoderPanel from "@/components/EncoderPanel.vue";
import Oled from "@/components/Oled.vue";
import type {Encoder, EncoderGroup, FieldType} from "@/domain/Encoder.ts";
import {ref} from 'vue';

const props = defineProps<{
  encoders: EncoderGroup,
  selectedEncoder: Encoder,
  activeField: FieldType,
}>();

const emit = defineEmits<{
  (event: 'update:selectedEncoder', encoder: Encoder): void,
  (event: 'update:activeField', field: FieldType): void,
  (event: 'update:group', group: EncoderGroup): void,
}>();

const mode = ref<'turn' | 'push'>('turn');

</script>

<template>
  <main>
    <Oled
      :encoder="selectedEncoder"
      :active-field="activeField"
      class="oled"
      @update-active-field="emit('update:activeField', $event)"
    />

    <EncoderPanel
      @select-encoder="emit('update:selectedEncoder', $event)"
      class="encoders"

    />
  </main>

</template>

<style scoped lang="scss">
main {
  display: grid;
  grid-template-columns: 10px 1fr 10px;
  grid-template-rows: 10px 1fr 1fr 10px;
  grid-template-areas:
    "margin-left margin-top margin-right"
    "margin-left oled margin-right"
    "margin-left encoders margin-right"
    "margin-left margin-bottom margin-right";
  box-sizing: border-box;
  margin: 0 auto;
  width: 500px;
  height: 818px;
  background: url('../assets/ec4.jpg') no-repeat;
  background-size: 100% 100%;
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
}

</style>
