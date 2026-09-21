import { ref } from 'vue';

import { ApiRequestError } from '@/shared/api';
import { DEFAULT_REQUEST_ERROR } from './useFormSubmit';

interface UseDeleteActionOptions {
  confirmMessage: string;
  remove: () => Promise<void>;
}

export function useDeleteAction({ confirmMessage, remove }: UseDeleteActionOptions) {
  const isDeleting = ref(false);
  const deleteError = ref('');

  async function confirmAndDelete(): Promise<void> {
    if (isDeleting.value || !window.confirm(confirmMessage)) {
      return;
    }
    isDeleting.value = true;
    deleteError.value = '';
    try {
      await remove();
    } catch (requestError) {
      deleteError.value =
        requestError instanceof ApiRequestError ? requestError.message : DEFAULT_REQUEST_ERROR;
    } finally {
      isDeleting.value = false;
    }
  }

  return { confirmAndDelete, deleteError, isDeleting };
}
