import { MEM, parseSysexData } from '@/composables/useMemLayout.ts';
import { generateIds } from '@/stores/faderfox-ec4.ts';

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
};

export const pushButtonModes: ModeOption[] = [
  { text: 'Togl', value: 0 },
  { text: 'Key', value: 1 },
];

export const encoderModes: ModeOption[] = [
  { text: 'LSp6', value: 0 },
  { text: 'LSp4', value: 1 },
  { text: 'LSp2', value: 2 },
  { text: 'Acc3', value: 3 },
  { text: 'Acc2', value: 4 },
  { text: 'Acc1', value: 5 },
  { text: 'Acc0', value: 6 },
  { text: 'Div2', value: 7 },
  { text: 'Div4', value: 8 },
  { text: 'Div8', value: 9 },
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
      return Encoder.fromBytes(bytes, setupId, groupId, encoderId);
    });
    const groupName = P.getGroupName(bytes, setupId, groupId);
    return new EncoderGroup(groupId, setupId, groupName, encoders, []);
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
    const setupName = P.getSetupName(bytes, setupId);
    return new EncoderSetup(setupId, setupName, groups);
  }
}

const P = {
  // P is short for Parameter
  type: 'type',
  channel: 'channel',
  number: 'number',
  number_h: 'number_h',
  lower: 'lower',
  upper: 'upper',
  mode: 'mode',
  scale: 'scale',
  name: 'name',

  labels: {
    type: 'Type',
    channel: 'Channel',
    number: 'Number',
    number_h: 'MSB',
    number_nrpn: '#MSB/LSB',
    lower: 'Lower',
    upper: 'Upper',
    mode: 'Mode',
    scale: 'Display',
  },

  _dataFormat: {
    type: { pos: 0, mask: 0xf0, lsb: 4, min: 0, max: 8, default: 2 },
    channel: { pos: 0, mask: 0x0f },
    number: { pos: 16, mask: 0xff },
    number_h: { pos: 32, mask: 0xff },
    lower: { pos: 48, mask: 0xff },
    upper: { pos: 64, mask: 0xff },
    mode: {
      pos: 80,
      mask: parseInt('11000000', 2),
      lsb: 6,
      min: 0,
      max: 3,
      default: 3,
    },
    scale: {
      pos: 80,
      mask: parseInt('00111111', 2),
      min: 0,
      max: 7,
      default: 1,
    },
    name: { pos: 128 },
  },

  get: function <TRes>(
    data: Uint8Array<ArrayBufferLike>,
    setupId: number,
    groupId: number,
    encoderId: number,
    type: Exclude<FieldType, null>,
  ): TRes {
    // if (type === 'select-encoder') {
    //   return;
    // }
    const spec = encoderDataFormat[type];
    if (!spec) {
      console.log('Get unknown parameter type: ' + type);
      throw Error('Get unknown parameter type: ' + type);
    }
    let addr = MEM.addrPresets + (setupId * 16 + groupId) * MEM.lengthGroup + spec.pos;
    if (type === P.name) {
      addr += encoderId * 4;
      return P.stringFromPosition(data, addr) as TRes;
    } else {
      addr += encoderId;
      const shift = spec.lsb || 0;
      if (spec.mask != 0xff) {
        let val = data[addr] & (spec.mask ?? 0xff);
        val = val >> shift;
        if (spec.hasOwnProperty('min')) {
          if (val < (spec.min ?? 0) || val > (spec.max ?? 0xff)) {
            val = spec.default ?? 0;
          }
        }
        if (type === P.channel) val++;
        return val as TRes;
      } else {
        return data[addr] as TRes;
      }
    }
  },
  set: function (
    data: Uint8Array<ArrayBufferLike>,
    setupId: number,
    groupId: number,
    encoderId: number,
    type: Exclude<FieldType, null>,
    value: any,
  ) {
    const spec = encoderDataFormat[type];
    if (!spec) {
      console.log('Set unknown parameter type: ' + type);
      return;
    }
    let addr = MEM.addrPresets + (setupId * 16 + groupId) * MEM.lengthGroup + spec.pos;
    if (type === P.name) {
      addr += encoderId * 4;
      while (value.length < 4) {
        value += ' ';
      }
      for (let i = 0; i < 4; i++) {
        const oldValue = data[addr + i];
        data[addr + i] = value.charCodeAt(i);
        // isDirty = isDirty | (data[addr + i] != oldValue);
      }
    } else {
      addr += encoderId;
      const oldValue = data[addr];
      value = parseInt(value);
      if (type === P.channel) value--;
      const shift = spec.lsb || 0;
      if (spec.mask != 0xff) {
        const invMask = 0xff ^ (spec.mask ?? 0);
        value = (value & ((spec.mask ?? 0xff) >> shift)) << shift;
        data[addr] = (data[addr] & invMask) | value;
      } else {
        value = value & 0xff; // ensure 8 bit
        data[addr] = value;
      }
      // isDirty = isDirty | (data[addr] != oldValue); // TODO: what is this?
    }
  },
  setSetupName: function (data: Uint8Array<ArrayBufferLike>, setupId: number, name: string) {
    while (name.length < 4) {
      name += ' ';
    }
    const addr = MEM.addrSetupNames + setupId * 4;
    for (let i = 0; i < 4; i++) {
      data[addr + i] = name.charCodeAt(i);
    }
  },
  setGroupName: function (
    data: Uint8Array<ArrayBufferLike>,
    setupId: number,
    groupId: number,
    name: string,
  ) {
    while (name.length < 4) {
      name += ' ';
    }
    const addr = MEM.addrGroupNames + setupId * 64 + groupId * 4;
    for (let i = 0; i < 4; i++) {
      data[addr + i] = name.charCodeAt(i);
    }
  },
  getGroupName: function (data: Uint8Array<ArrayBufferLike>, setupId: number, groupId: number) {
    return P.stringFromPosition(data, MEM.addrGroupNames + setupId * 64 + groupId * 4);
  },
  getSetupName: function (data: Uint8Array<ArrayBufferLike>, setupId: number) {
    return P.stringFromPosition(data, MEM.addrSetupNames + setupId * 4);
  },
  stringFromPosition: function (data: Uint8Array<ArrayBufferLike>, position: number) {
    const characters = data.subarray(position, position + 4);
    return String.fromCharCode(...characters);
  },
};

type MemSpec = {
  pos: number;
  mask?: number;
  lsb?: number;
  min?: number;
  max?: number;
  default?: number;
  memstart?: number;
  grouplen?: number;
};

const encoderDataFormat: Record<string, MemSpec> = {
  type: { pos: 0, mask: 0xf0, lsb: 4, min: 0, max: 8, default: 2 },
  channel: { pos: 0, mask: 0x0f },
  number: { pos: 16, mask: 0x7f },
  number_h: { pos: 32, mask: 0xff },
  link: {
    pos: 16,
    mask: 0x80,
    lsb: 7,
  },
  lower: { pos: 48, mask: 0xff },
  upper: { pos: 64, mask: 0xff },
  lower_msb: { pos: 96, mask: 0x0f },
  upper_msb: { pos: 96, mask: 0xf0, lsb: 4 },
  mode: {
    pos: 80,
    mask: 0xf0,
    lsb: 4,
    min: 0,
    max: 9,
    default: 3,
  },
  scale: {
    pos: 80,
    mask: 0x0f,
    min: 0,
    max: 8,
    default: 1,
  },
  name: { pos: 128 },
  pb_mode: {
    pos: 0,
    mask: 0x80,
    lsb: 7,
    memstart: MEM.addrKey1,
    grouplen: MEM.lengthGroupKey1,
  },
  pb_number: {
    pos: 0,
    mask: 0x7f,
    memstart: MEM.addrKey1,
    grouplen: MEM.lengthGroupKey1,
  },
  pb_type: {
    pos: 112,
    mask: 0xf0,
    lsb: 4,
  },
  pb_channel: {
    pos: 112,
    mask: 0x0f,
  },
  pb_display: {
    memstart: MEM.addrKey2,
    pos: 0,
    grouplen: MEM.lengthGroupKey2,
    mask: 0x80,
    lsb: 7,
  },
  pb_lower: {
    memstart: MEM.addrKey2,
    pos: 0,
    mask: 0x7f,
    grouplen: MEM.lengthGroupKey2,
  },
  pb_link: {
    memstart: MEM.addrKey2,
    pos: 16,
    grouplen: MEM.lengthGroupKey2,
    mask: 0x80,
    lsb: 7,
  },
  pb_upper: {
    memstart: MEM.addrKey2,
    pos: 16,
    mask: 0x7f,
    grouplen: 32,
  },
};

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

  static fromBytes(
    bytes: Uint8Array<ArrayBufferLike>,
    setupId: number,
    groupId: number,
    encoderId: number,
  ): Encoder {
    const type = P.get(bytes, setupId, groupId, encoderId, 'type') as any;

    const res = new Encoder(encoderId, groupId, setupId, type);

    res.channel = P.get(bytes, setupId, groupId, encoderId, 'channel');
    res.number = P.get(bytes, setupId, groupId, encoderId, 'number');
    res.number_h = P.get(bytes, setupId, groupId, encoderId, 'number_h');
    res.lower = P.get(bytes, setupId, groupId, encoderId, 'lower');
    res.upper = P.get(bytes, setupId, groupId, encoderId, 'upper');
    res.mode = P.get(bytes, setupId, groupId, encoderId, 'mode');
    res.scale = P.get(bytes, setupId, groupId, encoderId, 'scale');
    res.name = P.get(bytes, setupId, groupId, encoderId, 'name');

    return res;
  }
}

export class PushButton extends Encoder {
  constructor(id: number, groupId: number) {
    super(id, groupId, typeByName('Note'), modeByName('Key'));
  }
}
