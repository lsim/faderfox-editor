import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { EncoderGroup, EncoderSetup, PushButton } from '@/domain/Encoder.ts';
import { Encoder } from '@/domain/Encoder.ts';

function* generateIds(prefix: string) {
  for (let i = 0; i < 16; i++) {
    const paddedNumber = i.toString().padStart(2, '0');
    yield `${prefix}${paddedNumber}`;
  }
}

function createEmptyEncoderGroup(groupId: string, setupId: string) {
  const encoderIds = Array.from(generateIds('EC'));
  const encoders = encoderIds.map((id) => new Encoder(id, groupId));
  const pushButtons = encoderIds.map((id) => new PushButton(`PB${id}`, groupId));
  return new EncoderGroup(groupId, setupId, groupId, encoders, pushButtons);
}

function createEmptyEncoderSetups() {
  const setupIds = Array.from(generateIds('SE'));

  return setupIds.map((setupId) => {
    const encoderGroups = Array.from(generateIds('GR')).map((groupId) => {
      return createEmptyEncoderGroup(groupId, setupId);
    });
    return new EncoderSetup(setupId, setupId, encoderGroups);
  });
}

const appFocused = ref(true);

window.addEventListener('focus', () => {
  appFocused.value = true;
});
window.addEventListener('blur', () => {
  appFocused.value = false;
});

export const useEc4Store = defineStore('ec4', () => {
  const encoderSetups = ref<EncoderSetup[]>(createEmptyEncoderSetups());
  const selectedSetupIndex = ref<number>(0);

  const encoderGroups = computed(() => encoderSetups.value[selectedSetupIndex.value].groups);
  const selectedGroupIndex = ref<number>(0);

  const editorMode = ref<'push' | 'turn'>('turn');

  function setEditorMode(mode: 'push' | 'turn') {
    editorMode.value = mode;
  }

  const selectedEncoderIndex = ref<number | null>(null);

  return {
    encoderSetups,
    selectedSetupIndex,
    encoderGroups,
    selectedGroupIndex,
    editorMode,
    setEditorMode,
    appFocused,
    selectedEncoderIndex,
  };
});
