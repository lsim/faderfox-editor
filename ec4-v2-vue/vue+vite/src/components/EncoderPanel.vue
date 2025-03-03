<script setup lang="ts">
import SingleEncoder from '@/components/SingleEncoder.vue';
import { type Encoder, type FieldType } from '@/domain/Encoder';

const props = defineProps<{
  encoders: Encoder[];
  selectedEncoder: Encoder | null;
  activeField: FieldType;
  mode: 'turn' | 'push';
}>();

const emit = defineEmits<{
  (event: 'update:selectedEncoder', encoder: Encoder): void;
  (event: 'update:activeField', field: FieldType): void;
  (event: 'update:encoder', encoder: Encoder): void;
}>();
</script>

<template>
  <div id="ctrlcontainer">
    <!--    <div-->
    <!--      id="editnothing"-->
    <!--      data-action="edit-nothing"-->
    <!--      title="Hide value fields"-->
    <!--    >-->
    <!--      &#x2715;-->
    <!--    </div>-->
    <div class="encoder-container">
      <SingleEncoder
        v-for="(encoder, index) in props.encoders"
        :key="encoder.id"
        :model-value="encoder"
        @update:model-value="emit('update:encoder', $event)"
        :index="index"
        :active-field="props.activeField"
        :mode="props.mode"
        @click="emit('update:selectedEncoder', encoder)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
#ctrlcontainer {
  .encoder-container {
    // A 4 x 4 grid of encoders
    display: grid;
    background-color: transparent;
    grid-template-columns: repeat(4, 110px);
    grid-template-rows: repeat(4, 110px);
    gap: 1px;
  }
}
</style>
