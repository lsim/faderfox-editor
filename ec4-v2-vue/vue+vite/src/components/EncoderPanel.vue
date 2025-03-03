<script setup lang="ts">

import SingleEncoder from "@/components/SingleEncoder.vue";
import { type Encoder, type FieldType, PushButton } from '@/domain/Encoder';
import { ref } from 'vue';

const props = defineProps<{
  encoders: Encoder[],
  selectedEncoder: Encoder,
  activeField: FieldType,
}>();

const emit = defineEmits<{
  (event: 'update:selectedEncoder', encoder: Encoder): void,
  (event: 'update:activeField', field: FieldType): void,
  (event: 'update:encoder', encoder: Encoder): void,
}>();

const twoDigs = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15'];

// const encoders = ref<Encoder[]>(twoDigs.map((id) => new Encoder(id)));
// const pushButtons = ref<Encoder[]>(twoDigs.map((id) => new PushButton(id)));

// const mode = ref<'turn' | 'push'>('turn');

// const shownEncoders = computed(() => {
//   return mode.value === 'turn' ? encoders.value : pushButtons.value;
// });

// const selectedEncoder = ref<Encoder | null>(null);

// const activeField = ref<FieldType>(null);

// function selectEncoder(encoder: Encoder) {
//   selectedEncoder.value = encoder;
// }

// function updateEncoder(index: number, encoder: Encoder) {
//   encoders.value[index] = encoder;
// }

</script>

<template>
  <div id="ctrlcontainer" class="watchparams" data-mode="nothing">
<!--    <div-->
<!--      id="editnothing"-->
<!--      data-action="edit-nothing"-->
<!--      title="Hide value fields"-->
<!--    >-->
<!--      &#x2715;-->
<!--    </div>-->
    <div  class="encoder-container">
      <SingleEncoder
          v-for="(encoder, index) in props.encoders"
          :key="encoder.id"
          :model-value="encoder"
          @update:model-value="emit('update:encoder', $event)"
          :index="index"
          :active-field="props.activeField"
          :mode="mode"
          @click="selectEncoder(encoder)"
      />
    </div>
    <div id="fillnumbers" title="Fill with ascending values in chosen direction">
      Fill &quot;<span>Numbers</span>&quot;:
      <a class="asbutton" data-action="filltopbottom">from top left to bottom right</a>
      <a class="asbutton" data-action="fillbottomtop">from bottom left to top right</a>
    </div>
  </div>

</template>

<style scoped lang="scss">

.encoder-container {
  overflow:hidden;
  height: 100%;
}

#ctrlcontainer {
  // A 4 x 4 grid of encoders
  padding-left: 25px;
  padding-top: 60px;
  display: grid;
  background-color: transparent;
  grid-template-columns: repeat(4, 110px);
  grid-template-rows: repeat(4, 110px);
  gap: 1px;
}
</style>
