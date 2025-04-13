import { ref, computed, type Ref } from 'vue';
import { defineStore } from 'pinia';
import { EncoderSetup } from '@/domain/EncoderSetup.ts';
import { Ec4Bundle } from '@/domain/Ec4Bundle.ts';
import { useStorage } from '@/composables/storage.ts';
import { Control, type FieldType, type NumberFieldType } from '@/domain/Encoder.ts';
import { watchDebounced } from '@vueuse/core';
import type { EncoderGroup } from '@/domain/EncoderGroup.ts';

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
  // const currentValue = ref<{ k: string; v: number }>({ k: '', v: -1 });

  const editorMode = ref<'push' | 'turn'>('turn');

  function setEditorMode(mode: 'push' | 'turn') {
    editorMode.value = mode;
  }

  const selectedEncoderIndex = ref<number>(0);
  const selectedControl = computed(() => selectedGroup.value.controls[selectedEncoderIndex.value]);
  const activeField = ref<FieldType>('channel');

  const lastStateSaved = ref(0);

  // Auto save after a bit of inactivity
  watchDebounced(
    activeBundle,
    (newBundle, oldBundle) => {
      // No auto save if we are loading a new bundle
      if (!oldBundle || newBundle.id !== oldBundle.id) return;
      storage.saveBundle(activeBundle.value).then();
      lastStateSaved.value = Date.now();
    },
    { deep: true, debounce: 1000 },
  );

  const activeNumberField = computed(() => {
    return Object.keys(selectedControl.value.numbers).includes(activeField.value)
      ? (activeField.value as NumberFieldType)
      : null;
  });

  const gridRows = computed(() => {
    return activeBundle.value.setups.map((s, i) => [s, encoderGroups.value[i]]);
  });

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
    activeField,
    activeNumberField,
    gridRows,
    activeBundleId: computed(() => activeBundle.value?.id),
    activeBundleName: computed(() => activeBundle.value?.name),
    setBundleName(name: string) {
      if (activeBundle.value) activeBundle.value.name = name;
    },
    replaceSetup(idx: number, setup: EncoderSetup) {
      if (activeBundle.value) {
        activeBundle.value.setups[idx] = setup;
      }
    },
    replaceGroup(idx: number, group: EncoderGroup) {
      if (activeBundle.value) {
        activeBundle.value.setups[selectedSetupIndex.value].groups[idx] = group;
      }
    },
    replaceControl(idx: number, control: Control) {
      if (activeBundle.value) {
        activeBundle.value.setups[selectedSetupIndex.value].groups[
          selectedGroupIndex.value
        ].controls[idx] = control;
      }
    },
    resetBundle() {
      activeBundle.value = Ec4Bundle.createEmpty();
    },
  };
});
