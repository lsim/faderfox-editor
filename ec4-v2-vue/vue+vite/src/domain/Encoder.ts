import { generateIds } from '@/stores/faderfox-ec4.ts';
import { getMemField, getSetupName, getGroupName, getEncoderName } from '@/memoryLayout.ts';

export type FieldType =
  | 'channel'
  | 'number'
  | 'number_h'
  | 'lower'
  | 'upper'
  | 'mode'
  | 'type'
  | 'scale' /* display */
  | 'name'
  | 'link'
  | null;

export type EncoderType = {
  text: string;
  short: string;
  value: number;
};

export const encoderTypes: EncoderType[] = [
  { text: 'CC rel. 1', short: 'CCR1', value: 0 },
  { text: 'CC rel. 2', short: 'CCR2', value: 1 },
  { text: 'CC absolute', short: 'CCab', value: 2 },
  { text: 'Program change', short: 'PrgC', value: 3 },
  { text: 'CC 14bit absolute', short: 'CCAh', value: 4 },
  { text: 'Pitch bend', short: 'PBnd', value: 5 },
  { text: 'Aftertouch', short: 'AftT', value: 6 },
  { text: 'Note', short: 'Note', value: 7 },
  { text: 'NRPN', short: 'NRPN', value: 8 },
];

export const pushbuttonTypes: EncoderType[] = [
  { text: 'Off', short: 'Off', value: 0 },
  { text: 'Note', short: 'Note', value: 1 },
  { text: 'CC', short: 'CC', value: 2 },
  { text: 'PrgC', short: 'PrgC', value: 3 },
  { text: 'PBnd', short: 'PBnd', value: 4 },
  { text: 'AftT', short: 'AftT', value: 5 },
  { text: 'Grp', short: 'Grp', value: 6 },
  { text: 'Set', short: 'Set', value: 7 },
  { text: 'Acc0', short: 'Acc0', value: 8 },
  { text: 'Acc3', short: 'Acc3', value: 9 },
  { text: 'LSp6', short: 'LSp6', value: 10 },
  { text: 'Min', short: 'Min', value: 11 },
  { text: 'Max', short: 'Max', value: 12 },
];

export const typeByName = (name: (typeof encoderTypes)[number]['short']) =>
  encoderTypes.findIndex((t) => t.short === name);

export type ScaleOption = {
  text: string;
  short: string;
  value: number;
};

export const encoderScaleOptions: ScaleOption[] = [
  { text: 'display off', short: 'off', value: 0 },
  { text: '0...127', short: '127', value: 1 },
  { text: '0...100', short: '100', value: 2 },
  { text: '0...1000', short: '1000', value: 3 },
  { text: '-63...+63', short: '±63', value: 4 },
  { text: '-50...+50', short: '±50', value: 5 },
  { text: '-500...+500', short: '±500', value: 6 },
  { text: 'ON / OFF', short: 'ONOF', value: 7 },
  { text: '9999', short: '9999', value: 8 },
];
export const optionByName = (name: (typeof encoderScaleOptions)[number]['short']) =>
  encoderScaleOptions.findIndex((t) => t.short === name);

export const pushButtonScaleOptions: ScaleOption[] = [
  { text: 'display off', short: 'off', value: 0 },
  { text: 'display on', short: 'on', value: 1 },
];

export type ModeOption = {
  text: string;
  value: number;
  long: string;
};

export const pushButtonModes: ModeOption[] = [
  { text: 'Togl', value: 0, long: 'Toggle' },
  { text: 'Key', value: 1, long: 'While held' },
];

export const encoderModes: ModeOption[] = [
  { text: 'Div8', value: 0, long: 'Div. by 8' },
  { text: 'Div4', value: 1, long: 'Div. by 4' },
  { text: 'Div2', value: 2, long: 'Div. by 2' },
  { text: 'Acc0', value: 3, long: 'No acceleration' },
  { text: 'Acc1', value: 4, long: 'Low acceleration' },
  { text: 'Acc2', value: 5, long: 'Mid acceleration' },
  { text: 'Acc3', value: 6, long: 'Max acceleration' },
  { text: 'LSp2', value: 7, long: 'Large step 2' },
  { text: 'LSp4', value: 8, long: 'Large step 4' },
  { text: 'LSp6', value: 9, long: 'Large step 6' },
];

const modeByName = (name: (typeof encoderModes)[number]['text']) =>
  encoderModes.findIndex((t) => t.text === name);

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
}

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
}
export type ControlType = 'encoder' | 'push-button';
export class Encoder {
  id: number;
  groupId: number;
  setupId: number;
  // The name of the encoder
  name: string;
  // The channel of the encoder
  channel: number;
  // The CC/NRPN address or note number of the encoder
  number: number;
  // The MSB of the encoder (for nrpn
  number_h: number;
  // The lower limit of the encoder
  lower: number;
  // The upper limit of the encoder
  upper: number;
  // The speed of the encoder
  mode: number;
  // The display/range of the encoder
  scale: number;
  // The type (cc, nrpn, note, etc)
  type: number;
  // Whether the encoder is linked to the next encoder
  link: boolean;

  // Extra info
  controlType: ControlType = 'encoder';

  constructor(id: number, groupId: number, setupId: number, type?: number, mode?: number) {
    this.id = id;
    this.groupId = groupId;
    this.setupId = setupId;
    this.name = '----';
    this.channel = 0;
    this.number = 0;
    this.number_h = 0;
    this.lower = 0;
    this.upper = 0;
    this.mode = mode || encoderModes.findIndex((m) => m.text === 'Acc3');
    this.scale = 1;
    this.type = type || typeByName('CCab');
    this.link = false;
  }

  static encoderFromBytes(
    bytes: Uint8Array<ArrayBufferLike>,
    setupId: number,
    groupId: number,
    encoderId: number,
  ): Encoder {
    const type = getMemField(bytes, setupId, groupId, encoderId, 'type') as any;

    const res = new Encoder(encoderId, groupId, setupId, type);

    res.channel = getMemField(bytes, setupId, groupId, encoderId, 'channel');
    res.number = getMemField(bytes, setupId, groupId, encoderId, 'number');
    res.number_h = getMemField(bytes, setupId, groupId, encoderId, 'number_h');
    res.lower = getMemField(bytes, setupId, groupId, encoderId, 'lower');
    res.upper = getMemField(bytes, setupId, groupId, encoderId, 'upper');
    res.mode = getMemField(bytes, setupId, groupId, encoderId, 'mode');
    res.scale = getMemField(bytes, setupId, groupId, encoderId, 'scale');
    res.link = getMemField(bytes, setupId, groupId, encoderId, 'link') !== 0;
    res.name = getEncoderName(bytes, setupId, groupId, encoderId);

    return res;
  }
}

export class PushButton extends Encoder {
  controlType: ControlType = 'push-button';
  constructor(id: number, groupId: number) {
    super(id, groupId, typeByName('Note'), modeByName('Key'));
  }

  static pushButtonFromBytes(
    bytes: Uint8Array<ArrayBufferLike>,
    setupId: number,
    groupId: number,
    encoderId: number,
  ): PushButton {
    const res = new PushButton(encoderId, groupId);
    res.channel = getMemField(bytes, setupId, groupId, encoderId, 'pb_channel');
    res.scale = getMemField(bytes, setupId, groupId, encoderId, 'pb_display');
    res.type = getMemField(bytes, setupId, groupId, encoderId, 'pb_type');
    res.mode = getMemField(bytes, setupId, groupId, encoderId, 'pb_mode');
    res.number = getMemField(bytes, setupId, groupId, encoderId, 'pb_number');
    res.lower = getMemField(bytes, setupId, groupId, encoderId, 'pb_lower');
    res.upper = getMemField(bytes, setupId, groupId, encoderId, 'pb_upper');
    res.link = getMemField(bytes, setupId, groupId, encoderId, 'pb_link') !== 0;
    res.name = getEncoderName(bytes, setupId, groupId, encoderId);
    return res;
  }
}
