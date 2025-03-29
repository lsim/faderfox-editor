import { Dexie, type EntityTable, liveQuery } from 'dexie';
import { useObservable } from '@vueuse/rxjs';
import { from } from 'rxjs';
import { Ec4Bundle } from '@/domain/Ec4Bundle.ts';
import router from '@/router';

export interface BundleMeta {
  id: number;
  name: string;
  timestamp: number;
}

export interface Bundle {
  bytes: Uint8Array;
  id: number;
}

export function useStorage() {
  const db = new Dexie('ec4-editor-settings') as Dexie & {
    summaries: EntityTable<BundleMeta, 'id'>;
    bundles: EntityTable<Bundle, 'id'>;
  };

  db.version(1).stores({
    summaries: 'id, timestamp, name',
    bundles: '++id, bytes',
  });

  const bundleMetas = useObservable<BundleMeta[]>(
    from(liveQuery<BundleMeta[]>(async () => db.summaries.toArray())),
  );

  async function getBundle(meta: BundleMeta) {
    return db.bundles.get(meta.id);
  }

  async function updateBundle(meta: BundleMeta, bundle: Bundle) {
    await db.transaction('rw', db.bundles, db.summaries, async () => {
      await db.bundles.put(bundle);
      await db.summaries.put(meta);
    });
  }

  async function deleteBundle(meta: BundleMeta) {
    await db.transaction('rw', db.bundles, db.summaries, async () => {
      await db.bundles.delete(meta.id);
      await db.summaries.delete(meta.id);
    });
  }

  async function saveBundle(toSave: Ec4Bundle) {
    // Update if it has an id, otherwise add
    const [bundle, meta] = toSave.toDb();
    const existingMeta = bundle.id ? await db.summaries.get(bundle.id) : undefined;
    if (existingMeta) {
      await updateBundle({ ...meta, id: existingMeta.id }, { ...bundle, id: existingMeta.id });
    } else {
      await addBundle(bundle.bytes, meta.name);
      await router.push({ name: 'bundle', params: { bundleId: meta.id } });
    }
  }

  async function loadBundle(id: number): Promise<Ec4Bundle> {
    const meta = await db.summaries.get(id);
    if (!meta) throw Error(`No bundle found with id ${id}`);
    const bundle = await getBundle(meta);
    if (!bundle) throw Error(`No data found with id ${id}! This should not happen`);
    return Ec4Bundle.fromDb(bundle, meta);
  }

  async function addBundle(bytes: Uint8Array, name = '') {
    await db.transaction('rw', db.bundles, db.summaries, async () => {
      const meta: BundleMeta = {
        name,
        timestamp: Date.now(),
        id: await db.bundles.add({ bytes }),
      };
      console.log('addBundle', meta);
      await db.summaries.add(meta);
    });
  }

  return {
    bundleMetas,
    getBundle,
    deleteBundle,
    addBundle,
    saveBundle,
    loadBundle,
  };
}
