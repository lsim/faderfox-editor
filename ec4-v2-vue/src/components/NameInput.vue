<script setup lang="ts">
import { useCharacters } from '@/composables/characters.ts';
import type { Subscription } from 'rxjs';
import { nextTick, ref } from 'vue';

const { charSubject$ } = useCharacters();
const model = defineModel<string>({ required: true });

const props = defineProps<{
  tabindex?: number;
}>();

const emit = defineEmits<{
  (event: 'focus', target: FocusEvent): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);

let subscription: Subscription | null = null;

function handleFocus(e: FocusEvent) {
  subscription?.unsubscribe();
  subscription = charSubject$.subscribe((c) => {
    const selectionStart = (e.target as HTMLInputElement).selectionStart || 0;
    const selectionEnd = (e.target as HTMLInputElement).selectionEnd || model.value.length;
    // Add the character where the cursor is - if the char count is less than 4 or there is a selection to replace
    if (model.value.length >= 4 && selectionStart === selectionEnd) return;
    model.value =
      model.value.substring(0, selectionStart) + c + model.value.substring(selectionEnd);
    nextTick(() => {
      (e.target as HTMLInputElement).setSelectionRange(selectionStart + 1, selectionStart + 1);
    });
  });
  emit('focus', e);
}

function handleBlur() {
  subscription?.unsubscribe();
  subscription = null;
}

// Expose 'focus' function
defineExpose({
  focus() {
    inputRef.value?.focus();
  },
});
</script>

<template>
  <input
    ref="inputRef"
    type="text"
    maxlength="4"
    class="name"
    v-model="model"
    @focus="handleFocus"
    @blur="handleBlur"
    :tabindex="props.tabindex"
  />
</template>

<style scoped lang="scss">
.name {
  border-style: none;
  width: 3em;
  font-family: monospace;
  text-align: center;
  font-size: 1.2em;
}
</style>
