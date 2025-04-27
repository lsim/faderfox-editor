import { computed, type ComputedRef, ref, watch, type WatchHandle } from 'vue';
import { filter, lastValueFrom, map, Subject, type Subscription, take, timeout } from 'rxjs';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import { type DbBundle, useStorage } from '@/composables/storage.ts';
import useToast from '@/composables/toast.ts';

const midi: Promise<MIDIAccess | null> =
  typeof navigator.requestMIDIAccess === 'function'
    ? navigator.requestMIDIAccess({ sysex: true })
    : Promise.resolve(null);

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
  if (statusByte === 0xf0) return 'sysex';
  if ((statusByte & 0xf0) === 0x80) return 'noteOff';
  if ((statusByte & 0xf0) === 0x90) return 'noteOn';
  if ((statusByte & 0xf0) === 0xa0) return 'polyKeyPressure';
  if ((statusByte & 0xf0) === 0xb0) return 'controllerChange';
  if ((statusByte & 0xf0) === 0xc0) return 'programChange';
  if ((statusByte & 0xf0) === 0xd0) return 'channelPressure';
  if ((statusByte & 0xf0) === 0xe0) return 'pitchBend';

  if (statusByte === 0xf7) return 'sysex';
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
  }

  handleMidiMessage(ev: MIDIMessageEvent) {
    const bytes = ev.data;
    if (!bytes) return;
    const msg = parseMidiMessage(bytes);
    if (!msg) return;
    console.debug(
      'MidiInput received message',
      this.receivedMessages$,
      msg,
      Array.from(bytes).map((x) => x.toString(16)),
    );
    this.receivedMessages$.next([msg, bytes]);
  }
}

export class MidiOutput extends Midi<MIDIOutput> {
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

  private async roundtrip(data: number[], timeoutMs = 1000) {
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

function initMidi(toast: ReturnType<typeof useToast>) {
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
    // Clear selected input if it's not in the list anymore
    if (
      selectedInput.value &&
      !inputs.value.find((i) => i.device.id === selectedInput.value?.device.id)
    ) {
      selectedInput.value = null;
    }

    const oldOutputs = outputs.value;
    outputs.value = [];
    for (const [k, v] of m.outputs.entries()) {
      const old = oldOutputs.find((i) => i.device.id === v.id);
      outputs.value.push(old || new MidiOutput(v));
    }
    // Clear selected output if it's not in the list anymore
    if (
      selectedOutput.value &&
      !outputs.value.find((i) => i.device.id === selectedOutput.value?.device.id)
    ) {
      selectedOutput.value = null;
    }
  }

  let m: MIDIAccess | null = null;
  midi.then(
    (_m) => {
      midiSupport.value = true;
      m = _m;
      if (m) {
        m.onstatechange = updateDevices;
        updateDevices();
      }
    },
    () => {
      midiSupport.value = false;
    },
  );

  function dispose() {
    console.debug('Disposing MIDI');
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

  let inboundBundlesSubscription: Subscription | undefined = undefined;

  const inboundMessagesSubject = new Subject<[MidiMessage, Uint8Array]>();

  let inboundMessagesSubscription: Subscription | undefined = undefined;

  const storage = useStorage();

  watch(
    () => protocol.value,
    (newLink) => {
      inboundBundlesSubscription?.unsubscribe();
      inboundBundlesSubscription = newLink?.input.receivedMessages$
        .pipe(filter(([msg, bytes]) => msg.type === 'sysex' && bytes.length > 1000))
        .subscribe(async ([msg, bytes]) => {
          toast.show('Received full sysex dump from EC4', 'info');
          await storage.addBundle(bytes, 'Sysex from EC4');
        });
      inboundMessagesSubscription?.unsubscribe();
      inboundMessagesSubscription =
        newLink?.input.receivedMessages$.subscribe(inboundMessagesSubject);
    },
    { immediate: true },
  );

  watch(
    () => [ec4.selectedSetupIndex, ec4.selectedGroupIndex],
    async ([newSetupId, newGroupId]) => {
      protocol.value?.setSetupAndGroup(newSetupId, newGroupId);
    },
  );

  function sendBundle(bundle: DbBundle) {
    if (!m) return;
    selectedOutput.value?.send(bundle.bytes);
  }
  return {
    midiSupport,
    inputs,
    outputs,
    protocol,
    selectedInput,
    selectedOutput,
    sendBundle,
    dispose,
    inboundMessages$: inboundMessagesSubject.asObservable(),
  };
}

let midiExports: ReturnType<typeof initMidi> | null = null;

export default function useMidi() {
  const toast = useToast();
  if (!midiExports) {
    midiExports = initMidi(toast);
  }
  return midiExports;
}
