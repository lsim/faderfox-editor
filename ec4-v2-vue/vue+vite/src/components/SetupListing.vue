<script setup lang="ts">
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import useCopyPaste from '@/composables/copy-paste.ts';
import { computed, ref, watch } from 'vue';
import { onKeyDown, onKeyUp } from '@vueuse/core';

const ec4 = useEc4Store();
const copyPaste = useCopyPaste();

const gridRows = computed(() => {
  return ec4.activeBundle.setups.map((s, i) => [s, ec4.encoderGroups[i]]);
});

function handleFocus(e: Event, setupId: number, groupId: number) {
  ec4.selectedSetupIndex = setupId;
  ec4.selectedGroupIndex = groupId;
  (e.target as { select: () => void } | null)?.select();
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
const copyMode = ref(false);
onKeyDown('Alt', (e) => {
  copyMode.value = true;
});
onKeyUp('Alt', (e) => {
  copyMode.value = false;
});

watch(
  () => ec4.selectedSetupIndex,
  (newIndex: number) => {
    // Focus the setup name
    const nameInput = document.querySelectorAll('.setup-name input')[newIndex];
    if (nameInput) (nameInput as HTMLInputElement).focus();
  },
);

watch(
  () => ec4.selectedGroupIndex,
  (newIndex) => {
    // Focus the group name
    const nameInput = document.querySelectorAll('.group-name input')[newIndex];
    if (nameInput) (nameInput as HTMLInputElement).focus();
  },
);

const hoveredSetup = ref<number | null>(null);
const hoveredGroup = ref<number | null>(null);

const copyableSetup = computed(() => {
  return hoveredSetup.value !== null ? hoveredSetup.value : ec4.selectedSetupIndex;
});
const copyableGroup = computed(() => {
  return hoveredGroup.value !== null ? hoveredGroup.value : ec4.selectedGroupIndex;
});
</script>

<template>
  <div
    id="setupsandgroups"
    title="Select setup, group and edit name."
    :class="{ 'copy-mode': copyMode }"
  >
    <h3>Setup</h3>
    <h3>Group</h3>
    <template v-for="([s, g], idx) in gridRows" :key="s.id">
      <div class="setup-name" @mouseenter="hoveredSetup = idx" @mouseleave="hoveredSetup = null">
        <input
          v-model="s.name"
          :class="{
            selected: idx === ec4.selectedSetupIndex,
            [`color-${setupColors[idx]}`]: true,
          }"
          class="matrix_font"
          @focus="handleFocus($event, idx, ec4.selectedGroupIndex)"
          maxlength="4"
        />
        <div
          class="setup copy-button"
          v-if="idx === copyableSetup"
          @click="copyPaste.copySetup(idx)"
        >
          copy
        </div>
        <div
          class="setup paste-button"
          v-if="idx === copyableSetup && copyPaste.canPasteSetup.value"
          @click="copyPaste.pasteSetup(idx)"
        >
          paste
        </div>
      </div>

      <div class="group-name" @mouseenter="hoveredGroup = idx" @mouseleave="hoveredGroup = null">
        <input
          v-model="g.name"
          :class="{
            selected: idx === ec4.selectedGroupIndex,
            [`color-${setupColors[ec4.selectedSetupIndex]}`]: true,
          }"
          class="matrix_font"
          @focus="handleFocus($event, ec4.selectedSetupIndex, idx)"
          maxlength="4"
        />
        <div
          class="group copy-button"
          v-if="idx === copyableGroup"
          @click="copyPaste.copyGroup(idx)"
        >
          copy
        </div>
        <div
          class="group paste-button"
          v-if="idx === copyableGroup && copyPaste.canPasteGroup.value"
          @click="copyPaste.pasteGroup(idx)"
        >
          paste
        </div>
      </div>
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
  ('orange', $orange-700),
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
  border: 3px solid #c0c0c0;
  border-radius: 7px;
  text-align: center;

  input {
    width: 100%;
    text-align: center;
    cursor: pointer;
    padding: 5px;

    $shadow: 10px;
    transition: transform 0.3s ease;
    outline: none;

    &.selected {
      z-index: 10;
    }

    @for $i from 1 through 16 {
      $theColor: list.nth(list.nth($picoColors, $i), 2);
      &.color-#{list.nth(list.nth($picoColors, $i), 1)} {
        @include text-contrast($theColor);
        background-color: $theColor;
      }
    }
  }

  .setup-name,
  .group-name {
    position: relative;
    overflow: hidden;
    z-index: 10;
    padding: 2px;
    &:has(.selected) {
      border: 2px solid $white;
      border-radius: 4px;
      padding: 0;
    }

    .copy-button,
    .paste-button {
      position: absolute;
      top: 9px;
      opacity: 0;
      transition:
        opacity 0.3s ease,
        left 0.3s ease,
        right 0.3s ease;
      font-size: 0.4em;
      font-weight: bold;
      line-height: 2em;
      text-transform: uppercase;
      rotate: -90deg;
      background-color: $white;
      border: 1px solid $black;
      cursor: pointer;

      width: 3.9em;
      color: $black;
    }
    $radius: 4px;
    .copy-button {
      left: -3em;
      border-bottom-right-radius: $radius;
      border-bottom-left-radius: $radius;
      border-top: none;
    }
    .paste-button {
      right: -3em;
      border-top-right-radius: $radius;
      border-top-left-radius: $radius;
      border-bottom: none;
    }
  }

  &.copy-mode {
    .copy-button,
    .paste-button {
      opacity: 0.8;
    }
    .copy-button {
      left: -0.8em;
    }
    .paste-button {
      right: -0.8em;
    }
  }
}
</style>
