import { createPinia } from 'pinia';
import { createApp } from 'vue';

import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';

import localeEn from './i18n/en.ts';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: localeEn,
  },
});

const app = createApp(App);

app.use(i18n);
app.use(createPinia());
app.use(router);

app.mount('#app');
