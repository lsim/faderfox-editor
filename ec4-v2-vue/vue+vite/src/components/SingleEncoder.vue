<script lang="ts" setup>

import ScaleSelector from "@/components/ScaleSelector.vue";
import type {Encoder, FieldType} from "@/domain/Encoder.ts";
import { computed, ref, watch } from "vue";

const props = defineProps<{
  modelValue: Encoder,
  index: number,
  activeField: FieldType,
  mode: 'turn' | 'push',
}>();

const emit = defineEmits(['update:modelValue']);

// Make sure the model properties are writable for v-model in the template
const value = computed(() => {
  return {...props.modelValue};
});

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function noteToObject(n: number) {
  const name = noteNames[n % 12];
  const octave = (n / 12) - 2;
  return {
    text: name + octave,
    value: n,
  };
}

// From C-2 to G-8
const noteOptions = ref([...Array(128).keys()].map((n) => noteToObject(n)));

const encoderTypes = ref([
  { text: 'CC rel. 1', value: 1 },
  { text: 'CC rel. 2', value: 2 },
  { text: 'CC absolute', value: 3 },
  { text: 'Program change', value: 4 },
  { text: 'CC 14bit absolute', value: 5 },
  { text: 'Pitch bend', value: 6 },
  { text: 'Aftertouch', value: 7 },
  { text: 'Note', value: 8 },
  { text: 'NRPN', value: 9 },
]);

watch(value, () => {
  emit('update:modelValue', value.value);
}, { deep: true });

</script>

<template>
  <div class="enc typed encoder-container">
    <div class="knob"></div>
    <img
      v-if="props.mode === 'push'"
      src="../assets/tap-svgrepo-com.svg"
      width="24px"
      class="tapicon"
      title="Push button mode (click to toggle)"
      data-action="mode-turn"
      alt="Push button mode (click to toggle)"
    />
    <img
      v-if="props.mode === 'turn'"
      src="../assets/rotate-svgrepo-com.svg"
      width="24px"
      class="rotateicon"
      title="Turn mode (click to toggle)"
      data-action="mode-push"
      alt="Turn mode (click to toggle)"
    />
    <div class="inputs">
      <div class="name">
        <input
          class="matrixfont width_4"
          maxlength="4"
          v-model="value.name"
          title="Edit name of encoder/button"
        />
      </div>
      <div v-if="props.activeField === 'address' && value.type === 'cc'" class="number">
        <label>{{ $t('ENCODER_NUMBER') }}</label>
        <input
          class="width_3"
          maxlength="3"
          v-model="value.number"
        />
      </div>
      <div v-else-if="props.activeField === 'address' && value.type === 'nrpn'" class="number">
        <label>{{ $t('ENCODER_NUMBER_NRPN') }}</label>
        <div class="inputs">
          <input
            class="width_3"
            maxlength="3"
            v-model="value.number_h"
          />
          <input
            class="width_3"
            maxlength="3"
            v-model="value.number"
          />
        </div>
      </div>
      <div v-else-if="props.activeField === 'number_value' && value.type === 'note'" class="note">
        <label>{{ $t('ENCODER_NUMBER_NOTE') }}</label>
        <div class="inputs">
          <input
            class="width_3"
            v-model="value.number"
            maxlength="3"
          />
          <select
            class="width_2"
            data-watch="number"
            v-model="value.number"
          >
            <option v-for="n in noteOptions" :key="n.value" :value="n.value">{{ n.text }}</option>
          </select>
        </div>
      </div>
      <div v-else-if="props.activeField === 'channel'" class="channel">
        <label>{{ $t('ENCODER_CHANNEL') }}</label>
        <input
          class="width_2"
          v-model="value.channel"
          maxlength="2"
        />
      </div>
      <div v-else-if="props.activeField === 'lower_limit'" class="lower">
        <label> {{ $t('ENCODER_LOWER') }}</label>
        <input
          class="width_4"
          v-model="value.lower"
          maxlength="4"
        />
      </div>
      <div v-else-if="props.activeField === 'upper_limit'" class="upper">
        <label> {{ $t('ENCODER_UPPER') }}</label>
        <input
          class="width_4"
          v-model="value.upper"
          maxlength="4"
        />
      </div>
      <div v-else-if="props.activeField === 'scale'" class="scale">
        <label> {{ $t('ENCODER_SCALE') }}</label>
        <ScaleSelector v-model="value.scale" />
      </div>
      <div v-else-if="props.activeField === 'type'" class="type">
        <label> {{ $t('ENCODER_TYPE') }}</label>
        <select data-watch="type" v-model="value.type">
          <option v-for="n in encoderTypes" :key="n.value" :value="n.value">{{ n.text }}</option>
        </select>
      </div>
      <div v-else-if="props.activeField === 'mode'" class="mode">
        <label> {{ $t('ENCODER_MODE') }}</label>
        <select v-model="value.mode">
          <option v-for="n in modeOptions" :key="n.value" :value="n.value">{{ n.text }}</option>
        </select>
      </div>
<!--      <div class="pb_channel">-->
<!--        <label>{{ $t('ENCODER_PB_CHANNEL') }}</label>-->
<!--        <input-->
<!--          data-watch="pb_channel"-->
<!--          maxlength="2"-->
<!--          type="text"-->
<!--          value="0"-->
<!--          tabindex="{{ 216 + index }}"-->
<!--        />-->
<!--      </div>-->
<!--      <div class="pb_display">-->
<!--        <label>{{ $t('ENCODER_PB_DISPLAY') }}</label>-->
<!--        <select data-watch="pb_display" tabindex="{{ 216 + index }}">-->
<!--          <option>Off</option>-->
<!--          <option>On</option>-->
<!--        </select>-->
<!--      </div>-->
<!--      <div class="pb_number">-->
<!--        <div class="pb_standard">-->
<!--          <label>{{ $t('ENCODER_PB_NUMBER') }}</label>-->
<!--          <div class="inputs">-->
<!--            <input-->
<!--              data-watch="pb_number"-->
<!--              maxlength="3"-->
<!--              type="text"-->
<!--              value="0"-->
<!--            />-->
<!--          </div>-->
<!--        </div>-->
<!--        <div class="pb_note">-->
<!--          <label>{{ $t('ENCODER_NUMBER_NOTE') }}</label>-->
<!--          <div class="inputs">-->
<!--            <input-->
<!--              data-watch="pb_number"-->
<!--              maxlength="3"-->
<!--              type="text"-->
<!--              value="0"-->
<!--            />-->
<!--            <select-->
<!--              data-watch="pb_number"-->
<!--            >-->
<!--              &lt;!&ndash; TODO: bind this &ndash;&gt;-->
<!--            </select>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--      <div class="pb_type">-->
<!--        <label>{{ $t('ENCODER_PB_TYPE') }}</label>-->
<!--        <select data-watch="pb_type" class="b">-->
<!--          <option>Off</option>-->
<!--          <option>Note</option>-->
<!--          <option>CC</option>-->
<!--          <option>PrgC</option>-->
<!--          <option>PBnd</option>-->
<!--          <option>AftT</option>-->
<!--          <option>Grp</option>-->
<!--          <option>Set</option>-->
<!--          <option>Acc0</option>-->
<!--          <option>Acc3</option>-->
<!--          <option>LSp6</option>-->
<!--          <option>Min</option>-->
<!--          <option>Max</option>-->
<!--        </select>-->
<!--      </div>-->
<!--      <div class="pb_mode">-->
<!--        <label>{{ $t('ENCODER_PB_MODE') }}</label>-->
<!--        <select data-watch="pb_mode">-->
<!--          <option>Key</option>-->
<!--          <option>Togl</option>-->
<!--        </select>-->
<!--      </div>-->
<!--      <div class="pb_lower">-->
<!--        <label>{{ $t('ENCODER_PB_LOWER') }}</label>-->
<!--        <input-->
<!--          data-watch="pb_lower"-->
<!--          maxlength="3"-->
<!--          type="text"-->
<!--          value="0"-->
<!--          tabindex="{{ 216 + index }}"-->
<!--        />-->
<!--      </div>-->
<!--      <div class="pb_upper">-->
<!--        <label>{{ $t('ENCODER_PB_UPPER') }}</label>-->
<!--        <input-->
<!--          data-watch="pb_upper"-->
<!--          maxlength="3"-->
<!--          type="text"-->
<!--          value="0"-->
<!--          tabindex="{{ 216 + index }}"-->
<!--        />-->
<!--      </div>-->
    </div>
  <div
    class="link turn matrixfont"
    title="Link this encoder to next"
  >
    <input
      type="checkbox"
      id="linkenc{{ index }}"
      data-watch="link"
      data-action="edit-link"
    />
    <label for="linkenc{{ index }}"><span>Link</span>&gt;</label>
  </div>
  <div
    class="link push matrixfont"
    title="Link this push button to next"
  >
    <input
      type="checkbox"
      id="linkpb{{ index }}"
      data-watch="pb_link"
      data-action="edit-pb_link"
    />
    <label for="linkpb{{ index }}"><span>Link</span>&gt;</label>
  </div>
  </div>
</template>

<style scoped lang="scss">
.encoder-container {
  overflow: hidden;
  position: relative;

  .inputs {
    text-align: center;
    z-index: 10;
    position: relative;
  }

  .width_2 { width:1.2em; }
  .width_3 { width:1.3em; }
  .width_4 { width:2.4em; }

  .knob {
    z-index: 1;
    position: absolute;
    left: 50%;
    top: 70px;
    width: 64px;
    height: 64px;
    margin-left: -32px;
    margin-top: -32px;
    border-radius: 50%;
    background-color: #222;
    box-shadow: 0 0 15px #777;
    border: 2px solid #000;
  }
}

</style>
