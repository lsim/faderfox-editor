<script setup lang="ts">
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import useCopyPaste from '@/composables/copy-paste.ts';
import { computed, ref, watch } from 'vue';
import CopyPasteWrap from '@/components/CopyPasteWrap.vue';

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
    :class="{ 'copy-mode': copyPaste.copyMode }"
  >
    <h3>Setup</h3>
    <h3>Group</h3>
    <template v-for="([s, g], idx) in gridRows" :key="s.id">
      <copy-paste-wrap
        class="setup-name"
        :can-paste="copyPaste.canPasteSetup.value"
        @copy="copyPaste.copySetup(idx)"
        @paste="copyPaste.pasteSetup(idx)"
        :always-show="idx === ec4.selectedSetupIndex"
      >
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
      </copy-paste-wrap>

      <copy-paste-wrap
        class="group-name"
        :can-paste="copyPaste.canPasteGroup.value"
        @copy="copyPaste.copyGroup(idx)"
        @paste="copyPaste.pasteGroup(idx)"
        :always-show="idx === ec4.selectedGroupIndex"
      >
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
      </copy-paste-wrap>
    </template>
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
  }
}
</style>
