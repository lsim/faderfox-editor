import { ref, computed, type Ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { EncoderSetup } from '@/domain/EncoderSetup.ts';
import { Ec4Bundle } from '@/domain/Ec4Bundle.ts';
import { useStorage } from '@/composables/storage.ts';

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

  const editorMode = ref<'push' | 'turn'>('turn');

  function setEditorMode(mode: 'push' | 'turn') {
    editorMode.value = mode;
  }

  const selectedEncoderIndex = ref<number>(0);
  const lastStateSaved = ref(0);

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
    editorMode,
    setEditorMode,
    appFocused,
    selectedEncoderIndex,
    loadBundle: async (id: number) => {
      activeBundle.value = await storage.loadBundle(id);
    },
    controlFocusRequests,
    lastStateSaved,
    activeBundle,
  };
});
