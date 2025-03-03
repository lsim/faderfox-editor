import './assets/main.scss'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import {createI18n} from "vue-i18n";
import App from './App.vue'
import router from './router'

const app = createApp(App)

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      message: import('./i18n/en.ts'),
    // da: import('./i18n/da.ts'),
    },
  },
});

app.use(i18n);
app.use(createPinia())
app.use(router)

app.mount('#app')
