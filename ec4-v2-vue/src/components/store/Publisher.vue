<script setup lang="ts">
import type { EncoderSetup } from '@/domain/EncoderSetup.ts';
import useApiClient from '@/composables/api-client.ts';
import { ref } from 'vue';

const props = defineProps<{
  setup: EncoderSetup;
}>();

const emit = defineEmits<{
  (event: 'done'): void;
}>();

const description = ref('');

const apiClient = useApiClient();

async function publish() {
  props.setup.backendId =
    (await apiClient.publishSetup(props.setup, description.value, Date.now())) || undefined;
  emit('done');
}
</script>

<template>
  <form class="publisher">
    <h3>Publishing '{{ props.setup.name }}'</h3>

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
