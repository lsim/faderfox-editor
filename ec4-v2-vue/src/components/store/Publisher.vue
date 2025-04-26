<script setup lang="ts">
import type { EncoderSetup } from '@/domain/EncoderSetup.ts';
import useApiClient from '@/composables/api-client.ts';
import { ref, computed } from 'vue';

const props = defineProps<{
  setup: EncoderSetup;
}>();

const emit = defineEmits<{
  (event: 'done'): void;
}>();

const description = ref('');

const apiClient = useApiClient();

// Load existing description if backendId is set
(async () => {
  if (props.setup.backendId) {
    await apiClient.loadPublications();
    const setup = apiClient.backendPublications.value.find((s) => s.id === props.setup.backendId);
    if (setup) {
      description.value = setup.description;
    }
  }
})();

async function publish() {
  props.setup.backendId =
    (await apiClient.publishSetup(props.setup, description.value, Date.now())) || undefined;
  emit('done');
}

const headerText = computed(() => {
  if (props.setup.backendId) {
    return 'Update your setup';
  }
  return 'Publish your setup';
});
</script>

<template>
  <form class="publisher">
    <h3>{{ headerText }}</h3>

    <div class="field">
      <label for="description"
        >Please write a few words for your fellow noodlers about what is in this setup. Use markdown
        if you want to be fancy!</label
      >
      <textarea id="description" v-model="description" required placeholder="Description" />
    </div>
    <nav>
      <ul>
        <li>
          <button @click.prevent="emit('done')">Cancel</button>
        </li>
        <li>
          <button @click.prevent="publish()" :disabled="!description">Publish!</button>
        </li>
      </ul>
    </nav>
  </form>
</template>

<style scoped lang="scss"></style>
