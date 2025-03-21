import { generateIds } from '@/stores/faderfox-ec4.ts';
import { getSetupName, setSetupName } from '@/memoryLayout.ts';
import { EncoderGroup } from '@/domain/EncoderGroup.ts';

export class EncoderSetup {
  id: number;
  name: string;
  groups: EncoderGroup[];

  constructor(id: number, name: string, groups: EncoderGroup[]) {
    this.id = id;
    this.name = name;
    this.groups = groups;
  }

  static fromBytes(bytes: Uint8Array<ArrayBufferLike>, setupId: number): EncoderSetup {
    const groups = Array.from(generateIds()).map((groupId) => {
      return EncoderGroup.fromBytes(bytes, setupId, groupId);
    });
    const setupName = getSetupName(bytes, setupId);
    return new EncoderSetup(setupId, setupName, groups);
  }

  toBytes(buffer: Uint8Array<ArrayBufferLike>) {
    setSetupName(buffer, this.id, this.name);
    for (const group of this.groups) {
      group.toBytes(buffer);
    }
  }
}
