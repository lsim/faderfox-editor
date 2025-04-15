<script setup lang="ts">
import { closeModal, openModal } from '@/assets/pico-modal.ts';
import { watch, ref, type Ref } from 'vue';
import { vOnClickOutside } from '@vueuse/components';
import { onKeyStroke } from '@vueuse/core';

const dialog = ref<HTMLDialogElement | null>(null);

function handleConfirm() {
  if (!resolve.value || !dialog.value) return;
  resolve.value?.('Ok');
}

function handleCancel() {
  if (!reject.value || !dialog.value) return;
  reject.value?.('Cancelled');
}

const resolve: Ref<((value: unknown) => void) | null> = ref(null);
const reject: Ref<((reason: unknown) => void) | undefined> = ref(undefined);
const header = ref<string>();
const message = ref<string>();
const positiveText = ref<string>();
const negativeText = ref<string>();

function showIt(
  _header?: string,
  _message?: string,
  _positiveText = 'OK',
  _negativeText = 'Cancel',
) {
  header.value = _header;
  message.value = _message;
  positiveText.value = _positiveText;
  negativeText.value = _negativeText;
  return new Promise((res, rej) => {
    resolve.value = res;
    reject.value = rej;
  }).finally(() => {
    resolve.value = null;
    reject.value = undefined;
  });
}

watch(
  () => resolve.value,
  (newResolver, oldResolver) => {
    if (!newResolver && oldResolver && dialog.value) closeModal(dialog.value);
    if (newResolver && !oldResolver && dialog.value) openModal(dialog.value);
  },
);

onKeyStroke('Escape', handleCancel);
onKeyStroke('Enter', handleConfirm);

defineExpose({
  showIt,
});
</script>

<template>
  <Teleport to="body">
    <div class="pico modal-container">
      <dialog ref="dialog">
        <article v-on-click-outside="handleCancel">
          <header>
            <slot name="header">
              <h3>{{ header }}</h3>
            </slot>
          </header>
          <slot name="message">
            <p>{{ message }}</p>
          </slot>
          <footer>
            <button @click="handleCancel" v-show="negativeText">
              <slot name="cancel-bn">
                {{ negativeText }}
              </slot>
            </button>
            <button @click="handleConfirm" v-show="positiveText">
              <slot name="confirm-bn">
                {{ positiveText }}
              </slot>
            </button>
          </footer>
        </article>
      </dialog>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  &[data-state='open'] {
    z-index: 1000;
  }
  pointer-events: none;
}
</style>
