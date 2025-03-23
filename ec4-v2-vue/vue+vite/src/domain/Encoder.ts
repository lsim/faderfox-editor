import { getMemField, getEncoderName, setMemField } from '@/memoryLayout.ts';

export type FieldType =
  | 'channel'
  | 'number'
  | 'number_h'
  | 'lower'
  | 'lower_msb'
  | 'upper'
  | 'upper_msb'
  | 'mode'
  | 'type'
  | 'scale' /* display */
  | 'name'
  | 'link'
  | 'pb_channel'
  | 'pb_display'
  | 'pb_type'
  | 'pb_mode'
  | 'pb_number'
  | 'pb_lower'
  | 'pb_upper'
  | 'pb_link';

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

export const encoderTypeByName = (name: (typeof encoderTypes)[number]['short']) =>
  encoderTypes.findIndex((t) => t.short === name);

export const pushButtonTypeByName = (name: (typeof pushbuttonTypes)[number]['short']) =>
  pushbuttonTypes.findIndex((t) => t.short === name);

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

const encoderModeByName = (name: (typeof encoderModes)[number]['text']) =>
  encoderModes.findIndex((t) => t.text === name);

const pushButtonModeByName = (name: (typeof pushButtonModes)[number]['text']) =>
  pushButtonModes.findIndex((t) => t.text === name);

export class Control {
  name: string;
  id: number;
  groupId: number;
  setupId: number;

  // The type (cc, nrpn, note, etc)
  type: number;
  // The channel of the encoder
  channel: number;
  // The CC/NRPN address or note number of the encoder
  number: number;
  // The MSB of the encoder (for nrpn
  number_h: number;
  // The lower limit of the encoder
  lower: number;
  lower_msb: number;
  // The upper limit of the encoder
  upper: number;
  upper_msb: number;
  // The speed of the encoder
  mode: number;
  // The display/range of the encoder
  scale: number;
  // Whether the encoder is linked to the next encoder
  link: boolean;
  // Channel of the push button
  pb_channel: number;
  // The display/range of the push button
  pb_display: number;
  // The type (cc, nrpn, note, etc)
  pb_type: number;
  // The speed of the push button
  pb_mode: number;
  // The lower limit of the push button
  pb_lower: number;
  pb_upper: number;
  // The upper limit of the push button
  pb_number: number;
  // Whether the push button is linked to the next push button
  pb_link: boolean;

  constructor(name: string, id: number, groupId: number, setupId: number) {
    this.name = name;
    this.id = id;
    this.groupId = groupId;
    this.setupId = setupId;
    this.channel = 1;
    this.number = 0;
    this.number_h = 0;
    this.lower = 0;
    this.lower_msb = 0;
    this.upper = 0;
    this.upper_msb = 0;
    this.mode = encoderModeByName('Acc3');
    this.scale = 1;
    this.type = encoderTypeByName('CCab');
    this.link = false;
    this.pb_channel = 1;
    this.pb_display = 0;
    this.pb_type = pushButtonTypeByName('Note');
    this.pb_mode = pushButtonModeByName('Key');
    this.pb_number = 0;
    this.pb_lower = 0;
    this.pb_upper = 0;
    this.pb_link = false;
  }

  fromBytes(
    bytes: Uint8Array<ArrayBufferLike>,
    setupId: number,
    groupId: number,
    encoderId: number,
  ) {
    this.id = encoderId;
    this.groupId = groupId;
    this.setupId = setupId;
    this.name = getEncoderName(bytes, setupId, groupId, encoderId);
    this.type = getMemField(bytes, setupId, groupId, encoderId, 'type') as any;
    this.channel = getMemField(bytes, setupId, groupId, encoderId, 'channel');
    this.number = getMemField(bytes, setupId, groupId, encoderId, 'number');
    this.number_h = getMemField(bytes, setupId, groupId, encoderId, 'number_h');
    this.lower = getMemField(bytes, setupId, groupId, encoderId, 'lower');
    this.lower_msb = getMemField(bytes, setupId, groupId, encoderId, 'lower_msb');
    this.upper = getMemField(bytes, setupId, groupId, encoderId, 'upper');
    this.upper_msb = getMemField(bytes, setupId, groupId, encoderId, 'upper_msb');
    this.mode = getMemField(bytes, setupId, groupId, encoderId, 'mode');
    this.scale = getMemField(bytes, setupId, groupId, encoderId, 'scale');
    this.link = getMemField(bytes, setupId, groupId, encoderId, 'link') !== 0;
    this.pb_channel = getMemField(bytes, setupId, groupId, encoderId, 'pb_channel');
    this.pb_display = getMemField(bytes, setupId, groupId, encoderId, 'pb_display');
    this.pb_type = getMemField(bytes, setupId, groupId, encoderId, 'pb_type');
    this.pb_mode = getMemField(bytes, setupId, groupId, encoderId, 'pb_mode');
    this.pb_number = getMemField(bytes, setupId, groupId, encoderId, 'pb_number');
    this.pb_lower = getMemField(bytes, setupId, groupId, encoderId, 'pb_lower');
    this.pb_upper = getMemField(bytes, setupId, groupId, encoderId, 'pb_upper');
    this.pb_link = getMemField(bytes, setupId, groupId, encoderId, 'pb_link') !== 0;
  }

  toBytes(buffer: Uint8Array<ArrayBufferLike>) {
    setMemField(buffer, this.setupId, this.groupId, this.id, 'name', this.name);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'type', this.type);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'channel', this.channel);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'number', this.number);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'number_h', this.number_h);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'lower', this.lower);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'lower_msb', this.lower_msb);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'upper', this.upper);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'upper_msb', this.upper_msb);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'mode', this.mode);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'scale', this.scale);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'link', this.link);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'pb_channel', this.pb_channel);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'pb_display', this.pb_display);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'pb_type', this.pb_type);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'pb_mode', this.pb_mode);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'pb_number', this.pb_number);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'pb_lower', this.pb_lower);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'pb_upper', this.pb_upper);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'pb_link', this.pb_link);
  }
}
