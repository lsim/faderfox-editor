<script lang="ts" setup>
import ScaleSelector from '@/components/ScaleSelector.vue';
import {
  type Encoder,
  type FieldType,
  encoderTypes,
  pushbuttonTypes,
  encoderModes,
  encoderTypeByName,
} from '@/domain/Encoder.ts';
import { EncoderGroup } from '@/domain/EncoderGroup.ts';
import { computed, ref, type ComputedRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';

const { t } = useI18n();

const props = defineProps<{
  encoderId: number;
  activeField: FieldType;
  nameActive: boolean;
  selected: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:name-active', nameActive: boolean): void;
}>();

const ec4 = useEc4Store();

const control: ComputedRef<Encoder | null> = computed(() => {
  const group = ec4.encoderGroups.find((g: EncoderGroup) => g.id === ec4.selectedGroupIndex);
  const controls = ec4.editorMode === 'turn' ? group?.encoders : group?.pushButtons;
  return controls?.find((e: Encoder) => e.id === props.encoderId) || null;
});

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const nameInput = ref<HTMLInputElement | null>(null);

function noteToObject(n: number) {
  const name = noteNames[n % 12];
  const octave = Math.round(n / 12) - 2;
  return {
    text: `${name} ${octave || ''}`,
    value: n,
  };
}

const encoderInput = ref<HTMLInputElement | null>(null);

// Encoders have one set of options, push buttons have another
const typeOptions = computed(() => {
  switch (ec4.editorMode) {
    case 'turn':
      return encoderTypes;
    case 'push':
      return pushbuttonTypes;
    default:
      throw Error('Unknown editor mode ' + ec4.editorMode);
  }
});

function focusInput() {
  if (!props.selected) return;
  if (props.nameActive) {
    nameInput.value?.focus();
  } else {
    encoderInput.value?.focus();
  }
}

watch(
  () => ec4.appFocused,
  (focused) => {
    if (!focused) return;
    focusInput();
  },
);

// Focus the input of the new selected encoder (depending on the nameActive props)
watch(
  () => props.selected,
  (newVal) => {
    if (newVal) focusInput();
  },
);

// From C-2 to G-8
const noteOptions = ref([...Array(128).keys()].map((n) => noteToObject(n)));

// This governs tab order behavior
function setNameActive(newVal: boolean, source: any) {
  if (newVal != props.nameActive) emit('update:name-active', newVal);
  if (typeof source?.select === 'function') source.select();
}
</script>

<template>
  <div class="enc typed encoder-container">
    <div class="knob"></div>
    <div class="inputs" v-if="control">
      <div class="name">
        <input
          ref="nameInput"
          class="matrix_font name"
          maxlength="4"
          v-model="control.name"
          title="Edit name of encoder/button"
          @focus="setNameActive(true, $event.target)"
          :tabindex="props.nameActive ? 0 : -1"
        />
      </div>
      <template v-if="props.activeField === 'number' && control.type === encoderTypeByName('CCab')">
        <label>{{ t('ENCODER_NUMBER') }}</label>
        <input
          class="width_3"
          maxlength="3"
          ref="encoderInput"
          v-model="control.number"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template
        v-else-if="props.activeField === 'number' && control.type === encoderTypeByName('NRPN')"
      >
        <label>{{ t('ENCODER_NUMBER_NRPN') }}</label>
        <div class="double-inputs">
          <input
            class="width_3"
            maxlength="3"
            ref="encoderInput"
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
      <template
        v-else-if="props.activeField === 'number' && control.type === encoderTypeByName('Note')"
      >
        <label>{{ t('ENCODER_NUMBER_NOTE') }}</label>
        <span class="note-inputs"
          ><input
            class="width_3"
            v-model="control.number"
            ref="encoderInput"
            maxlength="3"
            @focus="setNameActive(false, $event.target)"
          /><select
            class="width_3"
            v-model="control.number"
            @focus="setNameActive(false, $event.target)"
            :tabindex="props.nameActive ? -1 : 0"
          >
            <option v-for="n in noteOptions" :key="n.value" :value="n.value">{{ n.text }}</option>
          </select>
        </span>
      </template>
      <template v-else-if="props.activeField === 'number'"> </template>
      <template v-else-if="props.activeField === 'channel'">
        <label>{{ control.type === 6 ? t('ENCODER_GROUP') : t('ENCODER_CHANNEL') }}</label>
        <input
          class="width_3"
          :value="control.channel"
          @input="
            control.channel = ($event.target as HTMLInputElement).checkValidity()
              ? parseInt(($event.target as HTMLInputElement).value, 10)
              : control.channel
          "
          type="number"
          min="1"
          max="16"
          ref="encoderInput"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="props.activeField === 'lower'">
        <label>{{ t('ENCODER_LOWER') }}</label>
        <input
          class="width_4"
          v-model="control.lower"
          maxlength="4"
          ref="encoderInput"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="props.activeField === 'upper'">
        <label>{{ t('ENCODER_UPPER') }}</label>
        <input
          class="width_4"
          v-model="control.upper"
          maxlength="4"
          ref="encoderInput"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="props.activeField === 'scale'">
        <label>{{ t('ENCODER_SCALE') }}</label>
        <ScaleSelector
          :model-value="control.scale || 0"
          @update:modelValue="control.scale = $event"
          ref="encoderInput"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="props.activeField === 'type'">
        <label> {{ t('ENCODER_TYPE') }}</label>
        <select
          v-model="control.type"
          ref="encoderInput"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        >
          <option v-for="n in typeOptions" :key="n.value" :value="n.value" :title="n.text">
            {{ n.short }}
          </option>
        </select>
      </template>
      <template v-else-if="props.activeField === 'mode'" class="mode">
        <label> {{ t('ENCODER_MODE') }}</label>
        <select
          v-model="control.mode"
          @focus="setNameActive(false, $event.target)"
          ref="encoderInput"
          :tabindex="props.nameActive ? -1 : 0"
        >
          <option v-for="n in encoderModes" :key="n.value" :value="n.value">{{ n.text }}</option>
        </select>
      </template>
      <template v-else>
        <div></div>
        <div></div>
      </template>

      <img
        v-if="ec4.editorMode === 'push'"
        src="../assets/tap-svgrepo-com.svg"
        width="24px"
        class="tapicon clickable"
        title="Push button mode (click to toggle)"
        alt="Push button mode (click to toggle)"
        @click.capture="ec4.setEditorMode('turn')"
      />
      <img
        v-if="ec4.editorMode === 'turn'"
        src="../assets/rotate-svgrepo-com.svg"
        width="24px"
        class="rotateicon clickable"
        title="Turn mode (click to toggle)"
        alt="Turn mode (click to toggle)"
        @click.capture="ec4.setEditorMode('push')"
      />

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
@use '@picocss/pico/scss/colors/index.scss' as *;

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

    .note-inputs {
      display: flex;
      flex-direction: row;
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

      &.name {
        background-color: $active-field-color;
        color: $yellow;
        border-style: none;
        width: 3.3em;
        &:focus {
          margin-top: -1px;
        }
        box-sizing: border-box;
        text-align: center;
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

  .width_3 {
    width: 2.3em;
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
