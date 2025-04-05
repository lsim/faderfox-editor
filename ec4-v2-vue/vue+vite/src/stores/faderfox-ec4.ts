import { ref, computed, type Ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { EncoderSetup } from '@/domain/EncoderSetup.ts';
import { Ec4Bundle } from '@/domain/Ec4Bundle.ts';
import { useStorage } from '@/composables/storage.ts';
import type { EncoderGroup } from '@/domain/EncoderGroup.ts';
import type { Control } from '@/domain/Encoder.ts';

export function* generateIds() {
  for (let i = 0; i < 16; i++) yield i;
}

function* generateDefaultNames(prefix: string) {
  for (let i = 0; i < 16; i++) {
    yield `${prefix}${String(i + 1).padStart(2, '0')}`;
  }
}
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// const defaultGroupNames = Array.from(generateDefaultNames('GR'));
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

export const useEc4Store = defineStore('ec4', () => {
  const storage = useStorage();
  const activeBundle: Ref<Ec4Bundle> = ref(Ec4Bundle.createEmpty());

  const selectedSetupIndex = ref<number>(0);
  const controlFocusRequests = ref(0);

  const encoderGroups = computed(() => activeBundle.value.setups[selectedSetupIndex.value].groups);
  const selectedGroupIndex = ref<number>(0);
  const selectedGroup = computed(() => encoderGroups.value[selectedGroupIndex.value]);

  const editorMode = ref<'push' | 'turn'>('turn');

  function setEditorMode(mode: 'push' | 'turn') {
    editorMode.value = mode;
  }

  const selectedEncoderIndex = ref<number>(0);
  const selectedControl = computed(() => selectedGroup.value.controls[selectedEncoderIndex.value]);
  const lastStateSaved = ref(0);

  const copiedSetup = ref<EncoderSetup | null>(null);
  const copiedGroup = ref<EncoderGroup | null>(null);
  const copiedEncoder = ref<Control | null>(null);
  const canPasteSetup = computed(() => !!copiedSetup.value);
  const canPasteGroup = computed(() => !!copiedGroup.value);
  const canPasteEncoder = computed(() => !!copiedEncoder.value);

  // Auto save after a bit of inactivity
  let timeout = 0;
  watch(
    activeBundle,
    (newBundle, oldBundle) => {
      clearTimeout(timeout);
      // No auto save if we are loading a new bundle
      if (!oldBundle || newBundle.id !== oldBundle.id) return;
      timeout = setTimeout(async () => {
        await storage.saveBundle(activeBundle.value);
        lastStateSaved.value = Date.now();
      }, 1000);
    },
    { deep: true },
  );

  return {
    selectedSetupIndex,
    encoderGroups,
    selectedGroupIndex,
    selectedGroup,
    editorMode,
    setEditorMode,
    appFocused,
    selectedEncoderIndex,
    selectedControl,
    loadBundle: async (id: number) => {
      activeBundle.value = await storage.loadBundle(id);
    },
    controlFocusRequests,
    lastStateSaved,
    activeBundle,
    copySetup(idx: number) {
      copiedSetup.value = activeBundle.value.setups[idx];
    },
    copyGroup(idx: number) {
      console.log('copying group', activeBundle.value.setups[selectedSetupIndex.value].groups[idx]);
      copiedGroup.value = activeBundle.value.setups[selectedSetupIndex.value].groups[idx];
    },
    copyEncoder(idx: number) {
      copiedEncoder.value = selectedGroup.value.controls[idx];
    },
    pasteSetup(idx: number) {
      if (!copiedSetup.value) return;
      activeBundle.value.setups[idx] = copiedSetup.value.clone(idx);
    },
    pasteGroup(idx: number) {
      if (!copiedGroup.value) return;
      activeBundle.value.setups[selectedSetupIndex.value].groups[idx] = copiedGroup.value.clone(
        selectedSetupIndex.value,
        idx,
      );
    },
    pasteEncoder(idx: number) {
      if (!copiedEncoder.value) return;
      activeBundle.value.setups[selectedSetupIndex.value].groups[selectedGroupIndex.value].controls[
        idx
      ] = copiedEncoder.value.clone(selectedSetupIndex.value, selectedGroupIndex.value, idx);
    },
    clearClipboard() {
      copiedSetup.value = null;
      copiedGroup.value = null;
      copiedEncoder.value = null;
    },
    canPasteSetup,
    canPasteGroup,
    canPasteEncoder,
  };
});
