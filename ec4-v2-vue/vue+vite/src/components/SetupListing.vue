<script setup lang="ts">
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import { computed, toRefs } from 'vue';
import { type EncoderGroup, EncoderSetup } from '@/domain/Encoder.ts';

const ec4 = useEc4Store();

const gridRows = computed(() => {
  return ec4.encoderSetups.map((s, i) => [s, ec4.encoderGroups[i]]);
});
</script>

<template>
  <div id="setupsandgroups" title="Select setup, group and edit name.">
    <h3>Setup</h3>
    <h3>Group</h3>
    <template v-for="([s, g], idx) in gridRows" :key="s.id">
      <input
        v-model="s.name"
        :class="{ selected: idx === ec4.selectedSetupIndex }"
        class="setup-name matrix_font"
        @focus="ec4.selectedSetupIndex = idx"
        maxlength="4"
      />
      <input
        v-if="g"
        v-model="g.name"
        :class="{ selected: idx === ec4.selectedGroupIndex }"
        class="group-name matrix_font"
        @focus="ec4.selectedGroupIndex = idx"
        maxlength="4"
      />
    </template>

    <!--    <div class="tools">-->
    <!--      <a id="btncopysetup" title="Copy selected setup to clipboard" class="asbutton" tabindex="-1"-->
    <!--        >Copy Setup</a-->
    <!--      ><a id="btncopygroup" title="Copy selected group to clipboard" class="asbutton" tabindex="-1"-->
    <!--        >Copy Group</a-->
    <!--      ><a-->
    <!--        id="btnpastesetup"-->
    <!--        title="Paste setup from clipboard to selected setup"-->
    <!--        class="asbutton"-->
    <!--        tabindex="-1"-->
    <!--        >Paste Setup</a-->
    <!--      ><a-->
    <!--        id="btnpastegroup"-->
    <!--        title="Paste group from clipboard to selected group"-->
    <!--        class="asbutton"-->
    <!--        tabindex="-1"-->
    <!--        >Paste Group</a-->
    <!--      >-->
    <!--    </div>-->
  </div>
</template>

<style scoped lang="scss">
@use '../assets/main.scss' as *;
#setupsandgroups {
  display: grid;
  grid-template-columns: 1fr 1fr;

  input {
    width: 3em;
    color: $yellow;
    background-color: transparent;

    &.selected {
      background-color: red !important;
    }

    &.setup-name {
      //grid-area: setups;
    }

    &.group-name {
      //grid-area: groups;
      //text-align: center;
      background-color: $active-field-color;
    }
  }
}
</style>
