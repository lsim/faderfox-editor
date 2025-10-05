import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';

export type Settings = {
  preventArrowEditing: boolean;
};

export const useSettingsStore = defineStore('settings', () => {
  const settings = useLocalStorage<Partial<Settings>>('settings', {});
  console.log('created/loaded settings', settings);
  return {
    settings,
  };
});
