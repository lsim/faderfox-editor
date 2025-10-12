import { ref, computed, type Ref } from 'vue';
import { defineStore } from 'pinia';
import { EncoderSetup } from '@/domain/EncoderSetup.ts';
import { Ec4Bundle } from '@/domain/Ec4Bundle.ts';
import { type DbBundle, type DbBundleMeta, useStorage } from '@/composables/storage.ts';
import { Control, type FieldType, type NumberFieldType } from '@/domain/Encoder.ts';
import { watchDebounced } from '@vueuse/core';
import type { EncoderGroup } from '@/domain/EncoderGroup.ts';
import router from '@/router';
import useHistory from '@/composables/history.ts';
import type { Publication } from '@/composables/api-client.ts';
import useBusy from '@/composables/busy.ts';

export function* generateIds() {
  for (let i = 0; i < 16; i++) yield i;
}

export async function getFactoryBundle() {
  const r = await fetch(import.meta.env.BASE_URL + '/EC4-factory-v2.syx');
  const blob = await r.blob();
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return Ec4Bundle.fromBytes(bytes, 'Factory Default');
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
  const factoryBundle = getFactoryBundle();
  const storage = useStorage();
  const { setBusy } = useBusy();
  const activeBundle: Ref<Ec4Bundle> = ref(Ec4Bundle.createEmpty());
  (async () => (activeBundle.value = (await factoryBundle).clone()))();

  const selectedSetupIndex = ref<number>(0);

  const encoderGroups = computed(() => activeBundle.value.setups[selectedSetupIndex.value].groups);
  const selectedGroupIndex = ref<number>(0);
  const selectedGroup = computed(() => encoderGroups.value[selectedGroupIndex.value]);

  const editorMode = ref<'push' | 'turn'>('turn');

  function setEditorMode(mode: 'push' | 'turn') {
    editorMode.value = mode;
  }

  const selectedEncoderIndex = ref<number>(0);
  const selectedControl = computed(() => selectedGroup.value.controls[selectedEncoderIndex.value]);
  const activeField = ref<FieldType>('channel');

  const lastStateSaved = ref(0);

  const setupToPublish = ref<EncoderSetup | undefined>();
  const publicationToUpdate = ref<Publication | undefined>();
  const showStore = ref(false);

  const history = useHistory();
  let historyPaused = false;

  // Auto save after a bit of inactivity
  watchDebounced(
    activeBundle,
    async (newBundle, oldBundle) => {
      // No auto save if we are loading a bundle
      if (!newBundle || newBundle.id !== oldBundle.id) return;
      const delta = await setBusy(storage.saveBundle(newBundle));
      if (delta && !historyPaused) {
        history.pushEdit(delta);
      }
      historyPaused = false;
      lastStateSaved.value = Date.now();
    },
    { deep: true, debounce: 1000 },
  );

  async function newBundle() {
    selectedSetupIndex.value = 0;
    selectedGroupIndex.value = 0;
    selectedEncoderIndex.value = 0;
    activeBundle.value = (await getFactoryBundle()).clone();
    history.clear();
    await router.push({ name: 'new' });
  }

  const activeNumberField = computed(() => {
    return Object.keys(selectedControl.value.numbers).includes(activeField.value)
      ? (activeField.value as NumberFieldType)
      : null;
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
      activeBundle.value = await setBusy(storage.loadBundle(id));
      history.clear();
    },
    lastStateSaved,
    activeField,
    activeNumberField,
    setupToPublish,
    publicationToUpdate,
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
    newBundle,
    history,
    currentDbState() {
      return activeBundle.value.toDb();
    },
    setState(bundle: DbBundle, meta: DbBundleMeta) {
      activeBundle.value = Ec4Bundle.fromDb(bundle, meta);
    },
    skipHistory() {
      historyPaused = true;
    },
    showStore,
    activeBundleFn: () => activeBundle,
  };
});
