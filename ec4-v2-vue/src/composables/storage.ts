import { Dexie, type EntityTable, liveQuery } from 'dexie';
import { useObservable } from '@vueuse/rxjs';
import { from } from 'rxjs';
import { Ec4Bundle } from '@/domain/Ec4Bundle.ts';
import router from '@/router';

export interface DbBundleMeta {
  id: number;
  name: string;
  timestamp: number;
}

export interface DbBundle {
  bytes: Uint8Array;
  id: number;
}

export class DbBundleDelta {
  private readonly byteDelta: Map<number, number> = new Map();
  private readonly newName: string | null = null;
  private readonly oldName: string | null = null;
  constructor(
    oldBundle: DbBundle,
    oldMeta: DbBundleMeta,
    newBundle: DbBundle,
    newMeta: DbBundleMeta,
  ) {
    // Old bytes and new bytes are always the same length. Ids also never change
    for (let i = 0; i < oldBundle.bytes.length; i++) {
      if (oldBundle.bytes[i] !== newBundle.bytes[i]) {
        this.byteDelta.set(i, newBundle.bytes[i] ^ oldBundle.bytes[i]);
      }
    }
    if (oldMeta.name !== newMeta.name) {
      this.newName = newMeta.name;
      this.oldName = oldMeta.name;
    }
  }

  applyBinary(bytes: Uint8Array) {
    for (const [i, v] of this.byteDelta.entries()) {
      bytes[i] = v ^ bytes[i];
    }
  }

  // Apply to the older bundle to get the newer bundle - for redo
  applyForward(bundle: DbBundle, meta: DbBundleMeta) {
    this.applyBinary(bundle.bytes);
    if (this.newName) {
      meta.name = this.newName;
    }
  }
  // ... and to the newer bundle to get the older bundle - for undo
  applyBackward(bundle: DbBundle, meta: DbBundleMeta) {
    this.applyBinary(bundle.bytes);
    if (this.oldName) {
      meta.name = this.oldName;
    }
  }
}

export function useStorage() {
  const db = new Dexie('ec4-editor-settings') as Dexie & {
    summaries: EntityTable<DbBundleMeta, 'id'>;
    bundles: EntityTable<DbBundle, 'id'>;
  };

  db.version(1).stores({
    summaries: 'id, timestamp, name',
    bundles: '++id, bytes',
  });

  const bundleMetas = useObservable<DbBundleMeta[]>(
    from(liveQuery<DbBundleMeta[]>(async () => db.summaries.toArray())),
  );

  async function getBundle(meta: DbBundleMeta) {
    return db.bundles.get(meta.id);
  }

  async function updateBundle(meta: DbBundleMeta, bundle: DbBundle): Promise<DbBundle | null> {
    return db.transaction('rw', db.bundles, db.summaries, async () => {
      // Retrieve the old bytes so we can calculate the delta
      const oldBundle = await db.bundles.get(meta.id);
      await db.bundles.put(bundle);
      await db.summaries.put(meta);
      return oldBundle || null;
    });
  }

  async function deleteBundle(meta: DbBundleMeta) {
    await db.transaction('rw', db.bundles, db.summaries, async () => {
      await db.bundles.delete(meta.id);
      await db.summaries.delete(meta.id);
    });
  }

  // Returns the delta to the bundle and the delta to the meta
  async function saveBundle(toSave: Ec4Bundle): Promise<DbBundleDelta | null> {
    // Update if it has an id, otherwise add
    const [bundle, meta] = toSave.toDb();
    const existingMeta = bundle.id ? await db.summaries.get(bundle.id) : undefined;
    if (existingMeta) {
      const prevBundle = await updateBundle(
        { ...meta, id: existingMeta.id },
        { ...bundle, id: existingMeta.id },
      );
      return prevBundle && prevBundle.id
        ? new DbBundleDelta(prevBundle, existingMeta, bundle as DbBundle, meta as DbBundleMeta)
        : null;
    } else {
      const newId = await addBundle(bundle.bytes, meta.name);
      await router.push({ name: 'bundle', params: { bundleId: newId } });
      return null;
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
    let newId = 0;
    await db.transaction('rw', db.bundles, db.summaries, async () => {
      const meta: DbBundleMeta = {
        name,
        timestamp: Date.now(),
        id: await db.bundles.add({ bytes }),
      };
      console.log('addBundle', meta);
      newId = await db.summaries.add(meta);
    });
    return newId;
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
