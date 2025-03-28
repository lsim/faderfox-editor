<script setup lang="ts">
import { type BundleMeta, useStorage } from '@/composables/storage.ts';
import { formatDate } from '@vueuse/core';
import useConfirm from '@/composables/confirm.ts';

import { computed, ref } from 'vue';
import { createEmptyEncoderSetups, useEc4Store } from '@/stores/faderfox-ec4.ts';
import { parseSetupsFromSysex } from '@/memoryLayout.ts';
import useFileStorage from '@/composables/fileStorage.ts';

const confirm = useConfirm();

const storage = useStorage();

function dateString(date: number) {
  return formatDate(new Date(date), 'DD/MM/YYYY HH:mm');
}

function deleteBundle(meta: BundleMeta) {
  confirm
    .showIt(
      'Delete stored configuration',
      `Delete configuration "${meta.name} from ${dateString(meta.timestamp)}"?`,
      'Delete',
      'Cancel',
    )
    .then(() => storage.deleteBundle(meta))
    .catch(() => {});
}

const ec4 = useEc4Store();

async function editBundle(meta: BundleMeta) {
  const bundle = await storage.getBundle(meta);
  if (!bundle) return;
  const setups = createEmptyEncoderSetups();
  parseSetupsFromSysex(bundle.bytes, setups);
  ec4.encoderSetups = setups;
  ec4.selectedSetupIndex = 0;
  ec4.selectedGroupIndex = 0;
}

function newBundle() {
  ec4.encoderSetups = createEmptyEncoderSetups();
  ec4.selectedSetupIndex = 0;
  ec4.selectedGroupIndex = 0;
  ec4.selectedEncoderIndex = 0;
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
          <th>Last edited</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="meta in (storage.bundleMetas.value || []).filter(
            (m: BundleMeta | undefined) => !!m,
          )"
          :key="meta.id"
        >
          <td><input v-model="meta.name" type="text" /></td>
          <td>{{ dateString(meta.timestamp) }}</td>
          <td class="actions">
            <aside>
              <nav>
                <ul>
                  <li><a href="#" @click.prevent="editBundle(meta)">Edit</a></li>
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
.actions {
  display: flex;
  flex-direction: column;
}

aside nav li {
  margin-bottom: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;

  a {
    padding: 5px;
  }
}
</style>
