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

export type NumberFieldType = keyof Control['numbers'];

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

export const pushButtonTypes: EncoderType[] = [
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

export const pushButtonTypeByName = (name: (typeof pushButtonTypes)[number]['short']) =>
  pushButtonTypes.findIndex((t) => t.short === name);

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

type ControlNumbers = Omit<Record<FieldType, number>, 'name' | 'link' | 'pb_link'>;

export class Control {
  name: string;
  id: number;
  numbers: ControlNumbers;
  groupId: number;
  setupId: number;

  // Whether the encoder is linked to the next encoder
  link: boolean;
  // Whether the push button is linked to the next push button
  pb_link: boolean;

  constructor(name: string, id: number, groupId: number, setupId: number) {
    this.name = name;
    this.id = id;
    this.groupId = groupId;
    this.setupId = setupId;
    this.numbers = {
      // The channel of the encoder
      channel: 1,
      // The MSB of the encoder (for nrpn)
      number: 0,
      // The LSB of the encoder (for nrpn)
      number_h: 0,
      // The lower limit of the encoder
      lower: 0,
      // The MSB of the lower limit of the encoder
      lower_msb: 0,
      // The upper limit of the encoder
      upper: 0,
      // The MSB of the upper limit of the encoder
      upper_msb: 0,
      // The speed of the encoder
      mode: encoderModeByName('Acc3'),
      // The display/range of the encoder
      scale: 1,
      // The type (cc, nrpn, note, etc)
      type: encoderTypeByName('CCab'),
      // The channel of the push button
      pb_channel: 1,
      // The display/range of the push button
      pb_display: 0,
      // The type (cc, nrpn, note, etc)
      pb_type: pushButtonTypeByName('Note'),
      // The type of action for the push button
      pb_mode: pushButtonModeByName('Key'),
      // The value sent when the push button is pressed
      pb_number: 0,
      pb_lower: 0,
      pb_upper: 0,
    };
    this.link = false;
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
    this.link = getMemField(bytes, setupId, groupId, encoderId, 'link') !== 0;
    this.pb_link = getMemField(bytes, setupId, groupId, encoderId, 'pb_link') !== 0;
    this.numbers = {
      type: getMemField(bytes, setupId, groupId, encoderId, 'type') as any,
      channel: getMemField(bytes, setupId, groupId, encoderId, 'channel'),
      number: getMemField(bytes, setupId, groupId, encoderId, 'number'),
      number_h: getMemField(bytes, setupId, groupId, encoderId, 'number_h'),
      lower: getMemField(bytes, setupId, groupId, encoderId, 'lower'),
      lower_msb: getMemField(bytes, setupId, groupId, encoderId, 'lower_msb'),
      upper: getMemField(bytes, setupId, groupId, encoderId, 'upper'),
      upper_msb: getMemField(bytes, setupId, groupId, encoderId, 'upper_msb'),
      mode: getMemField(bytes, setupId, groupId, encoderId, 'mode'),
      scale: getMemField(bytes, setupId, groupId, encoderId, 'scale'),
      pb_channel: getMemField(bytes, setupId, groupId, encoderId, 'pb_channel'),
      pb_display: getMemField(bytes, setupId, groupId, encoderId, 'pb_display'),
      pb_type: getMemField(bytes, setupId, groupId, encoderId, 'pb_type'),
      pb_mode: getMemField(bytes, setupId, groupId, encoderId, 'pb_mode'),
      pb_number: getMemField(bytes, setupId, groupId, encoderId, 'pb_number'),
      pb_lower: getMemField(bytes, setupId, groupId, encoderId, 'pb_lower'),
      pb_upper: getMemField(bytes, setupId, groupId, encoderId, 'pb_upper'),
    };
  }

  toBytes(buffer: Uint8Array<ArrayBufferLike>) {
    setMemField(buffer, this.setupId, this.groupId, this.id, 'name', this.name);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'type', this.numbers.type);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'channel', this.numbers.channel);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'number', this.numbers.number);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'number_h', this.numbers.number_h);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'lower', this.numbers.lower);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'lower_msb', this.numbers.lower_msb);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'upper', this.numbers.upper);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'upper_msb', this.numbers.upper_msb);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'mode', this.numbers.mode);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'scale', this.numbers.scale);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'link', this.link);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'pb_channel', this.numbers.pb_channel);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'pb_display', this.numbers.pb_display);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'pb_type', this.numbers.pb_type);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'pb_mode', this.numbers.pb_mode);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'pb_number', this.numbers.pb_number);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'pb_lower', this.numbers.pb_lower);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'pb_upper', this.numbers.pb_upper);
    setMemField(buffer, this.setupId, this.groupId, this.id, 'pb_link', this.pb_link);
  }

  clone(setupId?: number, groupId?: number, controlId?: number): Control {
    const c = new Control(
      this.name,
      controlId ?? this.id,
      groupId ?? this.groupId,
      setupId ?? this.setupId,
    );

    return Object.assign(c, { ...this, id: c.id, setupId: c.setupId, groupId: c.groupId });
  }
}
