<script setup lang="ts">
import type { EncoderSetup } from '@/domain/EncoderSetup.ts';
import useApiClient, { type Publication } from '@/composables/api-client.ts';
import { ref, computed, useTemplateRef, watch } from 'vue';

const props = defineProps<{
  setup?: EncoderSetup;
  publication?: Publication;
}>();

const emit = defineEmits<{
  (event: 'done', backendId?: string): void;
}>();

const descriptionRef = useTemplateRef<HTMLTextAreaElement>('descriptionRef');

const description = ref(props.publication?.description || '');

const apiClient = useApiClient();

// Load existing description if backendId is set
if (props.setup?.backendId) {
  (async () => {
    await apiClient.loadPublications();
    const setup = apiClient.backendPublications.value.find((s) => s.id === props.setup?.backendId);
    if (setup?.description) {
      description.value = setup.description;
    }
  })();
}

async function publish() {
  let backendId;
  if (props.setup) {
    backendId =
      (await apiClient.publishSetup(props.setup, description.value, Date.now())) || undefined;
  } else if (props.publication) {
    await apiClient.patchPublication(props.publication.id, description.value);
  }
  emit('done', backendId);
}

const headerText = computed(() => {
  if (props.setup?.backendId || props.publication) {
    return 'Update your setup';
  }
  return 'Publish your setup';
});

const unwatch = watch(descriptionRef, (validRef) => {
  if (validRef) {
    validRef.focus();
    unwatch();
  }
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
      <textarea
        id="description"
        v-model="description"
        required
        placeholder="Description"
        @keydown.meta.enter.prevent="publish()"
        @keydown.ctrl.enter.prevent="publish()"
        rows="10"
        ref="descriptionRef"
      />
    </div>
    <nav>
      <ul>
        <li>
          <button @click.prevent="emit('done')">Cancel</button>
        </li>
        <li>
          <button @click.prevent="publish()" :disabled="!description">
            {{ props.setup && !props.setup.backendId ? 'Publish!' : 'Update!' }}
          </button>
        </li>
      </ul>
    </nav>
  </form>
</template>

<style scoped lang="scss"></style>
