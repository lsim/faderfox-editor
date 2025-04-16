import { useStorage } from '@/composables/storage.ts';
import { Ec4Bundle } from '@/domain/Ec4Bundle.ts';
import { parseSetupsFromSysex } from '@/memoryLayout.ts';

export default function useFileStorage() {
  async function saveSysexDataToDisk(bytes: Uint8Array, name: string) {
    const blob = new Blob([bytes], {
      type: 'application/octet-stream',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name || 'ec4-sysex'}.syx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const storage = useStorage();

  async function loadBlobFromDisk(file: File) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    try {
      const bundle = Ec4Bundle.createEmpty();
      parseSetupsFromSysex(bytes, bundle.setups);
      // Create bundle
      await storage.addBundle(bytes, file.name?.replace(/\.syx$/, '') ?? '');
    } catch (e: any) {
      console.warn('Error parsing bundle', e);
      throw Error(`${file.name} does not appear to be a valid ec4 sysex file`);
    }
  }

  async function onDrop(files: File[] | null, e: DragEvent) {
    for (const file of files || []) {
      await loadBlobFromDisk(file);
    }
  }

  return {
    saveSysexDataToDisk,
    onDrop,
  };
}
