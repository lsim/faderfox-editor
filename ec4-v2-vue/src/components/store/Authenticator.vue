<script setup lang="ts">
import { ref, useTemplateRef, computed, watch } from 'vue';
import useApiClient from '@/composables/api-client.ts';

import useToast from '@/composables/toast.ts';

const toast = useToast();

const props = defineProps<{
  initialState?: 'register' | 'login' | 'recover' | 'password-reset';
}>();

const username = ref('');
const password = ref('');
const passwordConfirm = ref('');
const email = ref('');

const state = ref<'register' | 'login' | 'recover' | 'password-reset'>(
  props.initialState || 'login',
);

const mailInput = useTemplateRef('mail-input');

declare type Fields = 'username' | 'password' | 'passwordConfirm' | 'email';

const fieldShown = computed(() => {
  return {
    username: ['register', 'login'].includes(state.value),
    password: ['register', 'login', 'password-reset'].includes(state.value),
    passwordConfirm: ['register', 'password-reset'].includes(state.value),
    email: ['register', 'recover'].includes(state.value),
  } as Record<Fields, boolean>;
});

const headerText = computed(() => {
  switch (state.value) {
    case 'register':
      return 'Register';
    case 'recover':
      return 'Forgot my password';
    case 'password-reset':
      return 'Choose new password';
    default:
      return 'Login';
  }
});

const visibleNavButtons = computed(() => {
  return {
    register: state.value === 'login',
    login: state.value === 'register',
    recover: state.value === 'login' || state.value === 'register',
  };
});

const mailValid = ref(false);
watch(mailInput, () => {
  mailValid.value = mailInput.value?.checkValidity() ?? false;
});

const apiClient = useApiClient();

async function resetPassword() {
  try {
    const result = await apiClient.resetPassword(password.value);
    if (result) {
      toast.show('Password updated successfully. You may now close this window.', 'success', 10000);
      state.value = 'login';
      return;
    }
  } catch (e) {
    console.error('Failed to update password', e);
  }
  toast.show('Failed to update password. Please try again.', 'error', 10000);
}

async function sendRecoveryEmail() {
  try {
    await apiClient.sendRecoveryEmail(email.value);
    state.value = 'login';
    toast.show('Recovery email sent. Please check your inbox.', 'info', 10000);
  } catch (e) {
    console.error('Failed to send recovery email', e);
    toast.show('Failed to send recovery email. Please try again.', 'error', 10000);
  }
}
</script>

<template>
  <form class="authenticator">
    <nav>
      <ul>
        <li>
          <h2>{{ headerText }}</h2>
        </li>
      </ul>
      <ul>
        <li v-show="visibleNavButtons.register">
          <button type="button" @click.prevent="state = 'register'">Register</button>
        </li>
        <li v-show="visibleNavButtons.login">
          <button type="button" @click.prevent="state = 'login'">Login</button>
        </li>
        <li v-show="visibleNavButtons.recover">
          <button type="button" @click.prevent="state = 'recover'">Forgot my password</button>
        </li>
      </ul>
    </nav>
    <div class="field" v-show="fieldShown.username">
      <label for="username">Username</label>
      <input
        id="username"
        v-model="username"
        type="text"
        placeholder="Username"
        autocomplete="username"
      />
    </div>
    <div class="field" v-show="fieldShown.password">
      <label for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        placeholder="Password"
        :autocomplete="state === 'register' ? 'new-password' : 'current-password'"
      />
    </div>
    <div class="field" v-show="fieldShown.passwordConfirm">
      <label for="passwordConfirm">Confirm password</label>
      <input
        id="passwordConfirm"
        v-model="passwordConfirm"
        type="password"
        placeholder="Confirm password"
        autocomplete="repeat-password"
      />
    </div>
    <!-- email -->
    <div class="field" v-show="fieldShown.email">
      <label for="email">Email (for account recovery)</label>
      <input
        id="email"
        v-model="email"
        ref="mail-input"
        type="email"
        placeholder="Your email here"
        autocomplete="email"
      />
    </div>
    <button
      v-if="state === 'register'"
      type="submit"
      :disabled="!password || password != passwordConfirm"
      @click.prevent.stop="apiClient.register(username, password, email)"
      @submit.prevent.stop="apiClient.register(username, password, email)"
    >
      Register
    </button>
    <button
      v-else-if="state === 'login'"
      type="submit"
      :disabled="!username || !password"
      @click.prevent.stop="apiClient.login(username, password)"
      @submit.prevent.stop="apiClient.login(username, password)"
    >
      Login
    </button>
    <button
      v-else-if="state === 'password-reset'"
      type="submit"
      :disabled="!password || password != passwordConfirm"
      @click.prevent.stop="resetPassword()"
      @submit.prevent.stop="resetPassword()"
    >
      Update password
    </button>
    <button
      v-else
      type="submit"
      :disabled="!email || !mailValid"
      @click.prevent.stop="sendRecoveryEmail"
      @submit.prevent.stop="sendRecoveryEmail"
    >
      Send recovery email
    </button>
  </form>
</template>

<style scoped lang="scss">
#email {
  :valid {
    background-color: #e0ffe0;
  }
  :invalid {
    background-color: #ffe0e0;
  }
}
</style>
