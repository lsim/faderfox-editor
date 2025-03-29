<script setup lang="ts">
import { type BundleMeta, useStorage } from '@/composables/storage.ts';
import { formatDate } from '@vueuse/core';
import useConfirm from '@/composables/confirm.ts';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import useFileStorage from '@/composables/fileStorage.ts';
import { Ec4Bundle } from '@/domain/Ec4Bundle.ts';
import router from '@/router';

const confirm = useConfirm();

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
    .then(() => storage.deleteBundle(meta))
    .catch(() => {});
  if (shouldNavigate) await router.push({ name: 'home' });
}

const ec4 = useEc4Store();

async function editBundle(meta: BundleMeta) {
  await router.push({ name: 'bundle', params: { bundleId: meta.id } });
}

async function newBundle() {
  ec4.selectedSetupIndex = 0;
  ec4.selectedGroupIndex = 0;
  ec4.selectedEncoderIndex = 0;
  await router.push({ name: 'home' });
}

const fileStorage = useFileStorage();

async function downloadBundle(meta: BundleMeta) {
  const bundle = await storage.getBundle(meta);
  if (!bundle?.bytes) return;
  console.log('Saving bytes to disk', bundle.bytes.length);
  await fileStorage.saveSysexDataToDisk(bundle.bytes);
}
</script>

<template>
  <div class="pico">
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
          @click.capture="editBundle(meta)"
          v-for="meta in (storage.bundleMetas.value || []).filter(
            (m: BundleMeta | undefined) => !!m,
          )"
          :key="meta.id"
        >
          <td>
            <span>{{ meta.name }}</span>
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

tbody tr {
  cursor: pointer;
  &:hover {
    filter: brightness(1.2);
  }
  &.active {
    filter: drop-shadow(0 0 3px $active-field-color);
    scale: 1.01;
    border-radius: 0.5rem;

    animation: grow ease 0.2s;
    @keyframes grow {
      0% {
        scale: 1;
      }
      30% {
        scale: 1.05;
      }
      100% {
        scale: 1.02;
      }
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
