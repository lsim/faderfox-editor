<script setup lang="ts">
import SingleEncoder from '@/components/SingleEncoder.vue';
import { type FieldType } from '@/domain/Encoder';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import { computed, watch, ref } from 'vue';

const props = defineProps<{
  selectedEncoderId: number;
  activeField: FieldType;
}>();

const emit = defineEmits<{
  (event: 'select-encoder', encoderIndex: number): void;
}>();

const ec4 = useEc4Store();

const controls = computed(() => {
  return ec4.encoderGroups[ec4.selectedGroupIndex].controls;
});

const nameActive = ref<boolean>(false);
</script>

<template>
  <div id="ctrlcontainer">
    <div class="encoder-container">
      <SingleEncoder
        v-for="(control, index) in controls"
        :key="control.id"
        :encoder-id="control.id"
        :index="index"
        :active-field="props.activeField"
        :name-active="nameActive"
        @click.capture="emit('select-encoder', index)"
        @focus.capture="emit('select-encoder', index)"
        @update:name-active="nameActive = $event"
        :class="{ selected: control.id === props.selectedEncoderId }"
        :selected="control.id === props.selectedEncoderId"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/main.scss' as *;
@use '@picocss/pico/scss/colors/index.scss' as *;

#ctrlcontainer {
  .encoder-container {
    // A 4 x 4 grid of encoders
    display: grid;
    grid-template-columns: repeat(4, 110px);
    grid-template-rows: repeat(4, 118px);
    border: 1px solid transparent;

    .selected {
      // Mark the selected encoder
      border-radius: 10px;

      // Gently pulse the selected encoder
      animation: pulse 5s linear infinite;

      @keyframes pulse {
        0% {
          filter: drop-shadow(0px 3px 20px rgba($blue, 1));
        }
        50% {
          filter: drop-shadow(0px -3px 10px rgba($blue, 0.5));
        }
        100% {
          filter: drop-shadow(0 3px 20px rgba($blue, 1));
        }
      }
    }
  }
}
</style>
