import { computed, type ComputedRef, ref, watch } from 'vue';
import { filter, lastValueFrom, map, Subject, take, timeout } from 'rxjs';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';

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

export class Midi<T extends MIDIOutput | MIDIInput> {
  device: T;

  constructor(device: T) {
    this.device = device;
  }
}

export class MidiInput extends Midi<MIDIInput> {
  readonly receivedMessages$: Subject<[MidiMessage, Uint8Array]>;

  constructor(device: MIDIInput) {
    super(device);
    this.receivedMessages$ = new Subject<[MidiMessage, Uint8Array]>();
    device.onmidimessage = this.handleMidiMessage.bind(this);
    console.log('MidiInput constructor', this.receivedMessages$);
  }

  handleMidiMessage(ev: MIDIMessageEvent) {
    const bytes = ev.data;
    if (!bytes) return;
    const msg = parseMidiMessage(bytes);
    if (!msg) return;
    console.log(
      'MidiInput received message',
      this.receivedMessages$,
      msg,
      Array.from(bytes).map((x) => x.toString(16)),
    );
    this.receivedMessages$.next([msg, bytes]);
  }
}

export class MidiOutput extends Midi<MIDIOutput> {
  constructor(device: MIDIOutput) {
    super(device);
  }

  send(data: Uint8Array) {
    if (!this.device) throw Error('MIDI device not found');
    this.device.send(Array.from(data));
  }
}

export class EC4SysexProtocol {
  input: MidiInput;
  output: MidiOutput;

  constructor(input: MidiInput, output: MidiOutput) {
    this.input = input;
    this.output = output;
  }

  private sendRaw(data: Uint8Array) {
    this.output.send(data);
  }

  private async roundtrip(data: number[], timeoutMs: number = 1000) {
    console.log(
      'sending request',
      data.map((x) => x.toString(16)),
    );

    const responsePromise = lastValueFrom(
      this.input.receivedMessages$.pipe(
        filter(([msg]) => msg.type === 'sysex'),
        take(1),
        timeout({ first: timeoutMs }),
        map(([, bytes]) => bytes),
      ),
    );
    this.sendRaw(new Uint8Array(data));
    return await responsePromise;
  }

  async getSetupAndGroup() {
    const response = await this.roundtrip([0xf0, 0x00, 0x00, 0x00, 0x4e, 0x20, 0x10, 0xf7]);
    const groupId = response[12] & 0xf;
    const setupId = response[9] & 0xf;
    return [setupId, groupId];
  }

  async setSetupAndGroup(setupId: number, groupId: number) {
    const setBoth = [
      0xf0,
      0x00,
      0x00,
      0x00,
      0x4e,
      0x2c,
      0x1b,
      0x4e,
      0x28,
      0x10 | setupId,
      0x4e,
      0x24,
      0x10 | groupId,
      0xf7,
    ];
    await this.roundtrip(setBoth);
  }

  async requestGroupSnapshot() {
    await this.roundtrip([0xf0, 0x00, 0x00, 0x00, 0x4e, 0x2c, 0x1b, 0x4e, 0x26, 0x10, 0xf7]);
  }

  lsn(n: number) {
    return n & 0xf;
  }

  msn(n: number) {
    return (n >> 4) & 0xf;
  }
  //   F0 00 00 00 4E 2C 1B 4E 22 10 4A 23 1C 4D 25 12 4D 26 15 4D 27 13 4D 26 1F F7 (write ctrl name display)
  //               ^^^^^^^^ ^^^^^^^^ ^^^^^^^^ ^^^^^^^^ ^^^^^^^^ ^^^^^^^^ ^^^^^^^^
  //               device-id     type  address     data     data     data     data
  //               i=11   	     t=0     a=61      d='R'    d='e'    d='s'    d='o'
  //                         ctrl nam  ctrl 16
  async setEncoderDisplay(type: number, address: number, data: string) {
    // const cmd = [
    //   0xf0, 0x00, 0x00, 0x00, 0x4e, 0x2c, 0x1b, 0x4e, 0x22, 0x10, 0x4a, 0x23, 0x1c, 0x4d, 0x25,
    //   0x12, 0x4d, 0x26, 0x15, 0x4d, 0x27, 0x13, 0x4d, 0x26, 0x1f, 0xf7,
    // ];
    const cmd = [
      0xf0,
      0x00,
      0x00,
      0x00,
      // device-id
      0x4e,
      0x2c,
      0x1b,
      // type
      0x4e,
      0x22,
      0x10 | this.lsn(type),
      // address
      0x4a,
      0x20 | this.msn(address),
      0x10 | this.lsn(address),
      // Char 1
      0x4d,
      0x20 | this.msn(data[0].charCodeAt(0)),
      0x10 | this.lsn(data[0].charCodeAt(0)),
      // Char 2
      0x4d,
      0x20 | this.msn(data[1].charCodeAt(0)),
      0x10 | this.lsn(data[1].charCodeAt(0)),
      // Char 3
      0x4d,
      0x20 | this.msn(data[2].charCodeAt(0)),
      0x10 | this.lsn(data[2].charCodeAt(0)),
      // Char 4
      0x4d,
      0x20 | this.msn(data[3].charCodeAt(0)),
      0x10 | this.lsn(data[3].charCodeAt(0)),
      0xf7,
    ];

    await this.roundtrip(cmd);
  }

  async setFullDisplay() {
    const cmd = [
      0xf0, 0x00, 0x00, 0x00, 0x4e, 0x2c, 0x1b, 0x4e, 0x22, 0x13, 0x4a, 0x21, 0x1c, 0x4d, 0x25,
      0x12, 0x4d, 0x26, 0x15, 0x4d, 0x27, 0x13, 0x4d, 0x26, 0x1f, 0x4e, 0x22, 0x14, 0xf7,
    ];
    await this.roundtrip(cmd);
  }

  async fullDisplay(enable: boolean) {
    // F0 00 00 00 4E 2C 1B 4E 22 14 F7
    const cmd = [0xf0, 0x00, 0x00, 0x00, 0x4e, 0x2c, 0x1b, 0x4e, 0x22, enable ? 0x14 : 0x15, 0xf7];
    await this.roundtrip(cmd);
  }
}

export default function useMidi() {
  console.debug('Initializing MIDI');

  const midiSupport = ref<boolean>();
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

  let m: MIDIAccess | null = null;
  midi.then(
    (_m) => {
      midiSupport.value = true;
      m = _m;
      m.onstatechange = updateDevices;
      updateDevices();
    },
    () => {
      midiSupport.value = false;
    },
  );

  function dispose() {
    midi.then((_m) => {
      if (!m) return;
      m.onstatechange = null;
    });
    for (const i of inputs.value) (i.device as MIDIInput).onmidimessage = null;
  }

  const ec4 = useEc4Store();

  const selectedInput = ref<MidiInput | null>(null);
  const selectedOutput = ref<MidiOutput | null>(null);

  const protocol: ComputedRef<EC4SysexProtocol | null> = computed(() => {
    if (!selectedInput.value || !selectedOutput.value) return null;
    return new EC4SysexProtocol(selectedInput.value as MidiInput, selectedOutput.value);
  });

  watch(
    () => [ec4.selectedSetupIndex, ec4.selectedGroupIndex],
    async ([newSetupId, newGroupId]) => {
      console.log('new setup/group', newSetupId, newGroupId);
      // await protocol.value?.setSetupAndGroup(newVal[0], newVal[1]);
      // await protocol.value?.setEncoderDisplay(newSetupId, newGroupId, 'fooo');
      // await protocol.value?.showFullDisplay();
    },
    { deep: true },
  );

  return {
    midiSupport,
    inputs,
    outputs,
    protocol,
    selectedInput,
    selectedOutput,
    dispose,
  };
}
