<script setup lang="ts">
import { useTemplateRef } from 'vue';

const emit = defineEmits<{
  (event: 'focus', target: FocusEvent): void;
}>();

const model = defineModel<number>({ required: true });

const props = defineProps<{
  tabIndex?: number;
}>();

const input = useTemplateRef('input');

function handleInput(e: Event) {
  const asNumber = parseInt((e.target as HTMLInputElement).value || '0', 10);
  model.value = isNaN(asNumber) ? 1 : ((asNumber - 1 + 16) % 16) + 1;
}

defineExpose({
  get value() {
    return model.value;
  },
  focus() {
    input.value?.focus();
  },
});
</script>

<template>
  <input
    class="width_3"
    ref="input"
    :value="model"
    @input="handleInput($event)"
    type="number"
    min="1"
    max="16"
    @focus="emit('focus', $event)"
    :tabindex="props.tabIndex"
  />
</template>

<style scoped lang="scss">
.width_3 {
  width: 2.3em;
}
</style>
