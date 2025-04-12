import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import type { Control, NumberFieldType } from '@/domain/Encoder.ts';

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
  return {
    copyToAll,
  };
}
