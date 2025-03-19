<script setup lang="ts">
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import { computed, toRefs } from 'vue';
import { type EncoderGroup, EncoderSetup } from '@/domain/Encoder.ts';

const ec4 = useEc4Store();

const gridRows = computed(() => {
  return ec4.encoderSetups.map((s, i) => [s, ec4.encoderGroups[i]]);
});

function handleFocus(e: Event, setupId: number, groupId: number) {
  ec4.selectedSetupIndex = setupId;
  ec4.selectedGroupIndex = groupId;
  (e.target as any)?.select();
}

const setupColors = [
  'red',
  'pink',
  'fuchsia',
  'purple',
  'violet',
  'indigo',
  'blue',
  'azure',
  'cyan',
  'jade',
  'green',
  'lime',
  'yellow',
  'amber',
  'pumpkin',
  'orange',
  'sand',
  'grey',
  'zinc',
  'slate',
];
</script>

<template>
  <div id="setupsandgroups" title="Select setup, group and edit name.">
    <h3>Setup</h3>
    <h3>Group</h3>
    <template v-for="([s, g], idx) in gridRows" :key="s.id">
      <input
        v-model="s.name"
        :class="{
          selected: idx === ec4.selectedSetupIndex,
          [`color-${setupColors[idx]}`]: true,
        }"
        class="setup-name matrix_font"
        @focus="handleFocus($event, idx, ec4.selectedGroupIndex)"
        maxlength="4"
      />
      <input
        v-if="g"
        v-model="g.name"
        :class="{
          selected: idx === ec4.selectedGroupIndex,
          [`color-${setupColors[ec4.selectedSetupIndex]}`]: true,
        }"
        class="group-name matrix_font"
        @focus="handleFocus($event, ec4.selectedSetupIndex, idx)"
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
@use '@picocss/pico/scss/colors/index.scss' as *;
@use 'sass:list';
@use 'sass:color';
@use 'sass:math';

$picoColors: (
  ('red', $red-700),
  ('pink', $pink-700),
  ('fuchsia', $fuchsia-700),
  ('purple', $purple-700),
  ('violet', $violet-700),
  ('indigo', $indigo-700),
  ('blue', $blue-700),
  ('azure', $azure-700),
  ('cyan', $cyan-700),
  ('jade', $jade-700),
  ('green', $green-700),
  ('lime', $lime-700),
  ('yellow', $yellow-700),
  ('amber', $amber-700),
  ('pumpkin', $pumpkin-700),
  //('orange', $orange-700),
  ('sand', $sand-700),
  ('grey', $grey-700),
  ('zinc', $zinc-700),
  ('slate', $slate-700)
);

@function red($c) {
  @return color.channel($c, 'red');
}
@function green($c) {
  @return color.channel($c, 'green');
}
@function blue($c) {
  @return color.channel($c, 'blue');
}

@mixin text-contrast($n) {
  $color-brightness: round(math.div((red($n) * 299) + (green($n) * 587) + (blue($n) * 114), 1000));
  $light-color: round(
    math.div((red(#ffffff) * 299) + (green(#ffffff) * 587) + (blue(#ffffff) * 114), 1000)
  );
  @if abs($color-brightness) < (math.div($light-color, 2)) {
    color: white;
  } @else {
    color: black;
  }
}

#setupsandgroups {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 3px solid #ccc;
  border-radius: 6px;
  margin-top: 24px;
  text-align: center;

  input {
    width: 100%;
    text-align: center;
    cursor: pointer;
    padding: 5px;

    $shadow: 30px;

    &.selected {
      // pulse the box-shadow
      animation: pulse 5s infinite;
      z-index: 10;
      box-shadow: 0 0 $shadow $white;

      outline: none;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 $shadow $white;
      }
      //15% {
      //  box-shadow: 0 0 15px $white;
      //}
      //30% {
      //  box-shadow: 0 0 50px black;
      //}
      //30% {
      //  box-shadow: 0 0 15px $white;
      //}
      50% {
        box-shadow: 0 0 calc($shadow - 15px) $white;
      }
      //60% {
      //  box-shadow: 0 0 5px black;
      //}
      //75% {
      //  box-shadow: 0 0 15px $red;
      //}
      //90% {
      //  box-shadow: 0 0 15px $white;
      //}
      100% {
        box-shadow: 0 0 $shadow $white;
      }
    }

    @for $i from 1 through 16 {
      $theColor: list.nth(list.nth($picoColors, $i), 2);
      &.color-#{list.nth(list.nth($picoColors, $i), 1)} {
        @include text-contrast($theColor);
        background-color: $theColor;
      }
    }

    //&.setup-name {
    //  &.selected {
    //  }
    //}

    //&.group-name {
    //  //grid-area: groups;
    //  //text-align: center;
    //  //background-color: $active-field-color;
    //}
  }
}
</style>
