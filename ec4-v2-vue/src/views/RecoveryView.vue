<script setup lang="ts">
import BgWaves from '@/components/BgWaves.vue';
import Authenticator from '@/components/store/Authenticator.vue';
import useApiClient from '@/composables/api-client.ts';

const props = defineProps<{
  token: string;
}>();

const apiClient = useApiClient();
apiClient.token.value = props.token;
</script>

<template>
  <main id="password-reset">
    <bg-waves class="banner" />
    <authenticator class="authenticator pico" initial-state="password-reset" />
  </main>
</template>

<style scoped lang="scss">
@use '../assets/main.scss' as *;
@use '@picocss/pico/scss/colors/index.scss' as *;

#password-reset {
  margin: 0 auto;
  display: grid;
  max-width: 1000px;

  .banner {
    grid-row: 1;
    height: 12vh;
  }

  .authenticator {
    grid-row: 2;
  }
}
</style>
