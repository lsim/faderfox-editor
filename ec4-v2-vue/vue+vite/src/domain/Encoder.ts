export type FieldType =
  | 'channel'
  | 'address'
  | 'number_value'
  | 'lower_limit'
  | 'upper_limit'
  | 'mode'
  | 'type'
  | 'scale' /* display */
  | null;

export type EncoderType =
  | 'CCR1'
  | 'CCR2'
  | 'CCab'
  | 'PrgC'
  | 'CCAh'
  | 'PBnd'
  | 'AftT'
  | 'Note'
  | 'NRPN';

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
  scale: string;
  // The type (cc, nrpn, note, etc)
  type: EncoderType;
  // Whether the encoder is linked to the next encoder
  link: boolean;
  // pb_channel: number;
  // pb_display: string;
  // pb_type: string;
  // pb_mode: string;
  // pb_number: number;
  // pb_lower: number;
  // pb_upper: number;
  // pb_link: boolean;

  constructor(id: string) {
    this.id = id;
    this.name = `EC${id}`;
    this.channel = 0;
    this.number = 0;
    this.number_h = 0;
    this.lower = 0;
    this.upper = 0;
    this.mode = 'div. by 8';
    this.scale = 'display off';
    // this.type = 'CC rel. 1';
    this.type = 'NRPN';
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
  constructor(id: string) {
    super(id);
    this.name = `PB${id}`;
    this.channel = 0;
    this.scale = 'Off';
    this.type = 'Note';
    this.mode = 'Key';
    this.number = 0;
    this.lower = 0;
    this.upper = 0;
    this.link = false;
  }
}
