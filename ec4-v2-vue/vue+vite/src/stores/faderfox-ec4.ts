import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { EncoderGroup, EncoderSetup, PushButton, Encoder } from '@/domain/Encoder.ts';
import { parseSetupsFromSysex } from '@/memoryLayout.ts';

export function* generateIds() {
  for (let i = 0; i < 16; i++) yield i;
}

function* generateDefaultNames(prefix: string) {
  for (let i = 0; i < 16; i++) {
    const paddedNumber = i.toString().padStart(2, '0');
    yield `${prefix}${paddedNumber}`;
  }
}

const defaultGroupNames = Array.from(generateDefaultNames('GR'));
const defaultSetupNames = Array.from(generateDefaultNames('SE'));

function createEmptyEncoderGroup(groupId: number, setupId: number) {
  const encoderIds = Array.from(generateIds());
  const encoders = encoderIds.map((id) => new Encoder(id, groupId, setupId));
  const pushButtons = encoderIds.map((id) => new PushButton(id, groupId, setupId));
  return new EncoderGroup(groupId, setupId, defaultGroupNames[groupId], encoders, pushButtons);
}

function createEmptyEncoderSetups() {
  const setupIds = Array.from(generateIds());

  return setupIds.map((setupId) => {
    const encoderGroups = Array.from(generateIds()).map((groupId) => {
      return createEmptyEncoderGroup(groupId, setupId);
    });
    return new EncoderSetup(setupId, defaultSetupNames[setupId], encoderGroups);
  });
}

const appFocused = ref(true);

window.addEventListener('focus', () => {
  appFocused.value = true;
});
window.addEventListener('blur', () => {
  appFocused.value = false;
});

// function getCachedSysexData(): number[] {
//   return JSON.parse(localStorage.getItem('sysexDataArr') || '[]');
// }

export const useEc4Store = defineStore('ec4', () => {
  // const dataFromDevice = new Uint8Array(getCachedSysexData());

  let initial: EncoderSetup[];
  // try {
  //   initial = parseSetupsFromSysex(dataFromDevice);
  // } catch (e) {
  //   console.error('Error parsing sysex data', e);
  initial = createEmptyEncoderSetups();
  // }

  const encoderSetups = ref<EncoderSetup[]>(initial);
  const selectedSetupIndex = ref<number>(0);

  const encoderGroups = computed(() => encoderSetups.value[selectedSetupIndex.value].groups);
  const selectedGroupIndex = ref<number>(0);

  const editorMode = ref<'push' | 'turn'>('turn');

  function setEditorMode(mode: 'push' | 'turn') {
    editorMode.value = mode;
  }

  const selectedEncoderIndex = ref<number>(0);

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
