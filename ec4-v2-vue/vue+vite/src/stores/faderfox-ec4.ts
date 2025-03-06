import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { EncoderGroup, PushButton } from '@/domain/Encoder.ts';
import { Encoder } from '@/domain/Encoder.ts';

// TODO: This is a temporary solution to get the encoder groups to render
function createEncoderGroup(groupId: string) {
  const encoderIds = [
    '00',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
  ];
  const encoders = encoderIds.map((id) => new Encoder(`EC${id}`, groupId));
  const pushButtons = encoderIds.map((id) => new PushButton(`PB${id}`, groupId));
  return new EncoderGroup(groupId, groupId, encoders, pushButtons);
}

export const useEc4Store = defineStore('ec4', () => {
  const encoderGroups = ref<EncoderGroup[]>([createEncoderGroup('GR01')]);

  const editorMode = ref<'push' | 'turn'>('turn');

  function setEditorMode(mode: 'push' | 'turn') {
    editorMode.value = mode;
  }

  return {
    encoderGroups,
    editorMode,
    setEditorMode,
  };
});
