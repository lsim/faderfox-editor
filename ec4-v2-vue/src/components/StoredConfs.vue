<script setup lang="ts">
import { type DbBundleMeta, useStorage } from '@/composables/storage.ts';
import { formatDate, useDropZone } from '@vueuse/core';
import Modal from '@/components/Modal.vue';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import useFileStorage from '@/composables/fileStorage.ts';
import router from '@/router';
import { ref, nextTick } from 'vue';
import useMidi from '@/composables/useMidi.ts';
import useToast from '@/composables/toast.ts';
import { Trash, HardDriveDownload, ArrowRight, KeyboardMusic, PackagePlus } from 'lucide-vue-next';

const fileStorage = useFileStorage();
const invalidFileConfirm = ref<{ showIt: (...args: unknown[]) => Promise<void> } | null>(null);
const confirmDeleteDialog = ref<{ showIt: (...args: unknown[]) => Promise<void> } | null>(null);

const dropZone = ref<HTMLElement | null>(null);
const { isOverDropZone } = useDropZone(dropZone, {
  onDrop,
  preventDefaultForUnhandled: true,
  multiple: true,
});

const storage = useStorage();

function dateString(date: number) {
  return formatDate(new Date(date), 'DD / MM / YYYY HH:mm');
}

async function deleteBundle(meta: DbBundleMeta) {
  const shouldNavigate = meta.id === ec4.activeBundleId;
  await confirmDeleteDialog.value
    ?.showIt(
      'Delete stored configuration',
      `Delete configuration '${meta.name}' from ${dateString(meta.timestamp)}?`,
      'Delete',
      'Cancel',
    )
    .then(async () => {
      await storage.deleteBundle(meta);
      if (shouldNavigate) await ec4.newBundle();
    })
    .catch(() => {});
}

const ec4 = useEc4Store();

const midi = useMidi();
const toast = useToast();

async function editBundle(meta: DbBundleMeta) {
  if (meta.id === ec4.activeBundleId) return;
  nextTick(() => router.push({ name: 'bundle', params: { bundleId: meta.id } })).then();
}

async function downloadBundle(meta: DbBundleMeta) {
  const bundle = await storage.getBundle(meta);
  if (!bundle?.bytes) return;
  console.log('Saving bytes to disk', bundle.bytes.length);
  await fileStorage.saveSysexDataToDisk(bundle.bytes, meta.name);
}

async function sendBundle(meta: DbBundleMeta) {
  const bundle = await storage.getBundle(meta);
  if (!bundle?.bytes) return;
  toast.show(
    'Sending to EC4. You should be in the receiving screen. You will see progress there',
    'info',
  );
  midi.sendBundle(bundle);
}

async function onDrop(files: File[] | null, e: DragEvent) {
  e.preventDefault();
  try {
    await fileStorage.onDrop(files);
  } catch (e) {
    const msg = (e as Error).message;
    // Not a sysex file
    invalidFileConfirm.value?.showIt('Invalid file', msg, 'Ok', '');
  }
}
</script>

<template>
  <div class="pico stored-confs" ref="dropZone" :class="{ dragover: isOverDropZone }">
    <modal ref="invalidFileConfirm" />
    <modal ref="confirmDeleteDialog" />
    <nav>
      <ul>
        <li><h3>Local bundles</h3></li>
      </ul>
      <ul>
        <li>
          <button @click="ec4.newBundle()" title="New bundle"><package-plus /></button>
        </li>
      </ul>
    </nav>
    <p>
      Note: Bundles are stored in your browser and do not leave your computer. Auto save simply
      persists data so that you can close your browser without losing your work.
    </p>
    <p class="hint">Tip: Drag and drop your sysex file here to edit it</p>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Last saved</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          tabIndex="-1"
          :class="{ active: meta.id === ec4.activeBundleId }"
          @click.prevent="editBundle(meta)"
          v-for="meta in (storage.bundleMetas.value || []).filter(
            (m: DbBundleMeta | undefined) => !!m,
          )"
          :key="meta.id"
        >
          <td>
            <span
              class="dymo-label bundle-name"
              :style="{
                rotate: (meta.id % 3) - 1.5 + 'deg',
                padding: `0 ${(meta.id + 33) % 20}px`,
              }"
              >{{ meta.name }}
            </span>
          </td>
          <td>{{ dateString(meta.timestamp) }}</td>
          <td class="actions">
            <aside>
              <nav>
                <ul>
                  <li>
                    <a
                      href="#"
                      @click.prevent.stop="downloadBundle(meta)"
                      title="Save sysex to disk"
                      ><hard-drive-download
                    /></a>
                  </li>
                  <li>
                    <a
                      href="#"
                      @click.prevent="sendBundle(meta)"
                      :class="{
                        disabled: !midi.selectedOutput.value,
                      }"
                      title="Send to EC4"
                      ><arrow-right /><keyboard-music
                    /></a>
                  </li>
                  <li>
                    <a href="#" @click.prevent.stop="deleteBundle(meta)" title="Delete"
                      ><trash
                    /></a>
                  </li>
                </ul>
              </nav>
            </aside>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
@use '@picocss/pico/scss/colors/index.scss' as *;
@use '@/assets/main.scss' as *;

.stored-confs {
  position: relative;
  &::before {
    content: '';
    position: absolute;
    opacity: 0;
    scale: 0;
    z-index: 1;
    top: -5%;
    left: -5%;
    height: 110%;
    width: 110%;
    background-color: transparent;
    border: 5px dashed $green;
    border-radius: 40px;
    animation: out 200ms ease-in-out;
    @keyframes out {
      0% {
        scale: 1;
        opacity: 0.8;
      }
      100% {
        scale: 0.5;
        opacity: 0;
      }
    }
  }
  &.dragover::before {
    opacity: 0.8;
    scale: 1;
    animation: in 200ms ease-in-out;
    @keyframes in {
      0% {
        scale: 0.5;
        opacity: 0;
      }
      100% {
        scale: 1;
        opacity: 0.8;
      }
    }
  }
}

.bundle-name {
  display: inline-block;
}

tbody tr {
  cursor: pointer;
  transition: box-shadow 0.8s ease;
  &.active {
    cursor: default;
    box-shadow: 0 0 20px inset $slate-300;
    * {
      background-color: transparent;
    }
  }

  input {
    margin: 0 !important;
  }

  td.actions {
    font-size: 80%;
    * {
      margin: 0;
      padding: 0;
    }
    ul {
      flex: 1 0 auto;
      height: 100%;
      display: flex;
      align-items: start;

      li {
        flex: 1 0 auto;

        .disabled {
          * {
            cursor: not-allowed;
            //color: $red;
            opacity: 0.6;
          }
        }
      }
    }
  }
}

.hint {
  font-style: italic;
  font-size: 80%;
  opacity: 0.8;
}
</style>
