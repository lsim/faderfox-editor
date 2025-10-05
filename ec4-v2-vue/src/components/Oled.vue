<script setup lang="ts">
import ScaleSelector from '@/components/ScaleSelector.vue';
import {
  type FieldType,
  encoderTypes,
  pushButtonTypes,
  type Control,
  encoderModes,
  encoderTypeByName,
  pushButtonTypeByName,
  pushButtonModes,
} from '@/domain/Encoder';
import { computed, type ComputedRef, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import { onKeyStroke } from '@vueuse/core';
import NoteInput from '@/components/NoteInput.vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NumberInput from '@/components/NumberInput.vue';
import useUiRules from '@/composables/ui-rules.ts';

const { t } = useI18n();

const props = defineProps<{
  encoderId: number;
  groupId: number;
}>();

const ec4 = useEc4Store();

const control: ComputedRef<Control> = computed(() => {
  const group = ec4.encoderGroups[props.groupId];
  return group.controls[props.encoderId];
});

function isInput(input: EventTarget | null): input is HTMLInputElement {
  return (input as HTMLElement | null)?.nodeName === 'INPUT';
}

function setActiveField(field: FieldType, input: EventTarget | null) {
  ec4.activeField = field;
  // Select all the text in the input field for easier editing
  let inputToSelect = input;
  if (!isInput(inputToSelect))
    inputToSelect = (input as Element | null)?.querySelector('input') || null;
  if (!isInput(inputToSelect)) focusActiveField();
  else inputToSelect?.select?.();
}

const nameInput = ref<HTMLInputElement | null>(null);
const channelInput = ref<HTMLInputElement | null>(null);
const scaleInput = ref<HTMLInputElement | null>(null);
const numberInput = ref<HTMLInputElement | null>(null);
const lowerLimitInput = ref<HTMLInputElement | null>(null);
const upperLimitInput = ref<HTMLInputElement | null>(null);
const modeSelect = ref<HTMLSelectElement | null>(null);

const pbChannelInput = ref<HTMLInputElement | null>(null);
const pbDisplayInput = ref<HTMLInputElement | null>(null);
const pbLowerLimitInput = ref<HTMLInputElement | null>(null);
const pbUpperLimitInput = ref<HTMLInputElement | null>(null);
const pbModeSelect = ref<HTMLSelectElement | null>(null);
const pbTypeSelect = ref<HTMLSelectElement | null>(null);
const pbNumberInput = ref<HTMLInputElement | null>(null);

function doWithActiveField(f: (elm: HTMLElement | null) => void) {
  if (ec4.activeField === 'name') {
    f(channelInput.value);
  } else if (ec4.activeField === 'channel') {
    f(channelInput.value);
  } else if (ec4.activeField === 'scale') {
    f(scaleInput.value);
  } else if (ec4.activeField === 'number') {
    f(numberInput.value);
  } else if (ec4.activeField === 'lower') {
    f(lowerLimitInput.value);
  } else if (ec4.activeField === 'upper') {
    f(upperLimitInput.value);
  } else if (ec4.activeField === 'mode') {
    f(modeSelect.value);
  } else if (ec4.activeField === 'pb_channel') {
    f(pbChannelInput.value);
  } else if (ec4.activeField === 'pb_display') {
    f(pbDisplayInput.value);
  } else if (ec4.activeField === 'pb_lower') {
    f(pbLowerLimitInput.value);
  } else if (ec4.activeField === 'pb_upper') {
    f(pbUpperLimitInput.value);
  } else if (ec4.activeField === 'pb_mode') {
    f(pbModeSelect.value);
  } else if (ec4.activeField === 'pb_number') {
    f(pbNumberInput.value);
  } else if (ec4.activeField === 'pb_type') {
    f(pbTypeSelect.value);
  }
}

function focusActiveField() {
  doWithActiveField((elm) => elm?.focus?.());
}

const { isHidden, getLimitRanges, getNumberLSBRanges } = useUiRules();

const pbChannelLabel = computed(() => {
  switch (control.value.numbers.pb_type) {
    case pushButtonTypeByName('Grp'):
      return t('OLED_GROUP');
    case pushButtonTypeByName('Set'):
      return t('OLED_SET');
    default:
      return t('OLED_CHANNEL');
  }
});

const ctrlIds = computed(() => {
  const prefix = ec4.editorMode === 'turn' ? 'EC' : 'PB';
  return Array.from(Array(16).keys()).map((i) => `${prefix}${(i + 1).toString().padStart(2, '0')}`);
});

// When control.numbers.type changes, we may need to change the active field as it may no longer be valid
watch(
  () => control.value.numbers.type,
  () => {
    if (isHidden(ec4.activeField, control.value)) {
      setActiveField('name', nameInput.value);
    }
  },
);

onKeyStroke('End', (e) => {
  if (!e.altKey || !e.shiftKey) return;
  focusActiveField();
});
</script>

<template>
  <div id="oled" class="oled typed matrix_font">
    <!-- Selected control id -->
    <label for="encoderId" :class="{ 'active-field': ec4.activeField === 'name' }"
      >{{ t('OLED_ENCODER_ID') }}:</label
    >
    <select v-model="ec4.selectedEncoderIndex" id="encoderId">
      <option v-for="(id, idx) in ctrlIds" :key="id" :value="idx">
        {{ id }}
      </option>
    </select>
    <!-- Encoder channel -->
    <template v-if="ec4.editorMode === 'turn'">
      <label
        for="encoderChannel"
        :class="{
          'active-field': ec4.activeField.includes('channel'),
          hidden: isHidden('channel', control),
        }"
        >{{ t('OLED_CHANNEL') }}:</label
      >
      <number-input
        ref="channelInput"
        class="width_3"
        v-model="control.numbers.channel"
        :ranges="[{ from: 1, to: 16 }]"
        @focus="setActiveField('channel', $event.target)"
        :class="{ hidden: isHidden('channel', control) }"
      />
    </template>
    <template v-else>
      <label
        for="pbChannel"
        :class="{
          'active-field': ec4.activeField === 'pb_channel',
          hidden: isHidden('pb_channel', control),
        }"
        >{{ pbChannelLabel }}:</label
      >
      <number-input
        ref="pbChannelInput"
        class="width_3"
        v-model="control.numbers.pb_channel"
        :ranges="[{ from: 1, to: 16 }]"
        @focus="setActiveField('pb_channel', $event.target)"
        :class="{ hidden: isHidden('pb_channel', control) }"
      />
    </template>
    <!-- Encoder display -->
    <label
      for="encoderScale"
      :class="{
        'active-field': ec4.activeField === 'scale' || ec4.activeField === 'pb_display',
        hidden: isHidden('scale', control) || isHidden('pb_display', control),
      }"
      >{{ t('OLED_DISPLAY') }}:</label
    >
    <ScaleSelector
      v-if="ec4.editorMode === 'turn'"
      :model-value="control.numbers.scale"
      @update:modelValue="control.numbers.scale = $event"
      :abbreviated="true"
      id="encoderScale"
      ref="scaleInput"
      @focus="setActiveField('scale', $event.target)"
      :class="{ hidden: isHidden('scale', control) }"
    />
    <ScaleSelector
      v-else
      :model-value="control.numbers.pb_display"
      @update:modelValue="control.numbers.pb_display = $event"
      :abbreviated="true"
      id="encoderScale"
      ref="pbDisplayInput"
      @focus="setActiveField('pb_display', $event.target)"
      :class="{ hidden: isHidden('pb_display', control) }"
    />
    <!-- Encoder number/address/note -->
    <template v-if="ec4.editorMode === 'turn'">
      <template v-if="control.numbers.type === encoderTypeByName('NRPN')">
        <label
          for="encoderNumber"
          :class="{
            'active-field': ec4.activeField === 'number',
            hidden: isHidden('number', control),
          }"
          >{{ t('OLED_NUMBER') }}:</label
        >
        <span class="two-inputs" :class="{ hidden: isHidden('number', control) }">
          <!-- MSB -->
          <number-input
            id="encoderNumber"
            ref="numberInput"
            maxlength="3"
            v-model="control.numbers.number_h"
            :ranges="[{ from: 0, to: 127 }]"
            @focus="setActiveField('number', $event.target)"
          />
          <!-- LSB -->
          <number-input
            maxlength="3"
            v-model="control.numbers.number"
            :ranges="getNumberLSBRanges(control.numbers.type)"
            @focus="setActiveField('number', $event.target)"
          />
        </span>
      </template>
      <template v-else-if="control.numbers.type === encoderTypeByName('Note')">
        <label
          :class="{
            'active-field': ec4.activeField === 'number',
            hidden: isHidden('number', control),
          }"
          @click="setActiveField('number', $event.target)"
          >{{ t('OLED_NUMBER') }}:</label
        >
        <note-input
          ref="pbNumberInput"
          v-model="control.numbers.number"
          :class="{ hidden: isHidden('number', control) }"
          class="note-input"
          @focus="setActiveField('number', $event.target)"
        />
      </template>

      <template v-else
        ><!-- Not NRPN or Note -->
        <label
          for="encoderNumber"
          :class="{
            'active-field': ec4.activeField === 'number',
            hidden: isHidden('number', control),
          }"
          >{{ t('OLED_NUMBER') }}:</label
        >
        <number-input
          id="encoderNumber"
          ref="numberInput"
          maxlength="3"
          v-model="control.numbers.number"
          :ranges="getNumberLSBRanges(control.numbers.type)"
          @focus="setActiveField('number', $event.target)"
          :class="{ hidden: isHidden('number', control) }"
        />
      </template>
    </template>
    <template v-else>
      <template v-if="control.numbers.pb_type === pushButtonTypeByName('Note')">
        <label
          :class="{
            'active-field': ec4.activeField === 'pb_number',
            hidden: isHidden('pb_number', control),
          }"
          @click="setActiveField('pb_number', $event.target)"
          >{{ t('OLED_NUMBER') }}:</label
        >
        <note-input
          ref="pbNumberInput"
          v-model="control.numbers.pb_number"
          :class="{ hidden: isHidden('pb_number', control) }"
          class="note-input"
          @focus="setActiveField('pb_number', $event.target)"
        />
      </template>
      <template v-else>
        <label
          for="encoderNumber"
          :class="{
            'active-field': ec4.activeField === 'pb_number',
            hidden: isHidden('pb_number', control),
          }"
          >{{ t('OLED_NUMBER') }}:</label
        >
        <number-input
          id="encoderNumber"
          ref="pbNumberInput"
          v-model="control.numbers.pb_number"
          :ranges="[{ from: 0, to: 127 }]"
          :class="{ hidden: isHidden('pb_number', control) }"
          @focus="setActiveField('pb_number', $event.target)"
        />
      </template>
    </template>

    <!-- Encoder type -->
    <label
      for="encoderType"
      :class="{ 'active-field': ec4.activeField === 'type' || ec4.activeField === 'pb_type' }"
      >{{ t('OLED_TYPE') }}:</label
    >
    <template v-if="ec4.editorMode === 'turn'">
      <select
        id="encoderType"
        v-model="control.numbers.type"
        @focus="setActiveField('type', $event.target)"
        ref="typeSelect"
      >
        <option v-for="n in encoderTypes" :key="n.value" :value="n.value" :title="n.text">
          {{ n.short }}
        </option>
      </select>
    </template>
    <template v-else>
      <select
        id="encoderType"
        v-model="control.numbers.pb_type"
        @focus="setActiveField('pb_type', $event.target)"
        ref="pbTypeSelect"
      >
        <option v-for="n in pushButtonTypes" :key="n.value" :value="n.value" :title="n.text">
          {{ n.short }}
        </option>
      </select>
    </template>
    <!-- Lower limit -->
    <template v-if="ec4.editorMode === 'turn'">
      <label
        for="encoderLowerLimit"
        :class="{
          'active-field': ec4.activeField === 'lower',
          hidden: isHidden('lower', control),
        }"
        >{{ t('OLED_LOWER') }}:</label
      >
      <number-input
        id="encoderLowerLimit"
        ref="lowerLimitInput"
        v-model="control.numbers.lower"
        :ranges="getLimitRanges(control.numbers.type, control.numbers.scale)"
        @focus="setActiveField('lower', $event.target)"
        :class="{ hidden: isHidden('lower', control) }"
        type="number"
      />
    </template>
    <template v-else>
      <label
        for="encoderLowerLimit"
        :class="{
          'active-field': ec4.activeField === 'pb_lower',
          hidden: isHidden('pb_lower', control),
        }"
        >{{ t('OLED_LOWER') }}:</label
      >
      <number-input
        id="encoderLowerLimit"
        ref="pbLowerLimitInput"
        v-model="control.numbers.pb_lower"
        :ranges="[{ from: 0, to: 127 }]"
        @focus="setActiveField('pb_lower', $event.target)"
        :class="{ hidden: isHidden('pb_lower', control) }"
        type="number"
      />
    </template>
    <!-- Encoder mode -->
    <template v-if="ec4.editorMode === 'turn'">
      <label
        for="encoderMode"
        :class="{
          'active-field': ec4.activeField === 'mode',
          hidden: isHidden('mode', control),
        }"
        >{{ t('OLED_MODE') }}:</label
      >
      <select
        id="encoderMode"
        v-model="control.numbers.mode"
        @focus="setActiveField('mode', $event.target)"
        ref="modeSelect"
        :class="{ hidden: isHidden('mode', control) }"
      >
        <option v-for="n in encoderModes" :key="n.value" :value="n.value" :title="n.long">
          {{ n.text }}
        </option>
      </select>
    </template>
    <template v-else>
      <label
        for="encoderMode"
        :class="{
          'active-field': ec4.activeField === 'pb_mode',
          hidden: isHidden('pb_mode', control),
        }"
        >{{ t('OLED_MODE') }}:</label
      >
      <select
        id="encoderMode"
        v-model="control.numbers.pb_mode"
        @focus="setActiveField('pb_mode', $event.target)"
        ref="pbModeSelect"
        :class="{ hidden: isHidden('pb_mode', control) }"
      >
        <option v-for="n in pushButtonModes" :key="n.value" :value="n.value" :title="n.long">
          {{ n.text }}
        </option>
      </select>
    </template>
    <!-- Upper limit -->
    <template v-if="ec4.editorMode === 'turn'">
      <label
        for="encoderUpperLimit"
        :class="{
          'active-field': ec4.activeField === 'upper',
          hidden: isHidden('upper', control),
        }"
        >{{ t('OLED_UPPER') }}:</label
      >
      <number-input
        id="encoderUpperLimit"
        ref="upperLimitInput"
        v-model="control.numbers.upper"
        :ranges="getLimitRanges(control.numbers.type, control.numbers.scale)"
        @focus="setActiveField('upper', $event.target)"
        :class="{ hidden: isHidden('upper', control) }"
        type="number"
      />
    </template>
    <template v-else>
      <label
        for="encoderUpperLimit"
        :class="{
          'active-field': ec4.activeField === 'pb_upper',
          hidden: isHidden('pb_upper', control),
        }"
        >{{ t('OLED_UPPER') }}:</label
      >
      <number-input
        id="encoderUpperLimit"
        ref="pbUpperLimitInput"
        v-model="control.numbers.pb_upper"
        :ranges="[{ from: 0, to: 127 }]"
        @focus="setActiveField('pb_upper', $event.target)"
        :class="{ hidden: isHidden('pb_upper', control) }"
        type="number"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/main.scss' as *;
@use '@picocss/pico/scss/colors/index.scss' as *;
#oled {
  display: grid;
  grid-template-columns: 0.9fr 0.9fr 0.9fr 1.3fr;
  grid-template-rows: repeat(4, 1fr);
  align-items: center;
  color: $yellow;
  caret-color: $yellow;
  background: linear-gradient(8deg, #000, #222, #333);

  .hidden {
    visibility: hidden;
  }

  label {
    text-align: right;
    background-color: transparent;
    line-height: 1.8em;
    &.active-field {
      background-color: $active-field-color;
    }
    cursor: pointer;
    text-transform: capitalize;
  }

  .two-inputs {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    font-size: 0.9em;
  }

  .note-input {
    width: 5.5em;
    font-size: 0.9em;
  }
}
</style>
<style lang="scss">
@use '@picocss/pico/scss/colors/index.scss' as *;
#oled {
  // Not scoping these so they can apply to eg the note-input component when it is in the oled
  input {
    width: 100%;
    background-color: transparent;
    color: inherit;
    font: inherit;
    outline: none;
    text-align: right;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  select {
    background-color: inherit;
    font: inherit;
    color: inherit;
    border-width: 2px;
    border-style: inset;
    border-color: rgb(118, 118, 118);
  }
  select:focus {
    outline: $yellow groove 1px;
  }
}
</style>
