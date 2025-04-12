import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import type { Control, NumberFieldType } from '@/domain/Encoder.ts';

export default function useMacros() {
  const ec4 = useEc4Store();

  function copyToAll(value: number, prop: NumberFieldType | null) {
    if (!prop) return;
    console.log('copyToAll', value, prop);
    ec4.selectedGroup.controls.forEach((c) => {
      c.numbers[prop] = value;
    });
  }
  return {
    copyToAll,
  };
}
