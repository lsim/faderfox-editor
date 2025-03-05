<script setup lang="ts">
import SingleEncoder from '@/components/SingleEncoder.vue';
import { type EncoderGroup, type FieldType } from '@/domain/Encoder';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import { computed, watch, ref } from 'vue';

const props = defineProps<{
  groupId: string;
  selectedEncoderId: string | null;
  activeField: FieldType;
  mode: 'turn' | 'push';
}>();

const emit = defineEmits<{
  (event: 'select-encoder', encoderId: string): void;
}>();

const { encoderGroups } = useEc4Store();

const encoders = computed(() => {
  const group = encoderGroups.find((g: EncoderGroup) => g.id === props.groupId);
  return props.mode === 'turn' ? group.encoders : group.pushButtons;
});

const nameActive = ref<boolean>(false);

watch(
  () => props.mode,
  (newMode) => {
    console.debug('mode changed to', newMode);
  },
);

watch(
  () => props.activeField,
  (newActiveField) => {
    console.debug('activeField changed to', newActiveField);
  },
);

watch(
  () => nameActive,
  (newVal) => {
    console.debug('Name active changed', newVal);
  },
);
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
        v-for="(encoder, index) in encoders"
        :key="encoder.id"
        :encoder-id="encoder.id"
        :group-id="props.groupId"
        :index="index"
        :active-field="props.activeField"
        :mode="props.mode"
        :name-active="nameActive"
        @click="emit('select-encoder', encoder.id)"
        @update:name-active="nameActive = $event"
        :class="{ selected: encoder.id === props.selectedEncoderId }"
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

    .selected {
      border: 1px solid #fff;
    }
  }
}
</style>
