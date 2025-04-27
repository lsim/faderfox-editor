import useMidi from '@/composables/useMidi.ts';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import { onUnmounted } from 'vue';

function deviceIdOk(bytes: Uint8Array) {
  return bytes[5] === 0x2c && bytes[6] === 0x1b;
}

export default function useRemoteControl() {
  const midi = useMidi();
  const ec4 = useEc4Store();

  const sub = midi.inboundMessages$.subscribe(([msg, bytes]) => {
    // console.log('RC received message', msg, bytes);

    // Only process messages straight from the EC4 via usb
    if (midi.selectedInput.value?.device.name !== 'Faderfox EC4') return;

    if (msg.type === 'noteOn' && msg.key != null) {
      ec4.selectedEncoderIndex = msg.key % 16;
    } else if (msg.type === 'controllerChange' && msg.value != null && msg.controller != null) {
      const numberField = ec4.activeNumberField;
      if (!numberField) return;
      ec4.selectedGroup.controls[msg.controller % 16].numbers[numberField] = msg.value;
    } else if (msg.type === 'sysex' && bytes != null && bytes.length > 13 && deviceIdOk(bytes)) {
      /*
        answer (from EC4):
        F0 00 00 00 4E 2C 1i 4E 28 1s 4E 24 1g F7

        F0 00 00 00 4E 2C 1B 4E 28 1F 4E 24 10 F7
                    ^^^^^^^^ ^^^^^^^^ ^^^^^^^^
                   device-id   setup#   group#
                        i=11     s=16      g=1

       */
      const oldSetupIndex = ec4.selectedSetupIndex;
      if (bytes[7] === 0x4e && bytes[8] === 0x28) {
        ec4.selectedSetupIndex = bytes[9] & 0x0f;
      }
      // Only interpret as group message if the setup index is the same
      if (oldSetupIndex === ec4.selectedSetupIndex && bytes[10] === 0x4e && bytes[11] === 0x24) {
        ec4.selectedGroupIndex = bytes[12] & 0x0f;
      }
    }
  });

  onUnmounted(() => {
    sub.unsubscribe();
  });
}
