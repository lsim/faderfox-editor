<script lang="ts" setup>
import ScaleSelector from '@/components/ScaleSelector.vue';
import {
  type Control,
  type FieldType,
  encoderTypes,
  pushButtonTypes,
  encoderModes,
  pushButtonModes,
  encoderTypeByName,
  pushButtonTypeByName,
} from '@/domain/Encoder.ts';
import { computed, ref, type ComputedRef, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import NoteInput from '@/components/NoteInput.vue';

const { t } = useI18n();

const props = defineProps<{
  encoderId: number;
  activeField: FieldType;
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

watch(
  () => ec4.controlFocusRequests,
  (newCount) => {
    if (newCount <= 0 || props.encoderId !== ec4.selectedEncoderIndex) return;
    nextTick(() => {
      ec4.controlFocusRequests = 0;
      focusInput();
    });
  },
);

watch(
  () => ec4.activeBundle.id,
  () => {
    if (props.encoderId === ec4.selectedEncoderIndex) {
      focusInput();
    }
  },
);

// This governs tab order behavior
function setNameActive(newVal: boolean, source: any) {
  if (newVal !== props.nameActive) emit('update:name-active', newVal);
  if (typeof source?.select === 'function') source.select();
}

function toggleLink() {
  if (ec4.editorMode === 'turn') {
    control.value.link = !control.value.link;
  } else {
    control.value.pb_link = !control.value.pb_link;
  }
}
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
            maxlength="3"
            ref="encoderInput"
            v-model="control.number_h"
            @focus="setNameActive(false, $event.target)"
            :tabindex="props.nameActive ? -1 : 0"
          />
          <input
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
        <note-input
          class="note-input"
          v-model="control.number"
          ref="encoderInput"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="props.activeField === 'number'"> </template>
      <template
        v-else-if="
          props.activeField === 'pb_number' && control.pb_type !== pushButtonTypeByName('Note')
        "
      >
        <label>{{ t('ENCODER_NUMBER') }}</label>
        <input
          class="width_3"
          v-model="control.pb_number"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="props.activeField === 'pb_number'">
        <label>{{ t('ENCODER_NUMBER_NOTE') }}</label>
        <note-input
          class="note-input"
          v-model="control.pb_number"
          ref="encoderInput"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
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
      <template v-else-if="props.activeField === 'pb_channel'">
        <label>{{ t('ENCODER_CHANNEL') }}</label>
        <input
          class="width_3"
          :value="control.pb_channel"
          @input="
            control.pb_channel = ($event.target as HTMLInputElement).checkValidity()
              ? parseInt(($event.target as HTMLInputElement).value, 10)
              : control.pb_channel
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
      <template v-else-if="props.activeField === 'pb_lower'">
        <label>{{ t('ENCODER_LOWER') }}</label>
        <input
          class="width_4"
          v-model="control.pb_lower"
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
      <template v-else-if="props.activeField === 'pb_upper'">
        <label>{{ t('ENCODER_UPPER') }}</label>
        <input
          class="width_4"
          v-model="control.pb_upper"
          ref="encoderInput"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="props.activeField === 'scale'">
        <label>{{ t('ENCODER_SCALE') }}</label>
        <ScaleSelector
          v-model="control.scale"
          ref="encoderInput"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        />
      </template>
      <template v-else-if="props.activeField === 'pb_display'">
        <label>{{ t('ENCODER_SCALE') }}</label>
        <ScaleSelector
          v-model="control.pb_display"
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
          <option v-for="n in encoderTypes" :key="n.value" :value="n.value" :title="n.text">
            {{ n.short }}
          </option>
        </select>
      </template>
      <template v-else-if="props.activeField === 'pb_type'">
        <label>{{ t('ENCODER_TYPE') }}</label>
        <select
          v-model="control.pb_type"
          ref="encoderInput"
          @focus="setNameActive(false, $event.target)"
          :tabindex="props.nameActive ? -1 : 0"
        >
          <option v-for="n in pushButtonTypes" :key="n.value" :value="n.value" :title="n.text">
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
      <template v-else-if="props.activeField === 'pb_mode'">
        <label>{{ t('ENCODER_MODE') }}</label>
        <select
          v-model="control.pb_mode"
          @focus="setNameActive(false, $event.target)"
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
        text-align: center;
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

      cursor: pointer;
    }
  }

  .width_3 {
    width: 2.3em;
  }
  .width_4 {
    width: 4em;
  }

  $knob-size: 55px;
  .knob {
    z-index: 0;
    position: absolute;
    top: 10px;
    left: 0;
    bottom: 0;
    right: 0;
    width: $knob-size;
    height: $knob-size;

    // Center the knob background
    margin: auto;
    border-radius: 50%;
    background-color: #222;
    box-shadow: 0 0 15px #777;
    border: 2px solid #000;
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
      bottom: 0;
      width: 35px;
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
      color: rgba(255, 255, 255, 0.5);
      content: '↻';

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
