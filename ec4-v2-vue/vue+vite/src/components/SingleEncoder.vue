<script lang="ts" setup>
import ScaleSelector from '@/components/ScaleSelector.vue';
import { type Encoder, EncoderGroup, type FieldType, encoderTypes } from '@/domain/Encoder.ts';
import { computed, ref, ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';

const { t } = useI18n();

const props = defineProps<{
  encoderId: string;
  groupId: string;
  activeField: FieldType;
  mode: 'turn' | 'push';
  nameActive: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:name-active', nameActive: boolean): void;
}>();

const { encoderGroups } = useEc4Store();

const control: ComputedRef<Encoder | null> = computed(() => {
  const group = encoderGroups.find((g: EncoderGroup) => g.id === props.groupId);
  const controls = props.mode === 'turn' ? group?.encoders : group?.pushButtons;
  return controls?.find((e: Encoder) => e.id === props.encoderId);
});

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function noteToObject(n: number) {
  const name = noteNames[n % 12];
  const octave = Math.round(n / 12) - 2;
  console.debug('noteToObject', n, name, octave);
  return {
    text: `${name}-${octave}`,
    value: n,
  };
}

// From C-2 to G-8
const noteOptions = ref([...Array(128).keys()].map((n) => noteToObject(n)));

// This governs tab order behavior
function setNameActive(newVal: boolean, source: HTMLElement) {
  if (newVal != props.nameActive) emit('update:name-active', newVal);
  source.select?.();
}
</script>

<template>
  <div class="enc typed encoder-container">
    <div class="knob"></div>
    <!--    <img-->
    <!--      v-if="props.mode === 'push'"-->
    <!--      src="../assets/tap-svgrepo-com.svg"-->
    <!--      width="24px"-->
    <!--      class="tapicon"-->
    <!--      title="Push button mode (click to toggle)"-->
    <!--      data-action="mode-turn"-->
    <!--      alt="Push button mode (click to toggle)"-->
    <!--    />-->
    <!--    <img-->
    <!--      v-if="props.mode === 'turn'"-->
    <!--      src="../assets/rotate-svgrepo-com.svg"-->
    <!--      width="24px"-->
    <!--      class="rotateicon"-->
    <!--      title="Turn mode (click to toggle)"-->
    <!--      data-action="mode-push"-->
    <!--      alt="Turn mode (click to toggle)"-->
    <!--    />-->
    <div class="inputs" v-if="control">
      <div class="name">
        <input
          class="matrixfont width_4"
          maxlength="4"
          v-model="control.name"
          title="Edit name of encoder/button"
          @focus="setNameActive(true, $event.target)"
          :tabindex="props.nameActive ? 0 : -1"
        />
      </div>
      <template v-if="props.activeField === 'number' && control.type === 'CCab'">
        <label>{{ t('ENCODER_NUMBER') }}</label>
        <input
          class="width_3"
          maxlength="3"
          v-model="control.number"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="props.activeField === 'number' && control.type === 'NRPN'">
        <label>{{ t('ENCODER_NUMBER_NRPN') }}</label>
        <div class="double-inputs">
          <input
            class="width_3"
            maxlength="3"
            v-model="control.number_h"
            @focus="setNameActive(false, $event.target)"
            :tabindex="props.nameActive ? -1 : 0"
          />
          <input
            class="width_3"
            maxlength="3"
            v-model="control.number"
            @focus="setNameActive(false, $event.target)"
            :tabindex="props.nameActive ? -1 : 0"
          />
        </div>
      </template>
      <template v-else-if="props.activeField === 'number' && control.type === 'Note'">
        <label>{{ t('ENCODER_NUMBER_NOTE') }}</label>
        <div class="note-inputs">
          <input class="width_3" v-model="control.number" maxlength="3" />
          <select
            class="width_2"
            v-model="control.number"
            @focus="setNameActive(false, $event.target)"
            :tabindex="props.nameActive ? -1 : 0"
          >
            <option v-for="n in noteOptions" :key="n.value" :value="n.value">{{ n.text }}</option>
          </select>
        </div>
      </template>
      <template v-else-if="props.activeField === 'channel'">
        <label>{{ t('ENCODER_CHANNEL') }}</label>
        <input
          class="width_2"
          :value="control.channel"
          @input="
            control.channel = $event.target.checkValidity()
              ? parseInt($event.target.value, 10)
              : control.channel
          "
          type="number"
          min="1"
          max="16"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="props.activeField === 'lower_limit'">
        <label>{{ t('ENCODER_LOWER') }}</label>
        <input
          class="width_4"
          v-model="control.lower"
          maxlength="4"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="props.activeField === 'upper_limit'">
        <label>{{ t('ENCODER_UPPER') }}</label>
        <input
          class="width_4"
          v-model="control.upper"
          maxlength="4"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="props.activeField === 'scale'">
        <label>{{ t('ENCODER_SCALE') }}</label>
        <ScaleSelector
          v-model="control.scale"
          @focus="setNameActive(false)"
          :tabindex="props.nameActive ? -1 : 0"
          :mode="props.mode"
        />
      </template>
      <template v-else-if="props.activeField === 'type'">
        <label> {{ t('ENCODER_TYPE') }}</label>
        <select
          v-model="control.type"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        >
          <option v-for="n in encoderTypes" :key="n.value" :value="n.short" :title="n.text">
            {{ n.short }}
          </option>
        </select>
      </template>
      <template v-else-if="props.activeField === 'mode'" class="mode">
        <label> {{ t('ENCODER_MODE') }}</label>
        <select
          v-model="control.mode"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        >
          <option v-for="n in modeOptions" :key="n.value" :value="n.value">{{ n.text }}</option>
        </select>
      </template>
      <!--      <div class="pb_channel">-->
      <!--        <label>{{ t('ENCODER_PB_CHANNEL') }}</label>-->
      <!--        <input-->
      <!--          data-watch="pb_channel"-->
      <!--          maxlength="2"-->
      <!--          type="text"-->
      <!--          value="0"-->
      <!--          tabindex="{{ 216 + index }}"-->
      <!--        />-->
      <!--      </div>-->
      <!--      <div class="pb_display">-->
      <!--        <label>{{ t('ENCODER_PB_DISPLAY') }}</label>-->
      <!--        <select data-watch="pb_display" tabindex="{{ 216 + index }}">-->
      <!--          <option>Off</option>-->
      <!--          <option>On</option>-->
      <!--        </select>-->
      <!--      </div>-->
      <!--      <div class="pb_number">-->
      <!--        <div class="pb_standard">-->
      <!--          <label>{{ t('ENCODER_PB_NUMBER') }}</label>-->
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
      <!--          <label>{{ t('ENCODER_NUMBER_NOTE') }}</label>-->
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
      <!--        <label>{{ t('ENCODER_PB_TYPE') }}</label>-->
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
      <!--        <label>{{ t('ENCODER_PB_MODE') }}</label>-->
      <!--        <select data-watch="pb_mode">-->
      <!--          <option>Key</option>-->
      <!--          <option>Togl</option>-->
      <!--        </select>-->
      <!--      </div>-->
      <!--      <div class="pb_lower">-->
      <!--        <label>{{ t('ENCODER_PB_LOWER') }}</label>-->
      <!--        <input-->
      <!--          data-watch="pb_lower"-->
      <!--          maxlength="3"-->
      <!--          type="text"-->
      <!--          value="0"-->
      <!--          tabindex="{{ 216 + index }}"-->
      <!--        />-->
      <!--      </div>-->
      <!--      <div class="pb_upper">-->
      <!--        <label>{{ t('ENCODER_PB_UPPER') }}</label>-->
      <!--        <input-->
      <!--          data-watch="pb_upper"-->
      <!--          maxlength="3"-->
      <!--          type="text"-->
      <!--          value="0"-->
      <!--          tabindex="{{ 216 + index }}"-->
      <!--        />-->
      <!--      </div>-->
    </div>
    <!--    <div class="link turn matrixfont" title="Link this encoder to next">-->
    <!--      <input type="checkbox" id="linkenc{{ index }}" data-watch="link" data-action="edit-link" />-->
    <!--      <label for="linkenc{{ index }}"><span>Link</span>&gt;</label>-->
    <!--    </div>-->
    <!--    <div class="link push matrixfont" title="Link this push button to next">-->
    <!--      <input-->
    <!--        type="checkbox"-->
    <!--        id="linkpb{{ index }}"-->
    <!--        data-watch="pb_link"-->
    <!--        data-action="edit-pb_link"-->
    <!--      />-->
    <!--      <label for="linkpb{{ index }}"><span>Link</span>&gt;</label>-->
    <!--    </div>-->
  </div>
</template>

<style scoped lang="scss">
@use '../assets/main.scss' as *;

.encoder-container {
  overflow: hidden;
  position: relative;

  .inputs {
    z-index: 10;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;

    display: grid;
    grid-template-rows: 1fr 1fr 1fr 1fr;
    align-items: center;
    justify-items: center;
    justify-content: center;

    label {
      text-transform: capitalize;
      color: $textColor;
    }

    input {
      background-color: transparent;
      color: $textColor;
      text-align: center;

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }

    .double-inputs {
      input {
        width: 1.2em;
        margin: 0 0.5em;
      }
    }

    select {
      width: 100%;
      text-align: center;
      background-color: transparent;
      color: $textColor;
    }
  }

  .width_2 {
    width: 1.2em;
  }
  .width_3 {
    width: 1.3em;
  }
  .width_4 {
    width: 2.6em;
  }

  $knob-size: 64px;
  .knob {
    z-index: 0;
    width: $knob-size;
    height: $knob-size;

    // Center the knob background
    margin: auto;
    border-radius: 50%;
    background-color: #222;
    box-shadow: 0 0 15px #777;
    border: 2px solid #000;
  }
}
</style>
