<script setup lang="ts">
const props = defineProps<{
  value: string;
  hide?: boolean;
}>();
</script>

<template>
  <div class="badger">
    <slot />
    <div class="badge-container">
      <div class="badge" v-if="!props.hide">
        {{ value }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/main.scss' as *;
@use '@picocss/pico/scss/colors/index.scss' as *;

.badger {
  position: relative;
  background-color: transparent;
  .badge {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    font-size: 60%;
    font-weight: bold;
    min-width: 1.5em;
    height: 1.5em;
    background-color: $red-700;
    padding: 3px;
    pointer-events: none;

    border-radius: 50%;
    border: 2px solid rgba($white, 0.7);

    bottom: -0.7em;
    right: -0.7em;
  }
}
</style>
