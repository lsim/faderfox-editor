import type { EncoderSetup } from '@/domain/EncoderSetup.ts';
import { createEmptyEncoderSetups, type PartialBy } from '@/stores/faderfox-ec4.ts';
import type { DbBundle, DbBundleMeta } from '@/composables/storage.ts';
import { generateSysexData, parseSetupsFromSysex } from '@/memoryLayout.ts';

export class Ec4Bundle {
  name: string;
  id?: number;

  setups: EncoderSetup[];

  private constructor(name: string, setups: EncoderSetup[]) {
    this.name = name;
    this.setups = setups;
  }

  public static createEmpty() {
    return new Ec4Bundle('', createEmptyEncoderSetups());
  }

  public static fromDb(bundle: DbBundle, meta: DbBundleMeta) {
    const b = Ec4Bundle.fromBytes(bundle.bytes, meta.name);
    b.id = meta.id;
    if (meta.backendSetupIds) {
      for (let i = 0; i < b.setups.length && i < meta.backendSetupIds.length; i++) {
        b.setups[i].backendId = meta.backendSetupIds[i];
      }
    }
    return b;
  }

  public static fromBytes(bytes: Uint8Array, name: string) {
    const b = Ec4Bundle.createEmpty();
    b.name = name;
    parseSetupsFromSysex(bytes, b.setups);
    return b;
  }

  toDb(): [PartialBy<DbBundle, 'id'>, PartialBy<DbBundleMeta, 'id'>] {
    return [
      {
        bytes: generateSysexData(this.setups),
        id: this.id,
      },
      {
        id: this.id,
        name: this.name,
        timestamp: Date.now(),
        backendSetupIds: this.setups.map((s) => s.backendId),
      },
    ];
  }

  clone(): Ec4Bundle {
    const b = new Ec4Bundle(
      this.name,
      this.setups.map((s) => s.clone()),
    );
    b.id = this.id;
    return b;
  }
}
