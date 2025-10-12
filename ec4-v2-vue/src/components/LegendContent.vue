<script setup lang="ts">
const shortcuts = [
  { keys: ['Shift', 'Alt', 'Up'], help: 'Focus encoder above' },
  { keys: ['Shift', 'Alt', 'Down'], help: 'Focus encoder below' },
  { keys: ['Shift', 'Alt', 'Left'], help: 'Focus encoder to the left' },
  { keys: ['Shift', 'Alt', 'Right'], help: 'Focus encoder to the right' },
  { keys: ['Shift', 'Alt', 'End'], help: 'Switch focus to oled fields' },
  { keys: ['Escape'], help: 'Return focus to the encoder section' },
  { keys: ['Shift', 'space'], help: 'Toggle between turn/push modes' },
  { keys: ['Ctrl/Cmd', 'PgUp'], help: 'Select previous setup' },
  { keys: ['Ctrl/Cmd', 'PgDn'], help: 'Select next setup' },
  { keys: ['Ctrl/Cmd', 'Shift', 'PgUp'], help: 'Select previous group' },
  { keys: ['Ctrl/Cmd', 'Shift', 'PgDn'], help: 'Select next group' },
  { keys: ['Alt'], help: 'Hold to copy/paste' },
  { keys: ['F2'], help: 'Tap to show/hide symbol keyboard' },
  { keys: ['?'], help: 'Show keyboard shortcuts' },
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
    justify-content: center;
    kbd {
      min-width: 4em;
      text-align: center;
    }

    * {
      margin: 0 0.5em;
    }

    .and:last-child {
      display: none;
    }
  }

  > .help {
    grid-column: 2;
  }
}
</style>
