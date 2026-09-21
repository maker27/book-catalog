import { ref } from 'vue';

import { unwrapResponse, useApi, type AuthorShort } from '@/shared/api';

export const AUTHORS_DIRECTORY_LIMIT = 100;

const authors = ref<AuthorShort[]>([]);
const error = ref<unknown>(null);
const isPending = ref(false);

let isLoaded = false;
let pendingLoad: Promise<void> | null = null;

export function useAuthorsDirectory() {
  const { api } = useApi();

  function load(): Promise<void> {
    if (isLoaded) {
      return Promise.resolve();
    }
    if (pendingLoad) {
      return pendingLoad;
    }

    isPending.value = true;
    error.value = null;

    pendingLoad = api
      .GET('/authors', { params: { query: { page: 1, 'per-page': AUTHORS_DIRECTORY_LIMIT } } })
      .then(unwrapResponse)
      .then((result) => {
        authors.value = result.items ?? [];
        isLoaded = true;
      })
      .catch((loadError: unknown) => {
        error.value = loadError;
      })
      .finally(() => {
        isPending.value = false;
        pendingLoad = null;
      });

    return pendingLoad;
  }

  function invalidate(): void {
    isLoaded = false;
  }

  return { authors, error, invalidate, isPending, load };
}
