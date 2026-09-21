import { ref, shallowRef, type Ref, type ShallowRef } from 'vue';

export interface UseResourceReturn<T> {
  data: ShallowRef<T>;
  error: Ref<unknown>;
  isPending: Ref<boolean>;
  reload: () => Promise<void>;
}

export function useResource<T>(loader: () => Promise<T>, initialValue: T): UseResourceReturn<T> {
  const data = shallowRef<T>(initialValue);
  const error = ref<unknown>(null);
  const isPending = ref(false);

  let generation = 0;

  async function reload(): Promise<void> {
    generation += 1;
    const requestGeneration = generation;
    isPending.value = true;
    error.value = null;

    try {
      const result = await loader();
      if (requestGeneration !== generation) {
        return;
      }

      data.value = result;
    } catch (loadError) {
      if (requestGeneration !== generation) {
        return;
      }

      error.value = loadError;
    } finally {
      if (requestGeneration === generation) {
        isPending.value = false;
      }
    }
  }

  return { data, error, isPending, reload };
}
