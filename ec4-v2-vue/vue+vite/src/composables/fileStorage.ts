import { nextTick, ref } from 'vue';
import { useStorage } from '@/composables/storage.ts';

const downloadLink = ref<HTMLAnchorElement | null>(null);

export default function useFileStorage() {
  const blobUrl = ref('');

  async function saveSysexDataToDisk(bytes: Uint8Array) {
    if (!downloadLink.value) throw Error('No download link');
    const blob = new Blob([bytes], {
      type: 'application/octet-stream',
    });
    blobUrl.value = URL.createObjectURL(blob);
    await nextTick(() => {
      downloadLink.value?.click();
      URL.revokeObjectURL(blobUrl.value);
      blobUrl.value = '';
    });
  }

  const storage = useStorage();

  async function loadBlobFromDisk(file: File) {
    const blob = await file.arrayBuffer();
    const bytes = new Uint8Array(blob);
    await storage.addBundle(bytes, file.name);
  }

  return {
    blobUrl,
    setDownloadLink(link: HTMLAnchorElement | null) {
      downloadLink.value = link;
    },
    saveSysexDataToDisk,
  };
}
