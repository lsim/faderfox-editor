import { type FieldType } from '@/domain/Encoder.ts';
import { EncoderSetup } from '@/domain/EncoderSetup.ts';
import { generateIds } from '@/stores/faderfox-ec4.ts';

const STR = { sysex: {} as any };

// Constants for the EC4 memory layout
const deviceId = 0x0b;
const maxFileSize = 183710;

const MEMORY_SIZE = 0xf500;
const MEMORY_OFFSET = 0x0b00;

const MEM = {
  data: new Uint8Array(MEMORY_SIZE),
  lengthGroup: 192,
  lengthSetup: 192 * 16,
  dataOffset: 0x1bc0,
  lengthGroupKey1: 16,
  lengthGroupKey2: 32,
  lengthSetupKey1: 16 * 16,
  lengthSetupKey2: 32 * 16,
  addrKey1: 0x0b00 - MEMORY_OFFSET,
  addrSetupNames: 0x1bc0 - MEMORY_OFFSET,
  addrGroupNames: 0x1c00 - MEMORY_OFFSET,
  addrPresets: 0x2000 - MEMORY_OFFSET,
  addrKey2: 0xe000 - MEMORY_OFFSET,
  clipboardDataGroup: null,
  clipboardDataSetup: {
    groupNames: undefined,
    setupData: undefined,
  },
};

const FACTORY_PRESET_PATH = 'EC4-setup-all-factory-V20.syx';

function toHex(d: number, pad?: number) {
  return ('0000' + Number(d).toString(16)).slice(pad ? -pad : -2).toUpperCase();
}
// // function toBinary(d: number, pad?: number) {
// //   return ('0000000000000000' + Number(d).toString(2)).slice(pad ? -pad : -2).toUpperCase();
// // }
//
// // const PADDING = new Array(30).fill(0);
//
type Chunk = {
  cmd: number;
  val: number;
  raw: number[];
};

function parseSysexData(
  data: Uint8Array<ArrayBufferLike>,
  emitChunk: (c: Chunk) => void,
  emitPage: (n: number, d: Uint8Array) => void,
) {
  if (data.length < 4) {
    throw new Error(STR.sysex.error_data_empty);
  }
  if (data[0] !== 0xf0) {
    throw new Error(STR.sysex.error_no_sysex_data);
  }
  if (data[1] + data[2] + data[3] != 0) {
    // hard coded manufacturer id 0,0,0
    throw new Error(STR.sysex.error_wrong_manufacturer);
  }
  let ix = 4; // start after sysex header
  function nextChunk(): Chunk {
    // console.debug('nextChunk', ix, data.length);
    if (ix > data.length - 1 - 3) {
      throw new Error(STR.sysex.error_data_incomplete);
    }
    while (data[ix] == 0) {
      ix++;
    } // eat up padding zeros
    const result = {
      cmd: data[ix],
      val: 16 * (data[ix + 1] & 0xf) + (data[ix + 2] & 0xf),
      raw: [data[ix + 1], data[ix + 2]],
    };
    ix += 3;
    return result;
  }

  let finished = false;
  let crcIn = 0;
  let crcCheck = 0;

  let pageData = new Uint8Array(64);
  let pageIndex = 0;
  let pageNumber = 0;
  let version = 0.0;

  while (!finished) {
    let c = nextChunk();
    switch (c.cmd) {
      case 0x41: // CMD_DOWNLOAD_START, device id
        if (c.val != deviceId) {
          throw new Error(STR.sysex.error_wrong_device);
        }
        break;
      case 0x42: // CMD_DOWNLOAD_TYPE, 1-3
        // console.log('CMD_DOWNLOAD_TYPE', toHex(c.val));
        if (c.val != 0x03) {
          throw new Error(STR.sysex.error_wrong_download);
        }
        break;
      case 0x43: // CMD_APP_ID_H
        console.log('CMD_APP_ID_H', toHex(c.val));
        version += c.val;
        break;
      case 0x44: // CMD_APP_ID_L
        console.log('CMD_APP_ID_L', toHex(c.val));
        version += c.val / 10;
        break;
      case 0x4b: // CMD_PAGE_CRC_H
        crcIn = 256 * c.val;
        break;
      case 0x4c: // CMD_PAGE_CRC_L
        crcIn += c.val;
        crcCheck = crcCheck & 0xffff;
        if (crcIn != crcCheck) {
          throw new Error(STR.sysex.error_checksum);
        } else {
          if (emitPage) {
            emitPage(pageNumber, pageData);
          }
          // start new page
          pageData = new Uint8Array(64);
          pageIndex = 0;
        }
        crcCheck = 0;
        break;
      case 0x49: // CMD_PAGE_NUM_H
        pageNumber = 256 * c.val;
        break;
      case 0x4a: // CMD_PAGE_NUM_L
        pageNumber += c.val;
        break;
      case 0x4d: // CMD_PAGE_DATA
        emitChunk(c);
        crcCheck += c.val;
        pageData[pageIndex] = c.val;
        pageIndex++;
        break;
      case 0x4f: // CMD_DOWNLOAD_STOP
        console.log('CMD_DOWNLOAD_STOP');
        finished = true;
        break;
      default:
        console.log('Unknown CMD', toHex(c.cmd), toHex(c.val));
        break;
    }
  }
  console.log('Data version: ', version);
  return version;
}

function prepareSysexBytes(sysexData: Uint8Array<ArrayBufferLike>) {
  const result = new Uint8Array(MEMORY_SIZE);
  const version = parseSysexData(
    sysexData,
    (chunk) => {},
    (addr, pageData) => {
      result.set(pageData, addr - MEMORY_OFFSET);
    },
  );
  return result;
}

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
  link: 'link',
  pb_channel: 'pb_channel',
  pb_display: 'pb_display',
  pb_type: 'pb_type',
  pb_mode: 'pb_mode',
  pb_number: 'pb_number',
  pb_lower: 'pb_lower',
  pb_upper: 'pb_upper',
  pb_link: 'pb_link',

  // labels: {
  //   type: 'Type',
  //   channel: 'Channel',
  //   number: 'Number',
  //   number_h: 'MSB',
  //   number_nrpn: '#MSB/LSB',
  //   lower: 'Lower',
  //   upper: 'Upper',
  //   mode: 'Mode',
  //   scale: 'Display',
  // },
  //
  _dataFormat: {
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
  } as Record<string, MemSpec>,

  _getMemAddr: function (spec: MemSpec, setupId: number, groupId: number) {
    let startAddr = 'memstart' in spec ? (spec.memstart ?? 0) : MEM.addrPresets;
    let lengthGroup = 'grouplen' in spec ? (spec.grouplen ?? 0) : MEM.lengthGroup;
    return startAddr + (setupId * 16 + groupId) * lengthGroup + spec.pos;
  },

  get: function <TRes>(
    data: Uint8Array<ArrayBufferLike>,
    setupId: number,
    groupId: number,
    encoderId: number,
    type: MemField,
  ): TRes {
    // if (type === 'select-encoder') {
    //   return;
    // }
    const spec = this._dataFormat[type];
    if (!spec) {
      console.log('Get unknown parameter type: ' + type);
      throw Error('Get unknown parameter type: ' + type);
    }
    let addr = this._getMemAddr(spec, setupId, groupId);
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
        if (type === P.channel || type === 'pb_channel') val++;
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
    type: MemField,
    value: number,
  ) {
    const spec = this._dataFormat[type];
    if (!spec) {
      console.log('Set unknown parameter type: ' + type);
      return;
    }
    let addr = MEM.addrPresets + (setupId * 16 + groupId) * MEM.lengthGroup + spec.pos;

    addr += encoderId;
    // const oldValue = data[addr];
    // value = parseInt(value);
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
  },
  setEncoderName: function (
    data: Uint8Array<ArrayBufferLike>,
    setupId: number,
    groupId: number,
    encoderId: number,
    name: string,
  ) {
    const spec = this._dataFormat['name'];
    let addr = MEM.addrPresets + (setupId * 16 + groupId) * MEM.lengthGroup + spec.pos;
    addr += encoderId * 4;
    while (name.length < 4) {
      name += ' ';
    }
    for (let i = 0; i < 4; i++) {
      // const oldValue = data[addr + i];
      data[addr + i] = name.charCodeAt(i);
      // isDirty = isDirty | (data[addr + i] != oldValue);
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

export function parseSetupsFromSysex(sysexData: Uint8Array<ArrayBufferLike>) {
  const preparedBytes = prepareSysexBytes(sysexData);
  return Array.from(generateIds()).map((setupId) => {
    return EncoderSetup.fromBytes(preparedBytes, setupId);
  });
}

export type MemField =
  | Exclude<FieldType, null>
  | 'lower_msb'
  | 'upper_msb'
  | 'pb_channel'
  | 'pb_display'
  | 'pb_type'
  | 'pb_mode'
  | 'pb_number'
  | 'pb_lower'
  | 'pb_upper'
  | 'pb_link';

function useHighres(
  data: Uint8Array<ArrayBufferLike>,
  setupId: number,
  groupId: number,
  encoderId: number,
) {
  const enc_type = P.get<number>(data, setupId, groupId, encoderId, 'type');
  const enc_disp = P.get<number>(data, setupId, groupId, encoderId, 'scale');
  return (
    (enc_type == 4 || enc_type == 5 || enc_type == 8) &&
    (enc_disp == 0 || enc_disp == 3 || enc_disp == 6 || enc_disp == 8)
  );
}

export function getMemField(
  data: Uint8Array<ArrayBufferLike>,
  setupId: number,
  groupId: number,
  encoderId: number,
  type: Exclude<MemField, 'name'>,
): number {
  let value = P.get<number>(data, setupId, groupId, encoderId, type);
  if (type === 'lower' || type === 'upper') {
    if (useHighres(data, setupId, groupId, encoderId)) {
      if (type == 'lower') {
        value += P.get<number>(data, setupId, groupId, encoderId, 'lower_msb') << 8;
      } else {
        value += P.get<number>(data, setupId, groupId, encoderId, 'upper_msb') << 8;
      }
      if (value > 4094) {
        value = 16383;
      }
    } else {
      value = P.get<number>(data, setupId, groupId, encoderId, type) & 0x7f;
    }
  }

  return value;
}

export function setMemField<TVal = number | string>(
  data: Uint8Array<ArrayBufferLike>,
  setupId: number,
  groupId: number,
  encoderId: number,
  type: MemField,
  value: TVal,
) {
  if (type === 'name') P.setEncoderName(data, setupId, groupId, encoderId, value as string);
  else P.set(data, setupId, groupId, encoderId, type, value as number);
}

export function getEncoderName(
  data: Uint8Array<ArrayBufferLike>,
  setupId: number,
  groupId: number,
  encoderId: number,
): string {
  return P.get<string>(data, setupId, groupId, encoderId, 'name');
}

export function getSetupName(data: Uint8Array<ArrayBufferLike>, setupId: number) {
  return P.getSetupName(data, setupId);
}

export function setSetupName(data: Uint8Array<ArrayBufferLike>, setupId: number, name: string) {
  P.setSetupName(data, setupId, name);
}

export function getGroupName(data: Uint8Array<ArrayBufferLike>, setupId: number, groupId: number) {
  return P.getGroupName(data, setupId, groupId);
}

export function setGroupName(
  data: Uint8Array<ArrayBufferLike>,
  setupId: number,
  groupId: number,
  name: string,
) {
  P.setGroupName(data, setupId, groupId, name);
}
