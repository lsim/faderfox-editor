import type { EncoderSetup } from '@/domain/EncoderSetup.ts';
import { createEmptyEncoderSetups, type PartialBy } from '@/stores/faderfox-ec4.ts';
import type { Bundle, BundleMeta } from '@/composables/storage.ts';
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

  public static fromDb(bundle: Bundle, meta: BundleMeta) {
    const b = Ec4Bundle.createEmpty();
    b.name = meta.name;
    b.id = meta.id;
    parseSetupsFromSysex(bundle.bytes, b.setups);
    console.log('Loading from db', b.id, b);
    return b;
  }

  toDb(): [PartialBy<Bundle, 'id'>, PartialBy<BundleMeta, 'id'>] {
    return [
      {
        bytes: generateSysexData(this.setups),
        id: this.id,
      },
      {
        id: this.id,
        name: this.name,
        timestamp: Date.now(),
      },
    ];
  }
}
