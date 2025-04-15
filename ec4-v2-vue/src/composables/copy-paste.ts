import { computed, ref } from 'vue';
import type { EncoderSetup } from '@/domain/EncoderSetup.ts';
import type { EncoderGroup } from '@/domain/EncoderGroup.ts';
import type { Control } from '@/domain/Encoder.ts';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import { onKeyDown, onKeyUp } from '@vueuse/core';

export default function useCopyPaste() {
  const ec4 = useEc4Store();

  const copiedSetup = ref<EncoderSetup | null>(null);
  const copiedGroup = ref<EncoderGroup | null>(null);
  const copiedEncoder = ref<Control | null>(null);
  const canPasteSetup = computed(() => !!copiedSetup.value);
  const canPasteGroup = computed(() => !!copiedGroup.value);
  const canPasteEncoder = computed(() => !!copiedEncoder.value);

  const copyMode = ref(false);
  onKeyDown('Alt', (e) => {
    copyMode.value = true;
  });
  onKeyUp('Alt', (e) => {
    copyMode.value = false;
  });

  return {
    canPasteSetup,
    canPasteGroup,
    canPasteEncoder,
    copySetup(s: EncoderSetup) {
      copiedSetup.value = s;
    },
    copyGroup(g: EncoderGroup) {
      copiedGroup.value = g;
    },
    copyEncoder(c: Control) {
      copiedEncoder.value = c;
    },
    pasteSetup(idx: number) {
      if (!copiedSetup.value) return;
      ec4.replaceSetup(idx, copiedSetup.value.clone(idx));
    },
    pasteGroup(idx: number) {
      if (!copiedGroup.value) return;
      ec4.replaceGroup(idx, copiedGroup.value.clone(ec4.selectedSetupIndex, idx));
    },
    pasteEncoder(idx: number) {
      if (!copiedEncoder.value) return;
      ec4.replaceControl(
        idx,
        copiedEncoder.value.clone(ec4.selectedSetupIndex, ec4.selectedGroupIndex, idx),
      );
    },
    clearClipboard() {
      copiedSetup.value = null;
      copiedGroup.value = null;
      copiedEncoder.value = null;
    },
    copyMode,
  };
}
