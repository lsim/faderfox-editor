import { generateIds } from '@/stores/faderfox-ec4.ts';
import { getGroupName, setGroupName } from '@/memoryLayout.ts';
import { Control } from '@/domain/Encoder.ts';

export class EncoderGroup {
  id: number;
  name: string;
  controls: Control[];
  setupId: number;

  constructor(id: number, setupId: number, name: string) {
    this.name = name;
    this.id = id;
    this.setupId = setupId;
    this.controls = Array.from(generateIds()).map(
      (controlId) => new Control('----', controlId, this.id, this.setupId),
    );
  }

  fromBytes(bytes: Uint8Array<ArrayBufferLike>, setupId: number) {
    for (let i = 0; i < 16; i++) {
      this.controls[i].fromBytes(bytes, setupId, this.id, i);
    }
    this.name = getGroupName(bytes, setupId, this.id);
  }

  toBytes(buffer: Uint8Array<ArrayBufferLike>) {
    setGroupName(buffer, this.setupId, this.id, this.name);
    for (const control of this.controls) {
      control.toBytes(buffer);
    }
  }

  clone(setupId?: number, groupId?: number): EncoderGroup {
    const g = new EncoderGroup(groupId ?? this.id, setupId ?? this.setupId, this.name);
    return Object.assign(g, {
      ...this,
      id: g.id,
      setupId: g.setupId,
      controls: this.controls.map((c) => c.clone(g.setupId, g.id)),
    });
  }
}
