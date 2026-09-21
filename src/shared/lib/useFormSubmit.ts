import { ref } from 'vue';
import type { ApiErrorItem } from '@/shared/api';

export const DEFAULT_REQUEST_ERROR = 'Не удалось выполнить запрос. Попробуйте ещё раз.';

export function useFormSubmit() {
  const formError = ref('');
  const isSubmitting = ref(false);
  const fieldErrors = ref<Partial<Record<string, string>>>({});

  function setFieldError(field: string, message: string) {
    fieldErrors.value = { ...fieldErrors.value, [field]: message };
  }

  function clearFieldErrors() {
    fieldErrors.value = {};
  }

  async function submit<T>(task: () => Promise<T>): Promise<T | undefined> {
    if (isSubmitting.value) {
      return;
    }
    isSubmitting.value = true;
    formError.value = '';
    clearFieldErrors();
    try {
      return await task();
    } catch {
      formError.value = DEFAULT_REQUEST_ERROR;
      return;
    } finally {
      isSubmitting.value = false;
    }
  }

  function applyApiErrors(errors: ApiErrorItem[] | undefined, knownFields: readonly string[]): void {
    if (!errors || errors.length === 0) {
      formError.value = DEFAULT_REQUEST_ERROR;
      return;
    }

    const commonMessages: string[] = [];
    for (const item of errors) {
      const field = item.field ?? '';
      const message = item.message ?? DEFAULT_REQUEST_ERROR;
      if (field && knownFields.includes(field)) {
        setFieldError(field, message);
        continue;
      }
      commonMessages.push(message);
    }
    formError.value = commonMessages.join(' ');
  }

  return {
    applyApiErrors,
    clearFieldErrors,
    fieldErrors,
    formError,
    isSubmitting,
    setFieldError,
    submit,
  };
}
