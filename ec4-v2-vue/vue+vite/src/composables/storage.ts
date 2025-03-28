import { Dexie, type EntityTable, liveQuery } from 'dexie';
import { useObservable } from '@vueuse/rxjs';
import { filter, from } from 'rxjs';

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

  async function addBundle(bytes: Uint8Array, name: string = '') {
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
    updateBundle,
    deleteBundle,
    addBundle,
  };
}
