import { generateIds } from '@/stores/faderfox-ec4.ts';
import { getGroupName } from '@/memoryLayout.ts';
import { Encoder, PushButton } from '@/domain/Encoder.ts';

export class EncoderGroup {
  id: number;
  name: string;
  encoders: Encoder[];
  pushButtons: PushButton[];
  setupId: number;

  constructor(
    id: number,
    setupId: number,
    name: string,
    encoders: Encoder[],
    pushButtons: PushButton[],
  ) {
    this.id = id;
    this.name = name;
    this.encoders = encoders;
    this.pushButtons = pushButtons;
    this.setupId = setupId;
  }

  static fromBytes(
    bytes: Uint8Array<ArrayBufferLike>,
    setupId: number,
    groupId: number,
  ): EncoderGroup {
    const encoders = Array.from(generateIds()).map((encoderId) => {
      return Encoder.encoderFromBytes(bytes, setupId, groupId, encoderId);
    });
    const pushButtons = Array.from(generateIds()).map((encoderId) => {
      return PushButton.pushButtonFromBytes(bytes, setupId, groupId, encoderId);
    });
    const groupName = getGroupName(bytes, setupId, groupId);
    return new EncoderGroup(groupId, setupId, groupName, encoders, pushButtons);
  }

  static toBytes(buffer: Uint8Array) {}
}
