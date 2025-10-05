import {
  type Control,
  encoderTypeByName,
  type FieldType,
  pushButtonTypeByName,
  scaleOptionByName,
} from '@/domain/Encoder.ts';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';

export default function useUiRules() {
  const ec4 = useEc4Store();

  // Direct implementation of rules from the EC4 documentation
  function isHidden(field: FieldType, control: Control): boolean {
    // [x] if encoder type = CCR1 or CCR2 then lower/upper = disable
    if (ec4.editorMode === 'turn') {
      if (
        ['lower', 'upper'].includes(field) &&
        (control.numbers.type === encoderTypeByName('CCR1') ||
          control.numbers.type === encoderTypeByName('CCR2'))
      )
        return true;
      // [x] if encoder type = NOTE then lower/upper/mode = disable
      if (
        ['lower', 'upper', 'mode'].includes(field) &&
        control.numbers.type === encoderTypeByName('Note')
      )
        return true;
      // [x] if encoder type = PrgC or PBnd or AftT then command number = disable
      if (
        'number' === field &&
        ['PrgC', 'PBnd', 'AftT'].find((t) => control.numbers.type === encoderTypeByName(t))
      )
        return true;
    } else {
      // [x] if push button type = Off then display/mode/channel/number/lower/upper = disable
      if (
        ['pb_display', 'pb_mode', 'pb_channel', 'pb_number', 'pb_lower', 'pb_upper'].includes(
          field,
        ) &&
        pushButtonTypeByName('Off') === control.numbers.pb_type
      )
        return true;
      // [x] if push button type = Acc0/Acc3/LSp6/Min/Max then mode/channel/number/lower/upper = disable
      if (
        ['pb_mode', 'pb_channel', 'pb_number', 'pb_lower', 'pb_upper'].includes(field) &&
        ['Acc0', 'Acc3', 'LSp6', 'Min', 'Max'].find(
          (t) => pushButtonTypeByName(t) === control.numbers.pb_type,
        )
      )
        return true;
      // [x] if push button type = Grp/Set then mode/number/lower/upper = disable
      if (
        ['pb_mode', 'pb_number', 'pb_lower', 'pb_upper'].includes(field) &&
        ['Grp', 'Set'].find((t) => pushButtonTypeByName(t) === control.numbers.pb_type)
      )
        return true;
    }
    return false;
  }

  function getLimitRanges(type: number, scale: number) {
    const isHiResType = ['CCAh', 'PBnd', 'NRPN'].find((t) => type === encoderTypeByName(t));
    const isHiResDisplay = ['off', '1000', '±500', '9999'].find(
      (t) => scale === scaleOptionByName(t),
    );

    if (isHiResType && isHiResDisplay) {
      return [
        { from: 0, to: 4094 },
        { from: 16383, to: 16383 },
      ];
    }
    return [{ from: 0, to: 127 }];
  }

  function getNumberLSBRanges(type: number) {
    if (type === encoderTypeByName('CCAh')) return [{ from: 0, to: 31 }];
    return [{ from: 0, to: 127 }];
  }

  return {
    isHidden,
    getLimitRanges,
    getNumberLSBRanges,
  };
}
