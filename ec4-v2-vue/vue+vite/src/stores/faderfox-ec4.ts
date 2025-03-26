import { ref, computed, type Ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { EncoderSetup } from '@/domain/EncoderSetup.ts';
import { generateSysexData, parseSetupsFromSysex } from '@/memoryLayout.ts';

export function* generateIds() {
  for (let i = 0; i < 16; i++) yield i;
}

function* generateDefaultNames(prefix: string) {
  for (let i = 0; i < 16; i++) {
    yield `${prefix}${String(i + 1).padStart(2, '0')}`;
  }
}

const defaultGroupNames = Array.from(generateDefaultNames('GR'));
const defaultSetupNames = Array.from(generateDefaultNames('SE'));

export function createEmptyEncoderSetups() {
  const ids = Array.from(generateIds());
  return ids.map((setupId) => new EncoderSetup(setupId, defaultSetupNames[setupId]));
}

const appFocused = ref(true);

window.addEventListener('focus', () => {
  appFocused.value = true;
});
window.addEventListener('blur', () => {
  appFocused.value = false;
});

function saveState(setups: EncoderSetup[]) {
  const saveObj = {
    bytes: Array.from(generateSysexData(setups)),
    timestamp: Date.now(),
  };
  localStorage.setItem('sysexSave', JSON.stringify(saveObj));
}

function loadState(encoderSetups: Ref<EncoderSetup[]>) {
  const saveObj = JSON.parse(localStorage.getItem('sysexSave') || 'null');
  if (saveObj === null) return;
  console.log('Loading state from', new Date(saveObj.timestamp).toLocaleString());
  const newSetups = createEmptyEncoderSetups();
  parseSetupsFromSysex(new Uint8Array(saveObj.bytes), newSetups);
  encoderSetups.value = newSetups;
}

export const useEc4Store = defineStore('ec4', () => {
  const encoderSetups = ref<EncoderSetup[]>([]);
  loadState(encoderSetups);
  if (encoderSetups.value.length === 0) encoderSetups.value = createEmptyEncoderSetups();

  const selectedSetupIndex = ref<number>(0);
  const controlFocusRequests = ref(0);

  const encoderGroups = computed(() => encoderSetups.value[selectedSetupIndex.value].groups);
  const selectedGroupIndex = ref<number>(0);

  const editorMode = ref<'push' | 'turn'>('turn');

  function setEditorMode(mode: 'push' | 'turn') {
    editorMode.value = mode;
  }

  const selectedEncoderIndex = ref<number>(0);
  const lastStateSaved = ref(0);

  let timeout: number = 0;
  watch(
    encoderSetups,
    () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        saveState(encoderSetups.value);
        lastStateSaved.value = Date.now();
      }, 3000);
    },
    { deep: true },
  );

  return {
    encoderSetups,
    selectedSetupIndex,
    encoderGroups,
    selectedGroupIndex,
    editorMode,
    setEditorMode,
    appFocused,
    selectedEncoderIndex,
    saveState: () => saveState(encoderSetups.value),
    loadState: () => loadState(encoderSetups),
    controlFocusRequests,
    lastStateSaved,
  };
});
