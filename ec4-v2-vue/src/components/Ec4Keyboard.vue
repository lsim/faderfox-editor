<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useCharacters } from '@/composables/characters.ts';
import { useMagicKeys } from '@vueuse/core';

const { deviceCharTable, publishChar, keyboardHasSubscribers } = useCharacters();

const { F2 } = useMagicKeys();

function handleMouseDown(c: string) {
  publishChar(c);
  return false;
}

const keyboardVisible = ref(false);

watch(F2, (isDown) => {
  if (!isDown) return;
  if (keyboardVisible.value) keyboardVisible.value = false;
  else if (!keyboardHasSubscribers()) return;
  else keyboardVisible.value = true;
});
// Shrink the keyboard by omitting keys that are easily typed by anyone on their actual keyboard
const filteredKeys = computed(() => {
  const omittedKeys = /[a-zA-Z0-9]/;
  return deviceCharTable.flatMap((row) => row.filter((c) => c && !omittedKeys.test(c)));
});
</script>

<template>
  <div class="keyboard-placement">
    <div class="keyboard" v-if="keyboardVisible" @mouseleave="keyboardVisible = false">
      <div
        class="keyboard-key"
        v-for="c in filteredKeys"
        :key="c"
        @mousedown.stop.prevent="handleMouseDown(c)"
      >
        <span>{{ c }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.keyboard-placement {
  position: absolute;
  z-index: 10;
}
.keyboard {
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  background-color: rgba(black, 0.7);
  border-radius: 0.5em;
  filter: drop-shadow(0 0 5px #000);
  gap: 2px;
  padding: 0;
  line-height: 18px;

  .keyboard-key {
    text-align: center;
    background-color: rgba(white, 0.1);
    border-radius: 0.5em;
    padding: 0.3em;
    cursor: pointer;

    transition: transform 0.2s ease;
    &:hover {
      background-color: rgba(white, 0.2);
      // scale up
      transform: scale(1.3);
    }
  }
}
</style>
