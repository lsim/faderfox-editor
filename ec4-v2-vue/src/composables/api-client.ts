import { createFetch, useLocalStorage, useWebSocket, type UseWebSocketReturn } from '@vueuse/core';
import { ref, watch } from 'vue';
import { EncoderSetup } from '@/domain/EncoderSetup.ts';
import useToast from '@/composables/toast.ts';
import useBusy from '@/composables/busy.ts';

export interface Publication {
  name: string;
  timestamp: number;
  authorId?: string;
  authorName?: string;
  description?: string;
  type: 'setup';
  id: string;
}

interface SetupPublication extends Publication {
  data: EncoderSetup | null;
  type: 'setup';
}

const sslBackend = import.meta.env.VITE_SSL_BACKEND === 'true';
const backendHost = import.meta.env.VITE_BACKEND_HOST || 'localhost';

console.log('sslBackend', sslBackend);
console.log('backendHost', backendHost);

const urls = {
  service: `${sslBackend ? 'https' : 'http'}://${backendHost}`,
  websocket: `${sslBackend ? 'wss' : 'ws'}://${backendHost}/subscribe`,
};

class ApiClient {
  public readonly token = useLocalStorage('token', '');
  public readonly userName = useLocalStorage('userName', '');
  public readonly email = useLocalStorage('email', '');
  private ws: UseWebSocketReturn<any> | null = null;
  public readonly backendPublications = ref<Publication[]>([]);
  // Show the login dialog when this promise is set
  public readonly loginPromise = ref<Promise<void> | null>(null);
  public readonly loginResolver = ref<(() => void) | null>(null);
  public readonly numUpdates = ref(0);

  constructor(
    private readonly toast: ReturnType<typeof useToast>,
    private readonly busy: ReturnType<typeof useBusy>,
  ) {
    this.connect();
  }

  private readonly useFetch = createFetch({
    baseUrl: urls.service,
    fetchOptions: {
      headers: {
        Accept: 'application/json',
      },
    },
    options: {
      beforeFetch: async ({ options }) => {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${this.token.value}`,
        };
      },
      onFetchError: async (ctx) => {
        console.warn('Fetch error', ctx.response?.status, ctx.response?.statusText);
        if (!ctx.response) return ctx;
        if (ctx.response.status === 401) {
          await this.loginUser();
          return await ctx.execute();
        }
        console.error(`Fetch error: ${ctx.response.status} ${ctx.error.message}`);
        return ctx;
      },
    },
  });

  async loadPublications() {
    this.backendPublications.value = (await this.busy.setBusy(this.getPublications())) || [];
  }

  connect() {
    if (this.ws) return;

    // Register watcher async so they don't get torn down when the calling component unmounts
    setTimeout(async () => {
      console.debug('connecting ws...');
      this.ws = useWebSocket(urls.websocket, {
        heartbeat: {
          message: 'ping',
          interval: 5000,
          pongTimeout: 1000,
        },
        autoReconnect: true,
      });

      watch(this.ws.data, (newData) => {
        if (!newData || newData === 'pong') return;
        console.debug('ws received', newData);
        const msg = JSON.parse(newData);
        if (msg.type === 'publications-updated') {
          this.numUpdates.value++;
          this.loadPublications().then();
        }
        if (this.ws) this.ws.data.value = null;
      });
    });
  }

  async loginUser() {
    console.debug('loginUser');
    this.token.value = '';
    this.userName.value = '';
    // This line causes the login dialog to show
    try {
      await (this.loginPromise.value = new Promise<void>((r) => (this.loginResolver.value = r)));
    } finally {
      this.loginPromise.value = null;
      this.loginResolver.value = null;
    }
  }

  fetch<T>(
    path:
      | 'hello'
      | 'publications'
      | 'auth/register'
      | 'auth/login'
      | 'auth/recovery'
      | 'auth/reset',
    id = '',
  ) {
    const argSuffix = id ? `/${id}` : '';
    return this.useFetch<T>(`${path}${argSuffix}`);
  }

  async register(username: string, password: string, email: string) {
    const { data, response } = await this.fetch('auth/register')
      .post({ username, password, email })
      .text();
    if (!response.value || response.value.status !== 201) {
      console.error(`Register failed (${response.value?.status}): ${response.value?.statusText}`);
      this.toast.show('Registration failed', 'error');
      return;
    }

    if (data.value) {
      this.token.value = data.value;
      this.userName.value = username;
      this.loginResolver.value?.();
    }
    this.toast.show(`Registration successful. Welcome aboard, ${username}!`, 'success');
    return !!data.value;
  }

  async login(username: string, password: string) {
    const { data, statusCode, response } = await this.fetch('auth/login')
      .post({ username, password })
      .text();
    if (statusCode.value !== 200) {
      this.toast.show('Login failed', 'error');
      console.error(`Login failed (${statusCode.value}): ${response.value?.statusText}`);
      return false;
    }
    if (data.value) {
      this.token.value = data.value;
      this.userName.value = username;
      this.loginResolver.value?.();
    }
    this.toast.show(`Login successful. Welcome back, ${username}!`, 'success');
    return !!data.value;
  }

  async sendRecoveryEmail(email: string) {
    this.toast.show('Sending recovery email...', 'info');
    const url = new URL(
      window.location.protocol + window.location.host + import.meta.env.BASE_URL + '/',
    );
    console.debug('Recovery url', url.toString());
    const { data, statusCode, response } = await this.fetch('auth/recovery')
      .post({ email, host: url.toString() })
      .text();
    if (statusCode.value !== 200) {
      console.error(`Recovery email failed (${statusCode.value}): ${response.value?.statusText}`);
      return false;
    }
    return !!data.value;
  }

  async resetPassword(password: string) {
    const { data, statusCode, response } = await this.fetch('auth/reset').post({ password }).text();
    if (statusCode.value !== 200) {
      console.error(`Reset password failed (${statusCode.value}): ${response.value?.statusText}`);
      return false;
    }

    if (data.value) {
      this.token.value = data.value;
      this.loginResolver.value?.();
    }
    return !!data.value;
  }

  logout() {
    this.token.value = '';
    this.userName.value = '';
    this.email.value = '';
    this.loginResolver.value = null;
    this.loginPromise.value = null;
    this.toast.show('Logged out. See you soon!', 'info');
  }

  async getPublications() {
    const { data, response } = await this.fetch<Publication[]>('publications').get().json();
    if (!data.value || response.value?.status !== 200) {
      console.error(
        `Failed to fetch publications (${response.value?.status}): ${response.value?.statusText}`,
      );
      this.toast.show('Failed to fetch publications', 'error');
      return [];
    }
    return data.value;
  }

  async getFullPublication(id: string) {
    const { data, response } = await this.fetch<Publication>('publications', id).get().json();
    if (!data.value || response.value?.status !== 200) {
      console.error(
        `Failed to fetch publication (${response.value?.status}): ${response.value?.statusText}`,
      );
      this.toast.show('Failed to fetch the contents of the publication', 'error');
      return null;
    }
    const setup = new EncoderSetup(0, '');
    setup.fromObject(data.value.data);
    return setup;
  }

  async patchPublication(id: string, description: string) {
    const { data, response } = await this.fetch<Publication>('publications', id)
      .patch({ description, timestamp: Date.now() })
      .text();
    if (!data.value || response.value?.status !== 200) {
      console.error(
        `Failed to update publication (${response.value?.status}): ${response.value?.statusText}`,
      );
      this.toast.show('Failed to update publication', 'error');
      return null;
    }
    this.toast.show('Publication updated successfully', 'info');
    return data.value;
  }

  // Returns the backend id of the publication
  async publishSetup(
    setup: EncoderSetup,
    description: string,
    timestamp: number,
  ): Promise<string | null> {
    const publication: Omit<SetupPublication, 'id'> = {
      data: setup,
      type: 'setup',
      description,
      name: setup.name,
      timestamp,
    };

    const { data, response } = await this.fetch('publications', setup.backendId || '')
      .post(publication)
      .text();
    if (!data.value || (response.value?.status !== 201 && response.value?.status !== 200)) {
      console.error(
        `Failed to publish setup (${response.value?.status}): ${response.value?.statusText}`,
      );
      this.toast.show('Failed to publish setup', 'error');
      return null;
    }
    const encouragement = [
      'You are awesome',
      'You are amazing',
      'You superstar',
      'You legend',
      'You hero, you',
      'Way to give back',
    ].sort(() => Math.random() - 0.5)[0];

    this.toast.show(
      `The setup ${setup.name} was published successfully. ${encouragement}!`,
      'celebrate',
    );
    return data.value;
  }

  async unpublishSetup(id: string) {
    const { data, response } = await this.fetch('publications', id).delete().text();
    if (!data.value || response.value?.status !== 200) {
      console.error(
        `Failed to unpublish setup (${response.value?.status}): ${response.value?.statusText}`,
      );
      this.toast.show('Failed to unpublish setup', 'error');
      return null;
    }
    this.toast.show('Setup unpublished successfully', 'info');
    return data.value;
  }
}

let apiClient: ApiClient | null = null;

export default function useApiClient() {
  if (!apiClient) {
    const toast = useToast();
    const busy = useBusy();
    apiClient = new ApiClient(toast, busy);
  }
  return apiClient;
}
