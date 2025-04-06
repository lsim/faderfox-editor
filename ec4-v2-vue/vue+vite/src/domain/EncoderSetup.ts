import { generateIds } from '@/stores/faderfox-ec4.ts';
import { getSetupName, setSetupName } from '@/memoryLayout.ts';
import { EncoderGroup } from '@/domain/EncoderGroup.ts';

export class EncoderSetup {
  id: number;
  name: string;
  groups: EncoderGroup[];

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
    this.groups = Array.from(generateIds()).map((groupId) => {
      return new EncoderGroup(groupId, this.id, `GR${String(groupId + 1).padStart(2, '0')}`);
    });
  }

  fromBytes(bytes: Uint8Array<ArrayBufferLike>) {
    this.name = getSetupName(bytes, this.id);
    for (const group of this.groups) {
      group.fromBytes(bytes, this.id);
    }
  }

  toBytes(buffer: Uint8Array<ArrayBufferLike>) {
    setSetupName(buffer, this.id, this.name);
    for (const group of this.groups) {
      group.toBytes(buffer);
    }
  }

  clone(setupId?: number): EncoderSetup {
    const s = new EncoderSetup(setupId ?? this.id, this.name);
    return Object.assign(s, {
      ...this,
      id: s.id,
      groups: this.groups.map((g) => g.clone(s.id)),
    });
  }
}
