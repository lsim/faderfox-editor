<script lang="ts" setup>
import ScaleSelector from '@/components/ScaleSelector.vue';
import {
  type Control,
  encoderTypes,
  pushButtonTypes,
  encoderModes,
  pushButtonModes,
  encoderTypeByName,
  pushButtonTypeByName,
} from '@/domain/Encoder.ts';
import { computed, ref, type ComputedRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import NoteInput from '@/components/NoteInput.vue';
import ChannelInput from '@/components/ChannelInput.vue';

const { t } = useI18n();

const props = defineProps<{
  encoderId: number;
  nameActive: boolean;
  selected: boolean;
}>();

const emit = defineEmits<(event: 'update:name-active', nameActive: boolean) => void>();

const ec4 = useEc4Store();

const control: ComputedRef<Control> = computed(() => {
  return ec4.selectedGroup.controls[props.encoderId];
});

const nameInput = ref<HTMLInputElement | null>(null);
const encoderInput = ref<HTMLInputElement | null>(null);

function focusInput() {
  if (!props.selected) return;
  const x = window.scrollX;
  const y = window.scrollY;
  if (props.nameActive) {
    nameInput.value?.focus();
  } else {
    encoderInput.value?.focus();
  }
  window.scrollTo(x, y);
}

watch(
  () => ec4.appFocused,
  (focused) => {
    if (!focused || !props.selected) return;
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

watch(
  () => ec4.activeBundleId,
  () => {
    if (props.encoderId === ec4.selectedEncoderIndex) {
      focusInput();
    }
  },
);

// This governs tab order behavior
function setNameActive(newVal: boolean, source: Event) {
  if (newVal !== props.nameActive) emit('update:name-active', newVal);
  const target = source.target as HTMLInputElement;
  if (typeof target?.select === 'function') target.select();
}

function toggleLink() {
  if (ec4.editorMode === 'turn') {
    control.value.link = !control.value.link;
  } else {
    control.value.pb_link = !control.value.pb_link;
  }
}

// Input validation handlers based on reference implementation checkValue logic
function handleNumberInput(e: Event) {
  const asNumber = parseInt((e.target as HTMLInputElement).value || '0', 10);
  let value = isNaN(asNumber) ? 0 : asNumber;

  // CC14bit (CCAh) number field has max 31 when data-type=4
  if (control.value.numbers.type === encoderTypeByName('CCAh') && value > 31) {
    value = 31;
  }

  // Standard 7-bit range for most number fields
  if (value < 0) value = 0;
  else if (value > 127) value = 127;

  control.value.numbers.number = value;
}

function handleNumberHInput(e: Event) {
  const asNumber = parseInt((e.target as HTMLInputElement).value || '0', 10);
  let value = isNaN(asNumber) ? 0 : asNumber;

  // NRPN high byte: 0-127 range
  if (value < 0) value = 0;
  else if (value > 127) value = 127;

  control.value.numbers.number_h = value;
}

function handlePbNumberInput(e: Event) {
  const asNumber = parseInt((e.target as HTMLInputElement).value || '0', 10);
  let value = isNaN(asNumber) ? 0 : asNumber;

  // Standard 7-bit range for pushbutton number fields
  if (value < 0) value = 0;
  else if (value > 127) value = 127;

  control.value.numbers.pb_number = value;
}

function handleLowerInput(e: Event) {
  const asNumber = parseInt((e.target as HTMLInputElement).value || '0', 10);
  let value = isNaN(asNumber) ? 0 : asNumber;

  // High-resolution range: 0-4094 or 16383
  if (value < 0) {
    value = 0;
  } else if (value > 4094) {
    value = 16383;
  }

  control.value.numbers.lower = value;
}

function handleUpperInput(e: Event) {
  const asNumber = parseInt((e.target as HTMLInputElement).value || '0', 10);
  let value = isNaN(asNumber) ? 0 : asNumber;

  // High-resolution range: 0-4094 or 16383
  if (value < 0) {
    value = 0;
  } else if (value > 4094) {
    value = 16383;
  }

  control.value.numbers.upper = value;
}

function handlePbLowerInput(e: Event) {
  const asNumber = parseInt((e.target as HTMLInputElement).value || '0', 10);
  let value = isNaN(asNumber) ? 0 : asNumber;

  // Standard 7-bit range for pushbutton lower
  if (value < 0) value = 0;
  else if (value > 127) value = 127;

  control.value.numbers.pb_lower = value;
}

function handlePbUpperInput(e: Event) {
  const asNumber = parseInt((e.target as HTMLInputElement).value || '0', 10);
  let value = isNaN(asNumber) ? 0 : asNumber;

  // Standard 7-bit range for pushbutton upper
  if (value < 0) value = 0;
  else if (value > 127) value = 127;

  control.value.numbers.pb_upper = value;
}

defineExpose({
  focusInput,
});
</script>

<template>
  <div
    class="encoder-container"
    v-if="control"
    :class="{ push: ec4.editorMode === 'push', turn: ec4.editorMode === 'turn', active: selected }"
  >
    <div class="knob"></div>
    <div class="inputs">
      <div class="name">
        <input
          ref="nameInput"
          class="matrix_font name"
          maxlength="4"
          v-model="control.name"
          title="Edit name of encoder/button"
          @focus="setNameActive(true, $event)"
          :tabindex="props.nameActive ? 0 : -1"
        />
      </div>
      <template
        v-if="ec4.activeField === 'number' && control.numbers.type === encoderTypeByName('CCab')"
      >
        <label>{{ t('ENCODER_NUMBER') }}</label>
        <input
          class="width_3"
          maxlength="3"
          ref="encoderInput"
          type="number"
          :value="control.numbers.number"
          @input="handleNumberInput"
          @focus="setNameActive(false, $event)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template
        v-else-if="
          ec4.activeField === 'number' && control.numbers.type === encoderTypeByName('CCAh')
        "
      >
        <label>{{ t('ENCODER_NUMBER') }}</label>
        <input
          class="width_3"
          maxlength="5"
          ref="encoderInput"
          type="number"
          :value="control.numbers.number"
          @input="handleNumberInput"
          @focus="setNameActive(false, $event)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template
        v-else-if="
          ec4.activeField === 'number' && control.numbers.type === encoderTypeByName('NRPN')
        "
      >
        <label>{{ t('ENCODER_NUMBER_NRPN') }}</label>
        <div class="double-inputs">
          <input
            maxlength="3"
            ref="encoderInput"
            :value="control.numbers.number_h"
            @input="handleNumberHInput"
            type="number"
            @focus="setNameActive(false, $event)"
            :tabindex="props.nameActive ? -1 : 0"
          />
          <input
            maxlength="3"
            :value="control.numbers.number"
            @input="handleNumberInput"
            type="number"
            @focus="setNameActive(false, $event)"
            :tabindex="props.nameActive ? -1 : 0"
          />
        </div>
      </template>
      <template
        v-else-if="
          ec4.activeField === 'number' && control.numbers.type === encoderTypeByName('Note')
        "
      >
        <label>{{ t('ENCODER_NUMBER_NOTE') }}</label>
        <note-input
          class="note-input"
          v-model="control.numbers.number"
          ref="encoderInput"
          @focus="setNameActive(false, $event)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="ec4.activeField === 'number'"> </template>
      <template
        v-else-if="
          ec4.activeField === 'pb_number' &&
          control.numbers.pb_type !== pushButtonTypeByName('Note')
        "
      >
        <label>{{ t('ENCODER_NUMBER') }}</label>
        <input
          class="width_3"
          :value="control.numbers.pb_number"
          @input="handlePbNumberInput"
          type="number"
          @focus="setNameActive(false, $event)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="ec4.activeField === 'pb_number'">
        <label>{{ t('ENCODER_NUMBER_NOTE') }}</label>
        <note-input
          class="note-input"
          v-model="control.numbers.pb_number"
          ref="encoderInput"
          @focus="setNameActive(false, $event)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="ec4.activeField === 'channel'">
        <label>{{ control.numbers.type === 6 ? t('ENCODER_GROUP') : t('ENCODER_CHANNEL') }}</label>
        <channel-input
          v-model="control.numbers.channel"
          @focus="setNameActive(false, $event)"
          ref="encoderInput"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="ec4.activeField === 'pb_channel'">
        <label>{{ t('ENCODER_CHANNEL') }}</label>
        <channel-input
          v-model="control.numbers.pb_channel"
          @focus="setNameActive(false, $event)"
          ref="encoderInput"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="ec4.activeField === 'lower'">
        <label>{{ t('ENCODER_LOWER') }}</label>
        <input
          class="width_4"
          :value="control.numbers.lower"
          @input="handleLowerInput"
          maxlength="4"
          ref="encoderInput"
          type="number"
          @focus="setNameActive(false, $event)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="ec4.activeField === 'pb_lower'">
        <label>{{ t('ENCODER_LOWER') }}</label>
        <input
          class="width_4"
          :value="control.numbers.pb_lower"
          @input="handlePbLowerInput"
          ref="encoderInput"
          type="number"
          @focus="setNameActive(false, $event)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="ec4.activeField === 'upper'">
        <label>{{ t('ENCODER_UPPER') }}</label>
        <input
          class="width_4"
          :value="control.numbers.upper"
          @input="handleUpperInput"
          maxlength="4"
          ref="encoderInput"
          type="number"
          @focus="setNameActive(false, $event)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="ec4.activeField === 'pb_upper'">
        <label>{{ t('ENCODER_UPPER') }}</label>
        <input
          class="width_4"
          :value="control.numbers.pb_upper"
          @input="handlePbUpperInput"
          ref="encoderInput"
          type="number"
          @focus="setNameActive(false, $event)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="ec4.activeField === 'scale'">
        <label>{{ t('ENCODER_SCALE') }}</label>
        <scale-selector
          v-model="control.numbers.scale"
          ref="encoderInput"
          @focus="setNameActive(false, $event)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="ec4.activeField === 'pb_display'">
        <label>{{ t('ENCODER_SCALE') }}</label>
        <scale-selector
          v-model="control.numbers.pb_display"
          ref="encoderInput"
          @focus="setNameActive(false, $event)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="ec4.activeField === 'type'">
        <label> {{ t('ENCODER_TYPE') }}</label>
        <select
          v-model="control.numbers.type"
          ref="encoderInput"
          @focus="setNameActive(false, $event)"
          :tabindex="props.nameActive ? -1 : 0"
        >
          <option v-for="n in encoderTypes" :key="n.value" :value="n.value" :title="n.text">
            {{ n.short }}
          </option>
        </select>
      </template>
      <template v-else-if="ec4.activeField === 'pb_type'">
        <label>{{ t('ENCODER_TYPE') }}</label>
        <select
          v-model="control.numbers.pb_type"
          ref="encoderInput"
          @focus="setNameActive(false, $event)"
          :tabindex="props.nameActive ? -1 : 0"
        >
          <option v-for="n in pushButtonTypes" :key="n.value" :value="n.value" :title="n.text">
            {{ n.short }}
          </option>
        </select>
      </template>
      <template v-else-if="ec4.activeField === 'mode'">
        <label> {{ t('ENCODER_MODE') }}</label>
        <select
          v-model="control.numbers.mode"
          @focus="setNameActive(false, $event)"
          ref="encoderInput"
          :tabindex="props.nameActive ? -1 : 0"
        >
          <option v-for="n in encoderModes" :key="n.value" :value="n.value">{{ n.text }}</option>
        </select>
      </template>
      <template v-else-if="ec4.activeField === 'pb_mode'">
        <label>{{ t('ENCODER_MODE') }}</label>
        <select
          v-model="control.numbers.pb_mode"
          @focus="setNameActive(false, $event)"
          ref="encoderInput"
          :tabindex="props.nameActive ? -1 : 0"
        >
          <option v-for="n in pushButtonModes" :key="n.value" :value="n.value">{{ n.text }}</option>
        </select>
      </template>
      <template v-else>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
      </template>
      <div
        class="link-next"
        :class="{
          active:
            (ec4.editorMode === 'turn' && control.link) ||
            (ec4.editorMode === 'push' && control.pb_link),
        }"
      >
        <a href="#" @click.prevent="toggleLink" tabindex="-1">Link</a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/main.scss' as *;
@use '@picocss/pico/scss/colors/index.scss' as *;

.encoder-container {
  overflow: hidden;
  position: relative;
  padding: 3px;

  .inputs {
    z-index: 1;
    position: relative;

    display: grid;
    grid-template-rows: 1fr 1fr 1fr 1fr;
    grid-template-columns: calc(100% - 6px);
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

      &.name {
        background-color: $active-field-color;
        color: $yellow;
        border-style: none;
        width: 3.3em;
        &:focus {
          margin-top: -1px;
        }
        box-sizing: border-box;
        text-align: left;
      }
    }

    .double-inputs {
      display: flex;
      justify-content: space-between;
      input {
        width: 3em;
      }
    }

    select {
      width: 100%;
      text-align: center;
      background-color: transparent;
      color: $textColor;
    }

    .link-next {
      text-transform: uppercase;
      ::before {
        content: '';
        position: absolute;
        border-right: 2px solid $yellow-600;
        height: 100%;
        right: -0.8em;
        bottom: 0.8em;
      }
      ::after {
        content: '→';
        position: absolute;
        font-size: 2em;
        right: -0.5em;
        bottom: 0;
      }
      margin-right: 1em;
      position: absolute;
      right: 0;
      bottom: 0;
      font-size: 0.6em;
      color: $yellow-600;
      cursor: pointer;

      &.active {
        color: $yellow-100;
        ::before {
          border: none;
        }
        ::after {
          animation: pulse 3s infinite;
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(0.9);
            }
            100% {
              transform: scale(1);
            }
          }
        }
      }
      a {
        color: inherit;
        text-decoration: none;
      }
    }
  }

  .width_3 {
    width: 2.3em;
  }
  .width_4 {
    width: 4em;
  }

  $knob-size: 3.2em;
  .knob {
    z-index: 0;
    position: absolute;
    top: 1.1em;
    left: 0;
    bottom: 0;
    right: 0;
    width: $knob-size;
    height: $knob-size;

    // Center the knob background
    margin: auto;
    border-radius: 50%;
    background-color: #222;
    box-shadow: 0 0 1.1em #777;
    border: 2px solid $black;
  }

  &.active {
    &::before {
      position: absolute;
      z-index: 0;
      bottom: 0;
      left: 0;
      line-height: 100%;
      font-size: 2em;
    }
    &.push::before {
      content: '\00a0';
      left: 0;
      bottom: 0.2em;
      width: 0.9em;
      background-image: url(../assets/tap-svgrepo-com.svg);
      background-size: 100% 100%;
      background-repeat: no-repeat;
      rotate: 45deg;

      animation: click 0.5s;

      @keyframes click {
        0% {
          transform: translateY(0);
        }
        20% {
          transform: translateY(3px);
        }
        60% {
          transform: translateY(-3px);
        }
        100% {
          transform: translate(0, 0);
        }
      }
    }
    &.turn::before {
      color: rgba($white, 0.5);
      content: '↻';
      bottom: 0.1em;

      animation: turn 0.5s;

      @keyframes turn {
        0% {
          rotate: 0deg;
        }
        100% {
          rotate: 360deg;
        }
      }
    }
  }
}
</style>
