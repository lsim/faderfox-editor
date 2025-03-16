import { ref } from 'vue';

/**
 * Web MIDI interface handler
 * @param {string} deviceName
 * @param {function} sysexMessageHandler
 */
// function MIDI(deviceName, sysexMessageHandler, completeHandler) {
//   console.log('MIDI: Initializing...');
//   const self = this;
//   self.midiAccess = null;
//   self.deviceIdIn = null;
//   self.deviceIdOut = null;
//   self.knownInputIds = {};
//   self.knownOutputIds = {};
//   let select_in = DOM.element('#midiInDeviceId');
//   let select_out = DOM.element('#midiOutDeviceId');
//   const optionNoDevice = '<option value="">(No devices)</option>';
//   const knownPorts = {};
//
//   let trueReported = false;
//
//   const reportStatus = function (available, msg) {
//     if (completeHandler) {
//       if ((available && !trueReported) || !available) {
//         trueReported = available;
//         completeHandler(available, msg);
//       }
//     } else {
//       if (available) {
//         MBox.hide();
//       } else {
//         MBox.show(STR.midictrl.title_error, msg, { type: 'error' });
//       }
//     }
//   };
//
//   const onMIDISuccess = function (midiAccess) {
//     console.log('MIDI ready!');
//     self.midiAccess = midiAccess;
//     listInputsAndOutputs();
//     selectDevices();
//     self.midiAccess.onstatechange = onStateChange;
//   };
//   const onMIDIFailure = function (msg) {
//     console.log('MIDI: Failed to get MIDI access - ' + msg);
//     reportStatus(false, STR.midictrl.nomidi);
//   };
//   const onStateChange = function (e) {
//     const port = e.port;
//     const state = e.port.state;
//     if (state === 'disconnected') {
//       knownPorts[port.id] = false;
//       listInputsAndOutputs();
//       selectDevices();
//     } else if (state === 'connected') {
//       if (!knownPorts[port.id]) {
//         listInputsAndOutputs();
//         selectDevices();
//       }
//     }
//   };
//   const listInputsAndOutputs = function () {
//     let selectedIn = null;
//     let selectedOut = null;
//     let countIn = 0;
//     let countOut = 0;
//     DOM.empty(select_in);
//     for (let entry of self.midiAccess.inputs) {
//       let input = entry[1];
//       if (!knownPorts[input.id]) {
//         console.log('MIDI: Input device', input.name, input.manufacturer, input.state);
//       }
//       knownPorts[input.id] = true;
//       if (input.name === deviceName) {
//         selectedIn = input.id;
//         console.log('MIDI: Selected input:', input.name, input.manufacturer, input.state);
//       }
//       DOM.addHTML(select_in, 'beforeend', `<option value="${input.id}">${input.name}</option>`);
//       countIn++;
//     }
//     DOM.empty(select_out);
//     for (let entry of self.midiAccess.outputs) {
//       let output = entry[1];
//       if (!knownPorts[output.id]) {
//         console.log('MIDI: Output device', output.name, output.manufacturer, output.state);
//       }
//       knownPorts[output.id] = true;
//       if (output.name === deviceName) {
//         selectedOut = output.id;
//         console.log('MIDI: Selected output', output.name, output.manufacturer, output.state);
//       }
//       DOM.addHTML(select_out, 'beforeend', `<option value="${output.id}">${output.name}</option>`);
//       countOut++;
//     }
//     if (selectedIn) {
//       select_in.value = selectedIn;
//     }
//     if (selectedOut) {
//       select_out.value = selectedOut;
//     }
//     console.log('MIDI: ', countIn, 'inputs,', countOut, 'outputs');
//     if (countIn == 0 || countOut == 0) {
//       let message;
//       if (countIn > 0 && countOut == 0) {
//         message = STR.midictrl.nooutputs;
//         DOM.addHTML(select_out, 'beforeend', optionNoDevice);
//       } else if (countIn == 0 && countOut > 0) {
//         message = STR.midictrl.noinputs;
//         DOM.addHTML(select_in, 'beforeend', optionNoDevice);
//       } else {
//         message = STR.midictrl.nodevices;
//         DOM.addHTML(select_out, 'beforeend', optionNoDevice);
//         DOM.addHTML(select_in, 'beforeend', optionNoDevice);
//       }
//       reportStatus(false, STR.apply(STR.midictrl.$error_hint, message, deviceName));
//     } else {
//       reportStatus(true);
//     }
//   };
//   function onMIDIMessage(event) {
//     if (event.data && event.data.length > 4) {
//       if (event.data[0] == 0xf0 && event.data[event.data.length - 1] == 0xf7) {
//         console.log('MIDI: Sysex received', event);
//         if (sysexMessageHandler) {
//           sysexMessageHandler(event.data);
//         }
//       }
//     }
//   }
//   function selectDevices() {
//     self.deviceIdIn = DOM.find(select_in, 'option:checked')[0].value;
//     self.deviceIdOut = DOM.find(select_out, 'option:checked')[0].value;
//     self.deviceIn = self.midiAccess.inputs.get(self.deviceIdIn);
//     self.deviceOut = self.midiAccess.outputs.get(self.deviceIdOut);
//     if (self.deviceIn) {
//       self.midiAccess.inputs.forEach(function (entry) {
//         entry.onmidimessage = undefined;
//       });
//       self.deviceIn.onmidimessage = onMIDIMessage;
//     } else {
//       console.log('MIDI: No input device selected!');
//     }
//   }
//   // go ahead, start midi
//   let list = [select_in, select_out];
//   list.forEach(function (el) {
//     el.addEventListener('change', selectDevices);
//   });
//   if ('function' === typeof window.navigator.requestMIDIAccess) {
//     console.log('MIDI: System has MIDI support.');
//     if (navigator.userAgent.includes('Firefox/')) {
//       console.log('MIDI: Detected Firefox, MIDI unreliable - not initializing');
//       reportStatus(false, STR.midictrl.nomidisupport);
//     } else {
//       navigator.requestMIDIAccess({ sysex: true }).then(onMIDISuccess, onMIDIFailure);
//     }
//   } else {
//     console.log('MIDI: System has *no* MIDI support.');
//     reportStatus(false, STR.midictrl.nomidisupport);
//     DOM.addClass('#midisettings', 'unsupported');
//     DOM.all('#midisettings select', function (el) {
//       el.disabled = 'disabled';
//     });
//   }
// }
//
// MIDI.prototype.sendSysex = function (data, timeoutms) {
//   if (this.deviceOut) {
//     console.log('MIDI: Sending as sysex...');
//     MBox.show(STR.midictrl.title_send, STR.midictrl.msg_sending, {
//       hideAfter: timeoutms || 10000,
//       type: 'processing',
//     });
//     this.deviceOut.send(data);
//   } else {
//     console.log("MIDI: Can't send sysex. No output device.");
//     MBox.show(STR.midictrl.title_send, STR.midictrl.nooutputs, {
//       hideAfter: 6000,
//     });
//   }
// };
//
// MIDI.prototype.hasOutput = function () {
//   return typeof this.deviceOut !== 'undefined';
// };
//
// MIDI.prototype.hasInput = function () {
//   return typeof this.deviceIn !== 'undefined';
// };
//
// function toHex(d, pad) {
//   return ('0000' + Number(d).toString(16)).slice(pad ? -pad : -2).toUpperCase();
// }
// function toBinary(d, pad) {
//   return ('0000000000000000' + Number(d).toString(2)).slice(pad ? -pad : -2).toUpperCase();
// }

const midi: Promise<MIDIAccess> = navigator.requestMIDIAccess({ sysex: true });

// Single setup bytes: 14294
// All setups bytes: 14294 * 16 = 22112? No it's 229340 bytes

export class Midi {
  device: MIDIPort;

  constructor(device: MIDIPort) {
    this.device = device;
  }
}

/* MIDI Message data format
Status Byte|Data Byte 1|Data Byte 2|Message|	        Legend
1000nnnn	  0kkkkkkk	  0vvvvvvv	  Note Off	        n=channel* k=key # 0-127 (60=middle C) v=velocity (0-127)
1001nnnn	  0kkkkkkk	  0vvvvvvv	  Note On	          n=channel k=key # 0-127(60=middle C) v=velocity (0-127)
1010nnnn	  0kkkkkkk	  0ppppppp	  Poly Key Pressure	n=channel k=key # 0-127(60=middle C) p=pressure (0-127)
1011nnnn	  0ccccccc	  0vvvvvvv	  Controller Change	n=channel c=controller v=controller value(0-127)
1100nnnn	  0ppppppp	  [none]	    Program Change	  n=channel p=preset number (0-127)
1101nnnn	  0ppppppp	  [none]	    Channel Pressure	n=channel p=pressure (0-127)
1110nnnn	  0fffffff	  0ccccccc	  Pitch Bend	      n=channel c=coarse f=fine (c+f = 14-bit resolution)
*/

type MidiMessageType =
  | 'sysex'
  | 'noteOff'
  | 'noteOn'
  | 'polyKeyPressure'
  | 'controllerChange'
  | 'programChange'
  | 'channelPressure'
  | 'pitchBend';
type MidiMessage = {
  type: MidiMessageType;
  channel: number;
  key?: number;
  velocity?: number;
  controller?: number;
  value?: number;
  coarse?: number;
  fine?: number;
};

function getMessageType(bytes: Uint8Array<ArrayBufferLike> | null) {
  if (!bytes || bytes.length < 2) return null;
  const statusByte = bytes[0];
  if (statusByte == 0xf0) return 'sysex';
  if ((statusByte & 0xf0) == 0x80) return 'noteOff';
  if ((statusByte & 0xf0) == 0x90) return 'noteOn';
  if ((statusByte & 0xf0) == 0xa0) return 'polyKeyPressure';
  if ((statusByte & 0xf0) == 0xb0) return 'controllerChange';
  if ((statusByte & 0xf0) == 0xc0) return 'programChange';
  if ((statusByte & 0xf0) == 0xd0) return 'channelPressure';
  if ((statusByte & 0xf0) == 0xe0) return 'pitchBend';

  if (statusByte == 0xf7) return 'sysex';
  return null;
}

function parseMidiMessage(bytes: Uint8Array<ArrayBufferLike> | null): MidiMessage | null {
  if (!bytes || bytes.length < 2) return null;
  const statusByte = bytes[0];
  const channel = statusByte & 0xf;
  const type = getMessageType(bytes);
  if (!type) return null;
  let key: number | undefined;
  let velocity: number | undefined;
  let controller: number | undefined;
  let value: number | undefined;
  let coarse: number | undefined;
  let fine: number | undefined;
  switch (type) {
    case 'noteOff':
      key = bytes[1];
      velocity = bytes[2];
      break;
    case 'noteOn':
      key = bytes[1];
      velocity = bytes[2];
      break;
    case 'polyKeyPressure':
      key = bytes[1];
      value = bytes[2];
      break;
    case 'controllerChange':
      controller = bytes[1];
      value = bytes[2];
      break;
    case 'programChange':
      value = bytes[1];
      break;
    case 'channelPressure':
      value = bytes[1];
      break;
    case 'pitchBend':
      coarse = bytes[1];
      fine = bytes[2];
      break;
    default:
      break;
  }
  return {
    type,
    channel,
    value,
    controller,
    key,
    velocity,
    coarse,
    fine,
  };
}

export class MidiInput extends Midi {
  constructor(device: MIDIInput) {
    super(device);
    device.onmidimessage = this.handleMidiMessage;
  }

  handleMidiMessage(ev: MIDIMessageEvent) {
    const bytes = ev.data;
    const msg = parseMidiMessage(bytes);
    console.debug('MIDI: Received message', msg);
    if (msg && msg.type === 'sysex') {
      console.log(`MIDI: Sysex received ${bytes?.length}`, bytes);
      // Save it to local storage for now
      if (bytes && bytes.length > 100) {
        localStorage.setItem(
          'sysexDataArr',
          bytes ? JSON.stringify(Array.from(new Uint8Array(bytes.buffer))) : '[]',
        );
      }
      return;
    }
  }
}

export class MidiOutput extends Midi {
  constructor(device: MIDIOutput) {
    super(device);
  }
}

export default async function useMidi() {
  console.debug('Initializing MIDI');

  const midiSupport = ref<boolean>();
  const m: MIDIAccess | null = await midi.then(
    (_m) => {
      midiSupport.value = true;
      return _m;
    },
    () => {
      midiSupport.value = false;
      return null;
    },
  );

  const inputs = ref<Array<MidiInput>>([]);
  const outputs = ref<Array<MidiOutput>>([]);

  function updateDevices() {
    if (!m) return;
    const oldInputs = inputs.value;
    inputs.value = [];
    for (const [k, v] of m.inputs.entries()) {
      const old = oldInputs.find((i) => i.device.id === v.id);
      inputs.value.push(old || new MidiInput(v));
    }

    const oldOutputs = outputs.value;
    outputs.value = [];
    for (const [k, v] of m.outputs.entries()) {
      const old = oldOutputs.find((i) => i.device.id === v.id);
      outputs.value.push(old || new MidiOutput(v));
    }
  }

  if (m) m.onstatechange = updateDevices;

  updateDevices();

  function dispose() {
    if (!m) return;
    m.onstatechange = null;
    for (const i of inputs.value) (i.device as MIDIInput).onmidimessage = null;
  }

  return {
    midiSupport,
    inputs,
    outputs,
    dispose,
  };
}
