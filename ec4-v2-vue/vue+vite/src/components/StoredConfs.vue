<script setup lang="ts">
import { type BundleMeta, useStorage } from '@/composables/storage.ts';
import { formatDate, useDropZone } from '@vueuse/core';
import useConfirm from '@/composables/confirm.ts';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import useFileStorage from '@/composables/fileStorage.ts';
import router from '@/router';
import { ref } from 'vue';

const confirm = useConfirm();
const fileStorage = useFileStorage();

const dropZone = ref<HTMLElement | null>(null);
const { isOverDropZone } = useDropZone(dropZone, {
  onDrop: fileStorage.onDrop,
  preventDefaultForUnhandled: true,
  multiple: false,
});

const storage = useStorage();

function dateString(date: number) {
  return formatDate(new Date(date), 'DD/MM/YYYY HH:mm');
}

async function deleteBundle(meta: BundleMeta) {
  const shouldNavigate = meta.id === ec4.activeBundle.id;
  await confirm
    .showIt(
      'Delete stored configuration',
      `Delete configuration "${meta.name} from ${dateString(meta.timestamp)}"?`,
      'Delete',
      'Cancel',
    )
    .then(async () => {
      await storage.deleteBundle(meta);
      if (shouldNavigate) await router.push({ name: 'home' });
    })
    .catch(() => {});
}

const ec4 = useEc4Store();

async function editBundle(meta: BundleMeta) {
  if (meta.id === ec4.activeBundle.id) return;
  await router.push({ name: 'bundle', params: { bundleId: meta.id } });
}

async function newBundle() {
  ec4.selectedSetupIndex = 0;
  ec4.selectedGroupIndex = 0;
  ec4.selectedEncoderIndex = 0;
  await router.push({ name: 'home' });
}

async function downloadBundle(meta: BundleMeta) {
  const bundle = await storage.getBundle(meta);
  if (!bundle?.bytes) return;
  console.log('Saving bytes to disk', bundle.bytes.length);
  await fileStorage.saveSysexDataToDisk(bundle.bytes);
}
</script>

<template>
  <div class="pico stored-confs" ref="dropZone" :class="{ dragover: isOverDropZone }">
    <nav>
      <ul>
        <li><h2>Bundles stored locally</h2></li>
      </ul>
      <ul>
        <li><button @click="newBundle">New</button></li>
      </ul>
    </nav>
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
          :class="{ active: meta.id === ec4.activeBundle.id }"
          @click.capture.prevent="editBundle(meta)"
          v-for="meta in (storage.bundleMetas.value || []).filter(
            (m: BundleMeta | undefined) => !!m,
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
                  <li><a href="#" @click.prevent="deleteBundle(meta)">Delete</a></li>
                  <li><a href="#" @click.prevent="downloadBundle(meta)">Download</a></li>
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
  &.active {
    cursor: default;
    box-shadow: 0 0 20px inset $active-field-color;
    * {
      background-color: transparent;
    }
  }

  input {
    margin: 0 !important;
  }

  td.actions {
    * {
      margin: 0;
      padding: 0;
    }
    font-size: 80%;
    ul {
      flex: 1 0 auto;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: start;

      li {
        flex: 1 0 auto;
        a {
        }
      }
    }
  }
}
</style>
