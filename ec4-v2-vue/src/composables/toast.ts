import { ref } from 'vue';

export type ToastType = 'celebrate' | 'success' | 'error' | 'info' | 'warning';

export class Toast {
  constructor(
    public id: string,
    public message: string,
    public type: ToastType,
    public duration: number = 3000,
  ) {}
}

const activeToasts = ref<Toast[]>([]);

export default function useToast() {
  function show(message: string, type: ToastType, duration: number = 3000) {
    const id = crypto.randomUUID();
    const toast = new Toast(id, message, type, duration);
    activeToasts.value.push(toast);

    setTimeout(() => {
      activeToasts.value = activeToasts.value.filter((t) => t.id !== id);
    }, duration);
  }

  return {
    show,
    activeToasts,
  };
}
