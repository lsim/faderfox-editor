<script setup lang="ts">
import Authenticator from '@/components/store/Authenticator.vue';
import useApiClient, { type Publication } from '@/composables/api-client.ts';
import { User } from 'lucide-vue-next';
import { formatDate } from '@vueuse/core';
import { useEc4Store } from '@/stores/faderfox-ec4.ts';
import Publisher from '@/components/store/Publisher.vue';
import { LogOut, CloudDownload, PackageMinus } from 'lucide-vue-next';
import useCopyPaste from '@/composables/copy-paste.ts';
import { computed, onMounted, ref } from 'vue';
import { useFuse } from '@vueuse/integrations/useFuse';
import Modal from '@/components/Modal.vue';
import useToast from '@/composables/toast.ts';
import VueMarkdown from 'vue-markdown-render';

const apiClient = useApiClient();
const copyPaste = useCopyPaste();
const toast = useToast();

const ec4 = useEc4Store();
const confirmDeleteDialog = ref<{ showIt: (...args: unknown[]) => Promise<void> } | null>(null);

function dateString(date: number) {
  return formatDate(new Date(date), 'DD / MM / YYYY HH:mm');
}

async function downloadAndCopy(backendId: string) {
  const fullPublication = await apiClient.getFullPublication(backendId);
  console.debug('copying setup', fullPublication);
  if (!fullPublication) {
    toast.show('Failed to download setup!', 'error');
    return;
  }
  copyPaste.copySetup(fullPublication);
}

async function unpublishSetup(backendId: string, name: string) {
  await confirmDeleteDialog.value
    ?.showIt('Unpublish', `Unpublish '${name}' from the cloud?`, 'Do it!', 'Cancel')
    .then(() => {
      return apiClient.unpublishSetup(backendId);
    })
    .catch(() => {});
}

const filter = ref('');

const chronologicalPublications = computed(() => {
  if (!apiClient.backendPublications.value) return [];
  return apiClient.backendPublications.value.sort((a, b) => b.timestamp - a.timestamp);
});
const { results: filteredPublications } = useFuse<Publication>(filter, chronologicalPublications, {
  fuseOptions: {
    keys: ['name', 'description', 'authorName'],
    threshold: 0.5,
    includeMatches: false,
    findAllMatches: true,
  },
  matchAllWhenSearchEmpty: true,
});

onMounted(() => {
  apiClient.loadPublications();
});
</script>
<template>
  <div class="store pico">
    <modal ref="confirmDeleteDialog" />
    <nav>
      <ul>
        <li><h1>Sharing!</h1></li>
      </ul>
      <ul>
        <li :title="apiClient.token.value ? 'Logout' : 'Not logged in'">
          <button @click.prevent="apiClient.logout()" v-if="apiClient.token.value">
            <log-out />
          </button>
          <button @click.prevent="apiClient.loginUser()" v-else>
            <user />
          </button>
        </li>
      </ul>
    </nav>
    <p>
      This is where you can share your configurations as well as finding configurations shared by
      others. Log in to access these features.
    </p>
    <p>
      Share your own setups by logging in and then alt + hover over the setups and an upload button
      will appear
    </p>
    <authenticator v-if="apiClient.loginPromise.value" />
    <publisher
      v-else-if="ec4.setupToPublish"
      :setup="ec4.setupToPublish"
      @done="ec4.setupToPublish = null"
    />
    <template v-else>
      <nav>
        <ul>
          <li><input type="text" v-model="filter" placeholder="Filter list" /></li>
        </ul>
      </nav>
      <table class="publications shadow">
        <thead>
          <tr>
            <th>Setup Name</th>
            <th>Author</th>
            <th>Published</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="publication in filteredPublications" :key="publication.item.id">
            <tr tabindex="-1">
              <td>
                <span class="dymo-label bundle-name">{{ publication.item.name }} </span>
              </td>
              <td>
                <user
                  class="icon"
                  title="You!"
                  v-if="publication.item.authorName === apiClient.userName.value"
                /><template v-else>{{ publication.item.authorName }}</template>
              </td>
              <td>{{ dateString(publication.item.timestamp) }}</td>
              <td class="actions">
                <nav>
                  <ul>
                    <li title="Copy setup">
                      <a
                        href="#"
                        v-if="publication.item.id"
                        @click.prevent="downloadAndCopy(publication.item.id)"
                        ><cloud-download
                      /></a>
                    </li>
                    <li title="Unpublish setup">
                      <a
                        href="#"
                        v-if="
                          publication.item.id &&
                          publication.item.authorName === apiClient.userName.value
                        "
                        @click.prevent="unpublishSetup(publication.item.id, publication.item.name)"
                        ><package-minus
                      /></a>
                    </li>
                  </ul>
                </nav>
              </td>
            </tr>
            <tr>
              <td tabindex="-1" colspan="4">
                <div class="description-scroller">
                  <vue-markdown :source="publication.item.description" class="description" />
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>
  </div>
</template>

<style scoped lang="scss">
.description-scroller {
  max-height: 200px;
  overflow-y: auto;
}
</style>
