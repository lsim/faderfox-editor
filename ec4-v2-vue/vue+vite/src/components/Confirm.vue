<script setup lang="ts">
import { toggleModal } from '@/assets/pico-modal.ts';
import { watch, ref } from 'vue';
import useConfirm from '@/composables/confirm.ts';
import { vOnClickOutside } from '@vueuse/components';
import { onKeyStroke } from '@vueuse/core';

const confirm = useConfirm();

const dialog = ref<HTMLDialogElement | null>(null);

function handleConfirm() {
  if (!confirm.resolve || !dialog.value) return;
  confirm.resolve?.();
  toggleModal(dialog.value);
}

function handleCancel() {
  if (!confirm.reject || !dialog.value) return;
  toggleModal(dialog.value);
  confirm.reject?.();
}

watch(
  () => confirm.resolve,
  (newResolver, oldResolver) => {
    if (!!newResolver != !!oldResolver && dialog.value) toggleModal(dialog.value);
  },
);

onKeyStroke('Escape', handleCancel);
</script>

<template>
  <Teleport to="body">
    <div class="pico modal-container">
      <dialog ref="dialog">
        <article v-on-click-outside="handleCancel">
          <header>
            <slot name="header">
              {{ confirm.header }}
            </slot>
          </header>
          <slot name="message">
            <p>{{ confirm.message }}</p>
          </slot>
          <footer>
            <button @click="handleCancel">
              <slot name="cancel-bn">
                {{ confirm.negativeText }}
              </slot>
            </button>
            <button @click="handleConfirm">
              <slot name="confirm-bn">
                {{ confirm.positiveText }}
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
