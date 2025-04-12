<script setup lang="ts">
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import useMacros from '@/composables/macros.ts';

const ec4 = useEc4Store();

const macros = useMacros();
</script>

<template>
  <form class="fill-macros pico">
    <button
      :disabled="!ec4.activeNumberField"
      @click.prevent="macros.copyToAll(ec4.currentValue.v, ec4.activeNumberField)"
    >
      Copy '{{ ec4.currentValue.k }}' to all
    </button>
    <button>Increment from '{{ ec4.currentValue.k }}'</button>
    <button>Decrement from '{{ ec4.currentValue.k }}'</button>
    <span><button>Clear names</button><button>----</button></span>
    <button>Reset selected fields</button>
  </form>
</template>

<style scoped lang="scss">
.fill-macros {
  display: flex;
  flex-direction: column;
  border: 2px solid white;
  border-radius: 6px;
  padding: 15px;

  > button,
  > span {
    button {
      flex: 1 0 auto;
      &:not(:last-child) {
        margin-right: 10px;
      }
    }
    margin-bottom: 10px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  > span {
    display: flex;
    justify-content: space-between;
  }
}
</style>
