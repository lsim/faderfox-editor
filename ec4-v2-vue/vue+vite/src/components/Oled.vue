<script setup lang="ts">

import ScaleSelector from "@/components/ScaleSelector.vue";
import type {Encoder, FieldType} from '@/domain/Encoder';
import {computed, ref, watch} from 'vue';

const props = defineProps<{
  encoder: Encoder | null,
  activeField: FieldType,
}>();

const emit = defineEmits<{
  (event: 'update:encoder', encoder: Encoder): void,
  (event: 'update:activeField', field: FieldType): void,
}>();

const encoder = computed(() => ({...props.encoder} as Encoder));

watch(encoder, () => {
  emit('update:encoder', encoder.value);
}, { deep: true });

</script>

<template>
  <div id="oled" class="oled watchparams typed matrix_font">

    <label for="encoderName">Ctrl:</label>
    <input
      id="encoderName"
      v-model="encoder.name"
      disabled />
    <label for="encoderChannel">Chan:</label>
    <!-- strict limits -->
    <input
      id="encoderChannel"
      maxlength="2"
      min="1"
      max="16"
      v-model="encoder.channel" />
    <label for="encoderScale">Disp:</label>
    <ScaleSelector v-model="encoder.scale" :abbreviated="true" />
    <template v-if="encoder.type === 'nrpn'">
      <label for="encoderNumber">N:</label>
      <span style="margin-left: 1em;">
        <input
          id="encoderNumber"
          maxlength="3"
          v-model="encoder.number" />
        <input
          maxlength="3"
          v-model="encoder.number_h" style="border-left: 1px solid #fff;" />
      </span>
    </template>
    <template v-else>
      <label for="encoderNumber">Numb:</label>
      <input
        id="encoderNumber"
        maxlength="3"
        v-model="encoder.number" />
    </template>

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
$color: #feff5f;

#oled {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  align-items: center;
  color: $color;
  caret-color: $color;
  background: linear-gradient(8deg, #000, #222, #333);

  input {
    width: calc(100% - 9px);
    background-color: transparent;
    color: inherit;
    font: inherit;
    outline: none;
  }

  select {
    background-color: inherit;
    font: inherit;
    color: inherit;
    border: none;
  }
  select:focus {
    outline: $color groove 1px;
  }
  label {
    text-align: right;
    background-color:transparent;
  }
}
</style>
