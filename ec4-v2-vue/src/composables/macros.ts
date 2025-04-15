import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import { Control, type NumberFieldType } from '@/domain/Encoder.ts';

export default function useMacros() {
  const ec4 = useEc4Store();

  function copyToAll(value: number, prop: NumberFieldType | null) {
    if (!prop) return;
    const group = ec4.selectedGroup;
    console.time('copyToAll');
    for (const c of group.controls) {
      c.numbers[prop] = value;
    }
    console.timeEnd('copyToAll');
  }

  function incrementFrom(value: number, prop: NumberFieldType | null, increment: number = 1) {
    if (!prop) return;
    const group = ec4.selectedGroup;
    console.time('incrementFrom');
    for (let i = ec4.selectedEncoderIndex + 1; i < group.controls.length; i++) {
      const c = group.controls[i];
      c.numbers[prop] = value + (i - ec4.selectedEncoderIndex) * increment;
    }
    console.timeEnd('incrementFrom');
  }

  function setAllNames(name: string) {
    const group = ec4.selectedGroup;
    console.time('setAllNames');
    for (const c of group.controls) {
      c.name = name;
    }
    console.timeEnd('setAllNames');
  }

  const pristineEncoder = new Control('', 0, 0, 0);
  function resetEncoder() {
    const group = ec4.selectedGroup;
    const control = group.controls[ec4.selectedEncoderIndex];
    console.time('resetEncoder');
    Object.assign(control.numbers, pristineEncoder.numbers);
    control.name = pristineEncoder.name;
    control.link = pristineEncoder.link;
    control.pb_link = pristineEncoder.pb_link;
    console.timeEnd('resetEncoder');
  }
  return {
    copyToAll,
    incrementFrom,
    setAllNames,
    resetEncoder,
  };
}
