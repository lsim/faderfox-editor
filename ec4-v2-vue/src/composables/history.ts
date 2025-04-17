import { type DbBundle, DbBundleDelta, type DbBundleMeta } from '@/composables/storage.ts';
import { computed, ref } from 'vue';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';

export default function useHistory() {
  const undoStack = ref<DbBundleDelta[]>([]);
  const redoStack = ref<DbBundleDelta[]>([]);

  function pushEdit(delta: DbBundleDelta) {
    undoStack.value.push(delta);
    redoStack.value = [];
  }

  function undoFrom(bundle: DbBundle, meta: DbBundleMeta) {
    if (undoStack.value.length === 0) return;
    const delta = undoStack.value.pop();
    if (!delta) return;
    redoStack.value.push(delta);
    delta.applyBackward(bundle, meta);
  }

  function redoFrom(bundle: DbBundle, meta: DbBundleMeta) {
    if (redoStack.value.length === 0) return;
    const delta = redoStack.value.pop();
    if (!delta) return;
    undoStack.value.push(delta);
    delta.applyForward(bundle, meta);
  }

  const canUndo = computed(() => undoStack.value.length > 0);
  const canRedo = computed(() => redoStack.value.length > 0);

  const ec4 = useEc4Store();

  function undo() {
    if (!canUndo.value) return;
    const [bundle, meta] = ec4.currentDbState();
    if (!bundle || !meta || !bundle.id) throw Error('No bundle found');
    undoFrom(bundle as DbBundle, meta as DbBundleMeta);
    // Avoid pushing the undo onto the undo stack when saving after this operation
    ec4.skipHistory();
    ec4.setState(bundle as DbBundle, meta as DbBundleMeta);
  }

  function redo() {
    if (!canRedo.value) return;
    const [bundle, meta] = ec4.currentDbState();
    if (!bundle || !meta || !bundle.id) throw Error('No bundle found');
    redoFrom(bundle as DbBundle, meta as DbBundleMeta);
    // Avoid pushing the redo onto the undo stack when saving after this operation
    ec4.skipHistory();
    ec4.setState(bundle as DbBundle, meta as DbBundleMeta);
  }

  return {
    pushEdit,
    undo,
    redo,
    canUndo,
    canRedo,
    clear() {
      undoStack.value = [];
      redoStack.value = [];
    },
  };
}
