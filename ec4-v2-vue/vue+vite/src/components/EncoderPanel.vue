<script setup lang="ts">
import SingleEncoder from '@/components/SingleEncoder.vue';
import { type EncoderGroup, type FieldType } from '@/domain/Encoder';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import { computed, watch, ref } from 'vue';

const props = defineProps<{
  groupId: string;
  selectedEncoderId: string | null;
  activeField: FieldType;
}>();

const emit = defineEmits<{
  (event: 'select-encoder', encoderIndex: number): void;
}>();

const ec4 = useEc4Store();

const controls = computed(() => {
  const group = ec4.encoderGroups.find((g: EncoderGroup) => g.id === props.groupId);
  return ec4.editorMode === 'turn' ? group?.encoders || [] : group?.pushButtons || [];
});

const nameActive = ref<boolean>(false);

watch(
  () => ec4.editorMode,
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
      ec4.editorMode,
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

function idToEncoderIndex(id: string | null): number | undefined {
  if (id === null) return undefined;
  return controls.value.findIndex((control) => control.id === id);
}

function handleKeyDown(e: KeyboardEvent) {
  // Let Ctrl + s/d/f/e keys move focus between encoders
  if (e.ctrlKey || e.metaKey) {
    const selectedEncoderIndex = idToEncoderIndex(props.selectedEncoderId);
    if (selectedEncoderIndex === undefined) return;
    const selectedRow = Math.floor(selectedEncoderIndex / 4);
    const selectedCol = selectedEncoderIndex % 4;
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
    const newSelectedEncoderIndex = newSelectedRow * 4 + newSelectedCol;
    emit('select-encoder', newSelectedEncoderIndex);
    e.preventDefault();
    e.stopPropagation();
    // TODO: focus the input of the new selected encoder
  }
}
</script>

<template>
  <div id="ctrlcontainer" @keydown.capture="handleKeyDown">
    <div class="encoder-container">
      <SingleEncoder
        v-for="(control, index) in controls"
        :key="control.id"
        :encoder-id="control.id"
        :group-id="props.groupId"
        :index="index"
        :active-field="props.activeField"
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
    grid-template-columns: repeat(4, 110px);
    grid-template-rows: repeat(4, 110px);

    .selected {
      // Mark the selected encoder
      border: 1px solid #555;
      border-radius: 20px;

      // Gently pulse the selected encoder
      animation: pulse 5s ease-in infinite;

      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(#555, 1);
        }
        15% {
          box-shadow: 0 0 0 4px rgba(#555, 1);
        }
        30% {
          box-shadow: 0 0 0 0 rgba(#555, 1);
        }
      }
    }
  }
}
</style>
