<script setup lang="ts">
const shortcuts = [
  { keys: ['Ctrl', 'e'], help: 'Focus encoder above' },
  { keys: ['Ctrl', 's'], help: 'Focus encoder below' },
  { keys: ['Ctrl', 'd'], help: 'Focus encoder to the left' },
  { keys: ['Ctrl', 'f'], help: 'Focus encoder to the right' },
  { keys: ['Ctrl', 'o'], help: 'Switch focus between encoders and oled fields' },
  { keys: ['Shift', 'space'], help: 'Toggle between turn/push modes' },
  { keys: ['Ctrl', 'q'], help: 'Select previous setup' },
  { keys: ['Ctrl', 'a'], help: 'Select next setup' },
  { keys: ['Ctrl', 't'], help: 'Select previous group' },
  { keys: ['Ctrl', 'g'], help: 'Select next group' },
  { keys: ['Alt'], help: 'Hold to copy/paste' },
  { keys: ['?'], help: 'Show keyboard shortcuts' },
  { keys: ['Escape'], help: 'Return focus to the encoder section' },
];
</script>

<template>
  <section class="shortcuts">
    <template v-for="s in shortcuts" :key="s.keys.join(',')">
      <p class="keys">
        <template v-for="k in s.keys" :key="k">
          <kbd>{{ k }}</kbd
          ><span class="and">+</span>
        </template>
      </p>
      <span class="help">{{ s.help }}</span>
    </template>
  </section>
</template>

<style scoped lang="scss">
.shortcuts {
  display: grid;
  grid-template-columns: 1fr 2fr;
  > .keys {
    grid-column: 1;
    display: flex;
    kbd {
      min-width: 4em;
      text-align: center;
    }

    * {
      margin: 0 0.5em;
    }
    justify-content: center;

    .and:last-child {
      display: none;
    }
  }

  > .help {
    grid-column: 2;
  }
}
</style>
