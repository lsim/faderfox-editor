import { nextTick, ref } from 'vue';
import { useStorage } from '@/composables/storage.ts';
import { Ec4Bundle } from '@/domain/Ec4Bundle.ts';
import { parseSetupsFromSysex } from '@/memoryLayout.ts';

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
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    try {
      const bundle = Ec4Bundle.createEmpty();
      parseSetupsFromSysex(bytes, bundle.setups);
      // Create bundle
      await storage.addBundle(bytes, file.name);
    } catch (e) {
      throw Error(`${file.name} does not appear to be a valid ec4 sysex file`);
    }
  }

  async function onDrop(files: File[] | null, e: DragEvent) {
    for (const file of files || []) {
      await loadBlobFromDisk(file);
    }
  }

  return {
    blobUrl,
    setDownloadLink(link: HTMLAnchorElement | null) {
      downloadLink.value = link;
    },
    saveSysexDataToDisk,
    onDrop,
  };
}
