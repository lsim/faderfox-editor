// /*
//
// function Sysex(deviceConfig) {
//   this.deviceId = deviceConfig.deviceId;
//   this.maxFileSize = deviceConfig.maxFileSize;
// }
//
// Sysex.PADDING = new Array(30).fill(0);
//
// Sysex.prototype.parseSysexData = function (data, dataCb, pageCb) {
//   if (data.length < 4) {
//     throw new Error(STR.sysex.error_data_empty);
//   }
//   if (data[0] !== 0xf0) {
//     throw new Error(STR.sysex.error_no_sysex_data);
//   }
//   if (data[1] + data[2] + data[3] != 0) {
//     // hard coded manufacturer id 0,0,0
//     throw new Error(STR.sysex.error_wrong_manufacturer);
//   }
//   let ix = 4; // start after sysex header
//   function nextChunk() {
//     if (ix > data.length - 1 - 3) {
//       throw new Error(STR.sysex.error_data_incomplete);
//     }
//     while (data[ix] == 0) {
//       ix++;
//     } // eat up padding zeros
//     let result = {
//       cmd: data[ix],
//       val: 16 * (data[ix + 1] & 0xf) + (data[ix + 2] & 0xf),
//       raw: [data[ix + 1], data[ix + 2]],
//     };
//     ix += 3;
//     return result;
//   }
//
//   let finished = false;
//   let crcIn = 0;
//   let crcCheck = 0;
//
//   let pageData = new Uint8Array(64);
//   let pageIndex = 0;
//   let pageNumber = 0;
//   let version = 0.0;
//
//   while (!finished) {
//     let c = nextChunk();
//     switch (c.cmd) {
//       case 0x41: // CMD_DOWNLOAD_START, device id
//         if (c.val != this.deviceId) {
//           throw new Error(STR.sysex.error_wrong_device);
//         }
//         break;
//       case 0x42: // CMD_DOWNLOAD_TYPE, 1-3
//         // console.log('CMD_DOWNLOAD_TYPE', toHex(c.val));
//         if (c.val != 0x03) {
//           throw new Error(STR.sysex.error_wrong_download);
//         }
//         break;
//       case 0x43: // CMD_APP_ID_H
//         console.log('CMD_APP_ID_H', toHex(c.val));
//         version += c.val;
//         break;
//       case 0x44: // CMD_APP_ID_L
//         console.log('CMD_APP_ID_L', toHex(c.val));
//         version += c.val / 10;
//         break;
//       case 0x4b: // CMD_PAGE_CRC_H
//         crcIn = 256 * c.val;
//         break;
//       case 0x4c: // CMD_PAGE_CRC_L
//         crcIn += c.val;
//         crcCheck = crcCheck & 0xffff;
//         if (crcIn != crcCheck) {
//           throw new Error(STR.sysex.error_checksum);
//         } else {
//           if (pageCb) {
//             pageCb(pageNumber, pageData);
//           }
//           // start new page
//           pageData = new Uint8Array(64);
//           pageIndex = 0;
//         }
//         crcCheck = 0;
//         break;
//       case 0x49: // CMD_PAGE_NUM_H
//         pageNumber = 256 * c.val;
//         break;
//       case 0x4a: // CMD_PAGE_NUM_L
//         pageNumber += c.val;
//         break;
//       case 0x4d: // CMD_PAGE_DATA
//         dataCb(c);
//         crcCheck += c.val;
//         pageData[pageIndex] = c.val;
//         pageIndex++;
//         break;
//       case 0x4f: // CMD_DOWNLOAD_STOP
//         console.log('CMD_DOWNLOAD_STOP');
//         finished = true;
//         break;
//       default:
//         console.log('Unknown CMD', toHex(c.cmd), toHex(c.val));
//         break;
//     }
//   }
//   console.log('Data version: ', version);
//   return version;
// };
//
//
// // Returns two sysex bytes for a 8 bit value in [0x20 | high nibble, 0x10 | low nibble ] representation
// // @param {number}
//
// Sysex.prototype.hiloNibbles = function (v) {
//   let hi = ((v & 0xf0) >> 4) + 0x20;
//   let lo = (v & 0x0f) + 0x10;
//   return [hi, lo];
// };
//
// Sysex.prototype.readFile = function (fileelement, dataHandler) {
//   let files = fileelement.files;
//   if (typeof files === 'undefined' || files.length == 0) {
//     MBox.show(STR.sysex.title_error, STR.sysex.error_nofile, { type: 'error' });
//     return;
//   }
//   let file = files[0];
//   if (file.size > this.maxFileSize) {
//     MBox.show(STR.sysex.title_error, STR.sysex.error_toobig, { type: 'error' });
//     return;
//   }
//   let sysex = this;
//   let reader = new FileReader();
//   reader.onloadend = function (evt) {
//     if (evt.target.readyState == FileReader.DONE) {
//       let data = new Uint8Array(evt.target.result);
//       try {
//         dataHandler(data);
//       } catch (e) {
//         MBox.show(STR.sysex.title_error, e.message, { type: 'error' });
//       }
//     }
//   };
//   reader.readAsArrayBuffer(file);
// };
//
//
//  */
//
// export class Sysex {
//   constructor(deviceConfig) {
//     this.deviceId = deviceConfig.deviceId;
//     this.maxFileSize = deviceConfig.maxFileSize;
//   }
//
//   parseSysexData(data: Uint8Array<ArrayBufferLike>, dataCb, pageCb) {
//     if (data.length < 4) {
//       throw new Error(STR.sysex.error_data_empty);
//     }
//     if (data[0] !== 0xf0) {
//       throw new Error(STR.sysex.error_data_missing_start);
//     }
//     if (data[data.length - 1] !== 0xf7) {
//       throw new Error(STR.sysex.error_data_missing_end);
//     }
//
//     const deviceId = data[1];
//     const command = data[2];
//     const dataLength = data[3];
//
//     let offset = 4;
//     let page = 0;
//     let pageData = [];
//     while (offset < data.length) {
//       if (data[offset] === 0xf7) {
//         pageCb(page, pageData);
//         pageData = [];
//         page++;
//         offset++;
//       } else {
//         pageData.push(data[offset]);
//         offset++;
//       }
//     }
//   }
// }
//
// export function useSysex() {
//   const sysex = new Sysex({ deviceId: 0x0b, maxFileSize: 229340 });
//
//   function generateSysexData() {
//     const deviceparts = sysex.hiloNibbles(sysex.deviceId);
//     let dataout = [
//       0xf0,
//       0x00,
//       0x00,
//       0x00,
//       0x41,
//       deviceparts[0],
//       deviceparts[1],
//       0x42,
//       0x20,
//       0x13,
//       0x43, // CMD_APP_ID_H
//       0x20,
//       0x12,
//       0x44, // CMD_APP_ID_L
//       0x20,
//       0x14,
//     ];
//     const pages = MEM.data.length / 64;
//     for (let page = 0; page < pages; page++) {
//       const pos = page * 64;
//       const addr = pos + MEMORY_OFFSET;
//       dataout.push(0x49, ...sysex.hiloNibbles(addr >> 8));
//       dataout.push(0x4a, ...sysex.hiloNibbles(addr & 0xff));
//       let crc = 0;
//       for (let i = 0; i < 64; i++) {
//         dataout.push(0x4d, ...sysex.hiloNibbles(MEM.data[pos + i]));
//         crc += MEM.data[pos + i];
//       }
//       crc = crc & 0xffff;
//       dataout.push(0x4b, ...sysex.hiloNibbles((crc & 0xff00) >> 8)); // CRC high
//       dataout.push(0x4c, ...sysex.hiloNibbles(crc & 0x00ff)); // CRC low
//       dataout.push(...Sysex.PADDING);
//     }
//     dataout.push(0x4f); // download stop
//     dataout.push(...deviceparts);
//     dataout.push(0xf7);
//     return new Uint8Array(dataout);
//   }
//
//   function parseSysex(sysexdata) {
//     const result = new Uint8Array(MEMORY_SIZE);
//     const version = sysex.parseSysexData(
//       sysexdata,
//       (chunk) => {},
//       (addr, pagedata) => {
//         result.set(pagedata, addr - MEMORY_OFFSET);
//         // console.log(addr - MEMORY_OFFSET, pagedata);
//       },
//     );
//     if (version < 2) {
//       // convert version 1.x data
//       for (let s = 0; s < 16; s++) {
//         for (let g = 0; g < 16; g++) {
//           for (let e = 0; e < 16; e++) {
//             let addr = P._getMemAddr(P._dataFormat[P.mode], { setup: s, group: g }) + e;
//             let converted = (((result[addr] & 0xc0) >> 6) + 3) << 4;
//             result[addr] = (result[addr] & 0x3f) + converted;
//             addr = P._getMemAddr(P._dataFormat[P.pb_upper], { setup: s, group: g }) + e;
//             result[addr] = result[addr] + 0x7f;
//           }
//         }
//       }
//     }
//
//     return result;
//   }
//
//   function loadSysexData(data, force) {
//     if (force) {
//       MEM.data.fill(0);
//       parseSysex(data).map((v, i) => (MEM.data[i] = v));
//       updateDisplayValues();
//       isDirty = false;
//     } else {
//       showMerge(parseSysex(data)).then((v) => {
//         updateDisplayValues();
//       });
//     }
//   }
//
//   function sysexHandler(data) {
//     if (data.length > 100 /* arbitrary number */) {
//       const version = sysex.parseSysexData(
//         data,
//         (c) => {},
//         (a, p) => {},
//       );
//       if (version < 2) {
//         MBox.show(SEC4.title_data_received, SEC4.msg_old_firmware_data, { type: 'error' });
//       } else {
//         if (SYSEX_BACKUP_MODE) {
//           const now = new Date();
//           function twoDigits(v) {
//             return v < 10 ? `0${v}` : String(v);
//           }
//           let filename = `EC4-backup-${now.getFullYear()}-${twoDigits(
//             now.getMonth() + 1,
//           )}-${twoDigits(now.getDate())}-${twoDigits(
//             now.getHours(),
//           )}-${twoDigits(now.getMinutes())}.syx`;
//           download(data, filename, 'application/octet-stream');
//           SYSEX_BACKUP_MODE = false;
//           sendData();
//         } else {
//           try {
//             loadSysexData(data);
//           } catch (e) {
//             MBox.show(SEC4.title_data_received, STR.apply(SEC4.$msg_invalid_data, e.message), {
//               hideAfter: 10000,
//               type: 'error',
//             });
//           }
//         }
//       }
//     } else {
//       console.log('Ignoring sysex data due to length', data);
//     }
//   }
//
//   const midi = new MIDI('Faderfox EC4', sysexHandler, (midiavailable, message) => {
//     if (midiavailable) {
//       MBox.show(SEC4.welcome_title, SEC4.welcome_text);
//     } else {
//       MBox.show(STR.midictrl.title_error, message, { type: 'error' });
//     }
//   });
//
//   function sendData() {
//     MBox.show(SEC4.title_send, SEC4.msg_send, {
//       buttonLabel: 'Send',
//       confirmCallback: function () {
//         MBox.hide();
//         let data = generateSysexData();
//         midi.sendSysex(data, 90 * 1000);
//       },
//     });
//   }
//
//   DOM.on('#btntransfer', 'click', function () {
//     if (midi.hasOutput()) {
//       SYSEX_BACKUP_MODE = true;
//       MBox.show(SEC4.title_send, SEC4.warning_send, {
//         buttonLabel: SEC4.continue_without_backup,
//         confirmCallback: function () {
//           SYSEX_BACKUP_MODE = false;
//           MBox.hide();
//           sendData();
//         },
//         cancelCallback: function () {
//           SYSEX_BACKUP_MODE = false;
//         },
//       });
//     } else {
//       MBox.show(STR.midictrl.title_error, STR.midictrl.nooutputs, {
//         type: 'error',
//       });
//     }
//   });
//   DOM.on('#btnreceive', 'click', function () {
//     if (midi.hasInput()) {
//       MBox.show(SEC4.title_receive, SEC4.msg_receive);
//     } else {
//       MBox.show(STR.midictrl.title_error, STR.midictrl.noinputs, {
//         type: 'error',
//       });
//     }
//   });
//
//   DOM.on('#btnfilesave', 'click', function () {
//     MBox.show(
//       SEC4.title_save,
//       SEC4.msg_save +
//         '<br/><br/><div class="field"><label>Filename:</label><input name="filename" type="text" size="12" value="" placeholder="filename" /><b>.syx</b></div>',
//       {
//         buttonLabel: 'Save File',
//         confirmCallback: function () {
//           let filename = DOM.element('#mbox input[name=filename]').value;
//           if (filename && filename !== '') {
//             download(generateSysexData(), filename + '.syx', 'application/octet-stream');
//           }
//           MBox.hide();
//         },
//       },
//     );
//   });
// }
