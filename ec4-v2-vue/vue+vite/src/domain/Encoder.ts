export type FieldType =
  | 'channel'
  | 'number'
  | 'number_value'
  | 'lower_limit'
  | 'upper_limit'
  | 'mode'
  | 'type'
  | 'scale' /* display */
  | null;

export type EncoderType = (typeof encoderTypes)[number]['short'];

export const encoderTypes = [
  { text: 'CC rel. 1', short: 'CCR1', value: 1 },
  { text: 'CC rel. 2', short: 'CCR2', value: 2 },
  { text: 'CC absolute', short: 'CCab', value: 3 },
  { text: 'Program change', short: 'PrgC', value: 4 },
  { text: 'CC 14bit absolute', short: 'CCAh', value: 5 },
  { text: 'Pitch bend', short: 'PBnd', value: 6 },
  { text: 'Aftertouch', short: 'AftT', value: 7 },
  { text: 'Note', short: 'Note', value: 8 },
  { text: 'NRPN', short: 'NRPN', value: 9 },
];

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

export const pushButtonScaleOptions: ScaleOption[] = [
  { text: 'display off', short: 'off', value: 0 },
  { text: 'display on', short: 'on', value: 1 },
];

export class EncoderGroup {
  id: string;
  name: string;
  encoders: Encoder[];
  pushButtons: PushButton[];

  constructor(id: string, name: string, encoders: Encoder[], pushButtons: PushButton[]) {
    this.id = id;
    this.name = name;
    this.encoders = encoders;
    this.pushButtons = pushButtons;
  }
}

export class Encoder {
  id: string;
  groupId: string;
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
  mode: string;
  // The display/range of the encoder
  scale: number;
  // The type (cc, nrpn, note, etc)
  type: EncoderType;
  // Whether the encoder is linked to the next encoder
  link: boolean;

  constructor(id: string, groupId: string, type?: EncoderType, mode?: string) {
    this.id = id;
    this.groupId = groupId;
    this.name = id;
    this.channel = 0;
    this.number = 0;
    this.number_h = 0;
    this.lower = 0;
    this.upper = 0;
    this.mode = mode || 'div. by 8';
    this.scale = 1;
    // this.type = 'CC rel. 1';
    this.type = type || 'CCab';
    this.link = false;
    // this.pb_channel = 0;
    // this.pb_display = 'Off';
    // this.pb_type = 'Off';
    // this.pb_mode = 'Key';
    // this.pb_number = 0;
    // this.pb_lower = 0;
    // this.pb_upper = 0;
    // this.pb_link = false;
  }
}

export class PushButton extends Encoder {
  constructor(id: string, groupId: string) {
    super(id, groupId, 'Note', 'Key');
  }
}
