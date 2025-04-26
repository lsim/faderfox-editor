import { ref } from 'vue';

const isBusy = ref(0);

export default function useBusy() {
  function setBusy<T>(p: PromiseLike<T>) {
    isBusy.value++;
    p.then(
      () => isBusy.value--,
      () => isBusy.value--,
    );
    return p;
  }

  return {
    isBusy,
    setBusy,
  };
}
