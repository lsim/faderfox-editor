import { ref } from 'vue';
import { defineStore } from 'pinia';

export default defineStore('confirm', () => {
  const header = ref<string>();
  const message = ref<string>();
  const resolve = ref<(() => void) | null>(null);
  const reject = ref<(() => void) | null>(null);

  const positiveText = ref<string>();
  const negativeText = ref<string>();

  function showIt(
    _header: string,
    _message: string,
    _positiveText: string = 'OK',
    _negativeText: string = 'Cancel',
  ) {
    return new Promise<void>((_resolve, _reject) => {
      header.value = _header;
      message.value = _message;
      positiveText.value = _positiveText;
      negativeText.value = _negativeText;
      resolve.value = _resolve;
      reject.value = _reject;
    }).finally(() => {
      console.log('clearing resolve/reject');

      resolve.value = null;
      reject.value = null;
    });
  }

  return {
    header,
    message,
    resolve,
    reject,
    positiveText,
    negativeText,
    showIt,
  };
});
