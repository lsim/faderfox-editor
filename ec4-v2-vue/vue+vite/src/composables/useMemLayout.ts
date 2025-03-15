const STR = { sysex: {} as any };

// Constants for the EC4 memory layout
const deviceId = 0x0b;
const maxFileSize = 183710;

// export const MEM = {
//   data: new Uint8Array(50240),
//   lengthGroup: 192,
//   lengthSetup: 192 * 16,
//   dataOffset: 0x1bc0,
//   addrSetupNames: 0,
//   addrGroupNames: 0x1c00 - 0x1bc0,
//   addrPresets: 0x2000 - 0x1bc0,
//   clipboardDataGroup: null,
//   clipboardDataSetup: {
//     groupNames: undefined,
//     setupData: undefined,
//   },
// };

export const MEMORY_SIZE = 0xf500;
export const MEMORY_OFFSET = 0x0b00;

export const MEM = {
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

//
// const FACTORY_PRESET_PATH = 'EC4-setup-all-factory-V20.syx';
//
function toHex(d: number, pad?: number) {
  return ('0000' + Number(d).toString(16)).slice(pad ? -pad : -2).toUpperCase();
}
// // function toBinary(d: number, pad?: number) {
// //   return ('0000000000000000' + Number(d).toString(2)).slice(pad ? -pad : -2).toUpperCase();
// // }
//
// // const PADDING = new Array(30).fill(0);
//
export type Chunk = {
  cmd: number;
  val: number;
  raw: number[];
};
//
// let isDirty = false;
//
// const P = {
//   // P is short for Parameter
//   type: 'type',
//   channel: 'channel',
//   number: 'number',
//   number_h: 'number_h',
//   lower: 'lower',
//   upper: 'upper',
//   lower_msb: 'lower_msb',
//   upper_msb: 'upper_msb',
//   mode: 'mode',
//   scale: 'scale',
//   name: 'name',
//   link: 'link',
//   pb_channel: 'pb_channel',
//   pb_display: 'pb_display',
//   pb_type: 'pb_type',
//   pb_mode: 'pb_mode',
//   pb_number: 'pb_number',
//   pb_lower: 'pb_lower',
//   pb_upper: 'pb_upper',
//   pb_link: 'pb_link',
//
//   labels: {
//     type: 'Type',
//     channel: 'Channel',
//     number: 'Number',
//     number_note: 'Numb/Note',
//     number_h: 'MSB',
//     number_nrpn: '#MSB/LSB',
//     lower: 'Lower',
//     upper: 'Upper',
//     mode: 'Mode',
//     scale: 'Display',
//     pb_channel: 'Channel',
//     pb_display: 'Display',
//     pb_type: 'Type',
//     pb_mode: 'Mode',
//     pb_number: 'Number',
//     pb_lower: 'Lower',
//     pb_upper: 'Upper',
//   },
//
//   _dataFormat: {
//     type: { pos: 0, mask: 0xf0, lsb: 4, min: 0, max: 8, default: 2 },
//     channel: { pos: 0, mask: 0x0f },
//     number: { pos: 16, mask: 0x7f },
//     number_h: { pos: 32, mask: 0xff },
//     link: {
//       pos: 16,
//       mask: 0x80,
//       lsb: 7,
//     },
//     lower: { pos: 48, mask: 0xff },
//     upper: { pos: 64, mask: 0xff },
//     lower_msb: { pos: 96, mask: 0x0f },
//     upper_msb: { pos: 96, mask: 0xf0, lsb: 4 },
//     mode: {
//       pos: 80,
//       mask: 0xf0,
//       lsb: 4,
//       min: 0,
//       max: 9,
//       default: 3,
//     },
//     scale: {
//       pos: 80,
//       mask: 0x0f,
//       min: 0,
//       max: 8,
//       default: 1,
//     },
//     name: { pos: 128 },
//     pb_mode: {
//       pos: 0,
//       mask: 0x80,
//       lsb: 7,
//       memstart: MEM.addrKey1,
//       grouplen: MEM.lengthGroupKey1,
//     },
//     pb_number: {
//       pos: 0,
//       mask: 0x7f,
//       memstart: MEM.addrKey1,
//       grouplen: MEM.lengthGroupKey1,
//     },
//     pb_type: {
//       pos: 112,
//       mask: 0xf0,
//       lsb: 4,
//     },
//     pb_channel: {
//       pos: 112,
//       mask: 0x0f,
//     },
//     pb_display: {
//       memstart: MEM.addrKey2,
//       pos: 0,
//       grouplen: MEM.lengthGroupKey2,
//       mask: 0x80,
//       lsb: 7,
//     },
//     pb_lower: {
//       memstart: MEM.addrKey2,
//       pos: 0,
//       mask: 0x7f,
//       grouplen: MEM.lengthGroupKey2,
//     },
//     pb_link: {
//       memstart: MEM.addrKey2,
//       pos: 16,
//       grouplen: MEM.lengthGroupKey2,
//       mask: 0x80,
//       lsb: 7,
//     },
//     pb_upper: {
//       memstart: MEM.addrKey2,
//       pos: 16,
//       mask: 0x7f,
//       grouplen: 32,
//     },
//   },
//
//   _getMemAddr: function (spec, selection) {
//     let startAddr = 'memstart' in spec ? spec.memstart : MEM.addrPresets;
//     let lengthGroup = 'grouplen' in spec ? spec.grouplen : MEM.lengthGroup;
//     return startAddr + (selection.setup * 16 + selection.group) * lengthGroup + spec.pos;
//   },
//
//   get: function (selection, encoder, type) {
//     if (type === 'select-encoder') {
//       return;
//     }
//
//     const spec = P._dataFormat[type];
//     if (!spec) {
//       console.log('Get unknown parameter type: ' + type);
//       return;
//     }
//     let addr = P._getMemAddr(spec, selection);
//     // MEM.addrPresets + (setup * 16 + group) * MEM.lengthGroup + spec.pos;
//
//     if (type === P.name) {
//       addr += encoder * 4;
//       return P.stringFromPosition(MEM.data, addr);
//     } else {
//       addr += encoder;
//       const shift = spec.lsb || 0;
//       if (spec.mask != 0xff) {
//         let val = MEM.data[addr] & spec.mask;
//         val = val >> shift;
//         if (spec.hasOwnProperty('min')) {
//           if (val < spec.min || val > spec.max) {
//             val = spec.default;
//           }
//         }
//         if (type === P.channel || type === P.pb_channel) val++;
//         return val;
//       } else {
//         return MEM.data[addr];
//       }
//     }
//   },
//   set: function (selection, encoder, type, value) {
//     const spec = P._dataFormat[type];
//     if (!spec) {
//       console.log('Set unknown parameter type: ' + type);
//       return;
//     }
//     let addr = P._getMemAddr(spec, selection);
//     // MEM.addrPresets + (setup * 16 + group) * MEM.lengthGroup + spec.pos;
//     if (type === P.name) {
//       addr += encoder * 4;
//       while (value.length < 4) {
//         value += ' ';
//       }
//       for (let i = 0; i < 4; i++) {
//         const oldValue = MEM.data[addr + i];
//         MEM.data[addr + i] = value.charCodeAt(i);
//         isDirty = isDirty | (MEM.data[addr + i] != oldValue);
//       }
//     } else {
//       addr += encoder;
//       const oldValue = MEM.data[addr];
//       value = parseInt(value);
//       if (type === P.channel || type === P.pb_channel) value--;
//       const shift = spec.lsb || 0;
//       if (spec.mask != 0xff) {
//         const invMask = 0xff ^ spec.mask;
//         value = (value & (spec.mask >> shift)) << shift;
//         MEM.data[addr] = (MEM.data[addr] & invMask) | value;
//       } else {
//         value = value & 0xff; // ensure 8 bit
//         MEM.data[addr] = value;
//       }
//       isDirty = isDirty | (MEM.data[addr] != oldValue);
//     }
//   },
//   setSetupName: function (setupNumber, name) {
//     while (name.length < 4) {
//       name += ' ';
//     }
//     const addr = MEM.addrSetupNames + setupNumber * 4;
//     for (let i = 0; i < 4; i++) {
//       MEM.data[addr + i] = name.charCodeAt(i);
//     }
//   },
//   setGroupName: function (setupNumber, groupNumber, name) {
//     while (name.length < 4) {
//       name += ' ';
//     }
//     const addr = MEM.addrGroupNames + setupNumber * 64 + groupNumber * 4;
//     for (let i = 0; i < 4; i++) {
//       MEM.data[addr + i] = name.charCodeAt(i);
//     }
//   },
//   getGroupName: function (setupNumber, groupNumber) {
//     return P.stringFromPosition(MEM.data, MEM.addrGroupNames + setupNumber * 64 + groupNumber * 4);
//   },
//   getSetupName: function (setupNumber) {
//     return P.stringFromPosition(MEM.data, MEM.addrSetupNames + setupNumber * 4);
//   },
//   stringFromPosition: function (data, position) {
//     const characters = data.subarray(position, position + 4);
//     return String.fromCharCode(...characters);
//   },
// };
//
export function parseSysexData(
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
            console.debug('emitPage', ix, pageNumber);
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
//
// export default function useMemLayout() {
//   return {
//     parseSysexData,
//   };
// }
