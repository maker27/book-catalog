import { watch, type Ref } from 'vue';
import { useRouter } from 'vue-router';

import { ApiRequestError, NOT_FOUND_STATUS } from '@/shared/api';

const NOT_FOUND_ROUTE = '/not-found';

export function useNotFoundRedirect(error: Ref<unknown>): void {
  const router = useRouter();

  watch(
    error,
    (failure) => {
      if (failure instanceof ApiRequestError && failure.status === NOT_FOUND_STATUS) {
        router.replace(NOT_FOUND_ROUTE);
      }
    },
    { immediate: true },
  );
}
