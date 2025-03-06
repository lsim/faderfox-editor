<script setup lang="ts">
import ScaleSelector from '@/components/ScaleSelector.vue';
import {
  type Encoder,
  type FieldType,
  encoderTypes,
  encoderModes,
  EncoderGroup,
  typeByName,
} from '@/domain/Encoder';
import { computed, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';

const { t } = useI18n();

const props = defineProps<{
  encoderId: string;
  groupId: string;
  activeField: FieldType;
}>();

const emit = defineEmits<{
  (event: 'update:active-field', field: FieldType): void;
}>();

const ec4 = useEc4Store();

const control: ComputedRef<Partial<Encoder>> = computed(() => {
  const group = ec4.encoderGroups.find((g: EncoderGroup) => g.id === props.groupId);
  const controls = ec4.editorMode === 'turn' ? group?.encoders : group?.pushButtons;
  return controls?.find((e: Encoder) => e.id === props.encoderId) || {};
});

function isInput(input: EventTarget | null): input is HTMLInputElement {
  return (input as HTMLInputElement | null)?.type === 'INPUT';
}

function setActiveField(field: FieldType, input: EventTarget | null) {
  emit('update:active-field', field);
  // Select all the text in the input field for easier editing
  if (!isInput(input)) input = (input as Element | null)?.querySelector('input') || null;
  if (!isInput(input)) return;
  setTimeout(() => input.select(), 100);
}
</script>

<template>
  <div id="oled" class="oled typed matrix_font" v-if="control">
    <!-- Encoder name -->
    <label for="encoderName" :class="{ 'active-field': activeField === 'name' }"
      >{{ t('OLED_ENCODER_NAME') }}:</label
    >
    <input id="encoderName" v-model="control.name" @focus="setActiveField('name', $event.target)" />
    <!-- Encoder channel -->
    <label for="encoderChannel" :class="{ 'active-field': activeField === 'channel' }"
      >{{ t('OLED_CHANNEL') }}:</label
    >
    <input
      id="encoderChannel"
      autocomplete="off"
      type="number"
      min="1"
      max="16"
      :value="control.channel"
      @input="
        control.channel = ($event.target as HTMLInputElement | null)?.checkValidity()
          ? parseInt(($event.target as HTMLInputElement | null)?.value || '0', 10)
          : control.channel
      "
      @focus="setActiveField('channel', $event.target)"
    />
    <!-- Encoder display -->
    <label for="encoderScale" :class="{ 'active-field': activeField === 'scale' }"
      >{{ t('OLED_DISPLAY') }}:</label
    >
    <ScaleSelector
      :model-value="control.scale || 0"
      @update:modelValue="control.scale = $event"
      :abbreviated="true"
      id="encoderScale"
      @focus="setActiveField('scale', $event.target)"
    />
    <template v-if="control.type === typeByName('NRPN')">
      <!-- Encoder number - NRPN -->
      <label for="encoderNumber" :class="{ 'active-field': activeField === 'number' }"
        >{{ t('OLED_NUMBER') }}:</label
      >
      <span class="two-inputs">
        <input
          id="encoderNumber"
          maxlength="3"
          v-model="control.number_h"
          @focus="setActiveField('number', $event.target)"
        />
        <input
          maxlength="3"
          v-model="control.number"
          @focus="setActiveField('number', $event.target)"
        />
      </span>
    </template>
    <template v-else>
      <!-- Encoder number - other -->
      <label for="encoderNumber" :class="{ 'active-field': activeField === 'number' }"
        >{{ t('OLED_NUMBER') }}:</label
      >
      <input
        id="encoderNumber"
        maxlength="3"
        v-model="control.number"
        @focus="setActiveField('number', $event.target)"
      />
    </template>
    <!-- Encoder type -->
    <label for="encoderType" :class="{ 'active-field': activeField === 'type' }"
      >{{ t('OLED_TYPE') }}:</label
    >
    <select id="encoderType" v-model="control.type" @focus="setActiveField('type', $event.target)">
      <option v-for="n in encoderTypes" :key="n.value" :value="n.short" :title="n.text">
        {{ n.short }}
      </option>
    </select>
    <!-- Lower limit -->
    <label for="encoderLowerLimit" :class="{ 'active-field': activeField === 'lower_limit' }"
      >{{ t('OLED_LOWER') }}:</label
    >
    <input
      id="encoderLowerLimit"
      v-model="control.lower"
      @focus="setActiveField('lower_limit', $event.target)"
      type="number"
    />
    <!-- Encoder mode -->
    <label for="encoderMode" :class="{ 'active-field': activeField === 'mode' }"
      >{{ t('OLED_MODE') }}:</label
    >
    <select id="encoderMode" v-model="control.mode" @focus="setActiveField('mode', $event.target)">
      <option v-for="n in encoderModes" :key="n.value" :value="n.value" :title="n.text">
        {{ n.text }}
      </option>
    </select>

    <!--    <div id="turn" class="modecontainer">-->
    <!--      <span >Ctrl:</span-->
    <!--      ><select  data-watch="select-encoder"></select-->
    <!--    ><span class="c channel" data-action="edit-channel">Chan :</span-->
    <!--    ><input-->
    <!--      data-watch="channel"-->
    <!--      data-action="edit-channel"-->

    <!--      type="text"-->
    <!--      maxlength="2"-->
    <!--      value=""-->
    <!--    /><span class="a scale" data-action="edit-scale">Disp:</span-->
    <!--    ><select data-watch="scale" data-action="edit-scale" >-->
    <!--      <option>off</option>-->
    <!--      <option>127</option>-->
    <!--      <option>100</option>-->
    <!--      <option>1000</option>-->
    <!--      <option> ±63</option>-->
    <!--      <option> ±50</option>-->
    <!--      <option>±500</option>-->
    <!--      <option>ONOF</option>-->
    <!--      <option>9999</option>-->
    <!--    </select-->
    <!--    ><span class="c number number_l" data-action="edit-number"-->
    <!--    >Numb :</span-->
    <!--    ><input-->
    <!--      data-watch="number"-->
    <!--      data-action="edit-number"-->
    <!--      class="d number number_l"-->
    <!--      type="text"-->
    <!--      maxlength="3"-->
    <!--      value=""-->
    <!--    /><span class="c number number_h">N:</span-->
    <!--    ><input-->
    <!--      data-watch="number_h"-->
    <!--      data-action="edit-number"-->
    <!--      class="d number number_h"-->
    <!--      type="text"-->
    <!--      maxlength="3"-->
    <!--      value=""-->
    <!--      title="NPRM MSB"-->
    <!--    /><input-->
    <!--      data-watch="number"-->
    <!--      data-action="edit-number"-->
    <!--      class="d number number_h"-->
    <!--      type="text"-->
    <!--      maxlength="3"-->
    <!--      value=""-->
    <!--      title="NPRM LSB"-->
    <!--    /><span class="a type" data-action="edit-type">Type:</span-->
    <!--    ><select data-watch="type" data-action="edit-type" >-->
    <!--      <option>CCR1</option>-->
    <!--      <option>CCR2</option>-->
    <!--      <option>CCab</option>-->
    <!--      <option>PrgC</option>-->
    <!--      <option>CCAh</option>-->
    <!--      <option>PBnd</option>-->
    <!--      <option>AftT</option>-->
    <!--      <option>Note</option>-->
    <!--      <option>NRPN</option>-->
    <!--    </select-->
    <!--    ><span class="c lower" data-action="edit-lower">Lower:</span-->
    <!--    ><input-->
    <!--      data-watch="lower"-->
    <!--      data-action="edit-lower"-->
    <!--      class="d lower"-->
    <!--      type="text"-->
    <!--      maxlength="5"-->
    <!--      value=""-->
    <!--    /><span class="a mode" data-action="edit-mode">Mode:</span-->
    <!--    ><select data-watch="mode" data-action="edit-mode" class="b mode">-->
    <!--      <option>Div8</option>-->
    <!--      <option>Div4</option>-->
    <!--      <option>Div2</option>-->
    <!--      <option>Acc0</option>-->
    <!--      <option>Acc1</option>-->
    <!--      <option>Acc2</option>-->
    <!--      <option>Acc3</option>-->
    <!--      <option>LSp2</option>-->
    <!--      <option>LSp4</option>-->
    <!--      <option>LSp6</option>-->
    <!--    </select-->
    <!--    ><span class="c upper" data-action="edit-upper">Upper:</span-->
    <!--    ><input-->
    <!--      data-watch="upper"-->
    <!--      data-action="edit-upper"-->
    <!--      class="d upper"-->
    <!--      type="text"-->
    <!--      maxlength="5"-->
    <!--      value=""-->
    <!--    />-->
    <!--    </div>-->
    <!--    <div id="push" class="modecontainer">-->
    <!--            <span >Ctrl:</span-->
    <!--            ><select  data-watch="select-encoder">-->
    <!--      <option>PB01-->
    <!--      </option>-->
    <!--      <option>PB02-->
    <!--      </option>-->
    <!--      <option>PB03-->
    <!--      </option>-->
    <!--      <option>PB04</option>-->
    <!--      <option>PB05-->
    <!--      </option>-->
    <!--      <option>PB06-->
    <!--      </option>-->
    <!--      <option>PB07-->
    <!--      </option>-->
    <!--      <option>PB08</option>-->
    <!--      <option>PB09-->
    <!--      </option>-->
    <!--      <option>PB10-->
    <!--      </option>-->
    <!--      <option>PB11-->
    <!--      </option>-->
    <!--      <option>PB12</option>-->
    <!--      <option>PB13-->
    <!--      </option>-->
    <!--      <option>PB14-->
    <!--      </option>-->
    <!--      <option>PB15-->
    <!--      </option>-->
    <!--      <option>PB16</option>-->
    <!--    </select-->
    <!--    ><span class="c pb_channel" data-action="edit-pb_channel">Chan :</span-->
    <!--    ><span class="c pb_channel pb_group" data-action="edit-pb_channel"-->
    <!--    >Group:</span-->
    <!--    ><span class="c pb_channel pb_set" data-action="edit-pb_channel"-->
    <!--    >Set&nbsp; :</span-->
    <!--    ><input-->
    <!--      data-watch="pb_channel"-->
    <!--      data-action="edit-pb_channel"-->
    <!--      class="d pb_channel"-->
    <!--      type="text"-->
    <!--      maxlength="2"-->
    <!--      value=""-->
    <!--    /><span class="a pb_display" data-action="edit-pb_display">Disp:</span-->
    <!--    ><select data-watch="pb_display" data-action="edit-pb_display" class="b pb_display">-->
    <!--      <option>Off</option>-->
    <!--      <option>On</option>-->
    <!--    </select-->
    <!--    ><span class="c pb_number" data-action="edit-pb_number"-->
    <!--    >Numb :</span-->
    <!--    ><input-->
    <!--      data-watch="pb_number"-->
    <!--      data-action="edit-pb_number"-->
    <!--      class="d pb_number"-->
    <!--      type="text"-->
    <!--      maxlength="3"-->
    <!--      value=""-->
    <!--    /><span class="a pb_type" data-action="edit-pb_type">Type:</span-->
    <!--    ><select data-watch="pb_type" data-action="edit-pb_type" >-->
    <!--      <option>Off</option>-->
    <!--      <option>Note</option>-->
    <!--      <option>CC</option>-->
    <!--      <option>PrgC</option>-->
    <!--      <option>PBnd</option>-->
    <!--      <option>AftT</option>-->
    <!--      <option>Grp</option>-->
    <!--      <option>Set</option>-->
    <!--      <option>Acc0</option>-->
    <!--      <option>Acc3</option>-->
    <!--      <option>LSp6</option>-->
    <!--      <option>Min</option>-->
    <!--      <option>Max</option>-->
    <!--    </select-->
    <!--    ><span class="c pb_lower" data-action="edit-pb_lower">Lower:</span-->
    <!--    ><input-->
    <!--      data-watch="pb_lower"-->
    <!--      data-action="edit-pb_lower"-->
    <!--      class="d pb_lower"-->
    <!--      type="text"-->
    <!--      maxlength="3"-->
    <!--      value=""-->
    <!--    /><span class="a pb_mode" data-action="edit-pb_mode">Mode:</span-->
    <!--    ><select data-watch="pb_mode" data-action="edit-pb_mode" class="b pb_mode">-->
    <!--      <option>Key</option>-->
    <!--      <option>Togl</option>-->
    <!--    </select-->
    <!--    ><span class="c pb_upper" data-action="edit-pb_upper">Upper:</span-->
    <!--    ><input-->
    <!--      data-watch="pb_upper"-->
    <!--      data-action="edit-pb_upper"-->
    <!--      class="d pb_upper"-->
    <!--      type="text"-->
    <!--      maxlength="3"-->
    <!--      value=""-->
    <!--    />-->
    <!--    </div>-->
    <!--    <div id="toallenc" class="asbutton" data-action="copy2all">-->
    <!--      Copy &quot;<span>XXXX</span>&quot; to all encoders in group-->
    <!--    </div>-->
    <!--    <div class="centerline"></div>-->
  </div>
</template>

<style scoped lang="scss">
@use '../assets/main.scss' as *;
#oled {
  display: grid;
  grid-template-columns: 0.9fr 0.9fr 0.9fr 1.3fr;
  grid-template-rows: repeat(4, 1fr);
  align-items: center;
  color: $yellow;
  caret-color: $yellow;
  background: linear-gradient(8deg, #000, #222, #333);

  input {
    width: calc(100% - 9px);
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
  }
}
</style>
