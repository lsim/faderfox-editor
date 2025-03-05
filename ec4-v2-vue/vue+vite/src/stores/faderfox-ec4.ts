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

  // function updateEncoderGroup(encoderGroup: EncoderGroup) {
  //   const index = encoderGroups.value.findIndex((g) => g.id === encoderGroup.id);
  //   if (index >= 0) {
  //     encoderGroups.value[index] = encoderGroup;
  //   } else {
  //     console.warn('Could not find encoder group', encoderGroup);
  //   }
  // }

  // function updateEncoder(encoder: Encoder) {
  //   const group = encoderGroups.value.find((g) => g.id === encoder.groupId);
  //   if (group) {
  //     const index = group.encoders.findIndex((e) => e.id === encoder.id);
  //     if (index >= 0) {
  //       group.encoders[index] = encoder;
  //     } else {
  //       console.warn('Could not find encoder', encoder);
  //     }
  //   } else {
  //     console.warn('Could not find encoder group', encoder);
  //   }
  // }

  return {
    encoderGroups,
    // updateEncoderGroup,
    // updateEncoder,
  };
});
