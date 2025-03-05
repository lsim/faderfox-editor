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

const controls = computed(() => {
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
    console.debug(
      'activeField changed to',
      newActiveField,
      props.mode,
      controls.value.find((c) => c.id === props.selectedEncoderId)?.type,
    );
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
    <div class="encoder-container">
      <SingleEncoder
        v-for="(control, index) in controls"
        :key="control.id"
        :encoder-id="control.id"
        :group-id="props.groupId"
        :index="index"
        :active-field="props.activeField"
        :mode="props.mode"
        :name-active="nameActive"
        @click.capture="emit('select-encoder', index)"
        @focus.capture="emit('select-encoder', index)"
        @update:name-active="nameActive = $event"
        :class="{ selected: control.id === props.selectedEncoderId }"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/main.scss' as *;
#ctrlcontainer {
  .encoder-container {
    // A 4 x 4 grid of encoders
    display: grid;
    background-color: transparent;
    grid-template-columns: repeat(4, 110px);
    grid-template-rows: repeat(4, 110px);
    //gap: 1px;
    color: white;
    > * {
      border-left: 1px solid #333;
      border-top: 1px solid #333;
    }

    .selected {
      background-color: #222;
    }
  }
}
</style>
