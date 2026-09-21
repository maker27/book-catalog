<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAuthorsDirectory } from '@/features/authors';
import { useFormSubmit, useNotFoundRedirect, useResource } from '@/shared/lib';
import { ApiRequestError, NOT_FOUND_STATUS, unwrapResponse, useApi, type Author } from '@/shared/api';
import { AUTHOR_FIELDS, normalizeFullName, validateAuthorForm } from '@/shared/forms';
import { BaseButton, BaseInput, FormPageLayout } from '@/shared/ui';

const { api } = useApi();
const route = useRoute();
const router = useRouter();
const { applyApiErrors, fieldErrors, formError, isSubmitting, submit } = useFormSubmit();
const { invalidate: invalidateAuthorsDirectory } = useAuthorsDirectory();

const authorId = computed(() => Number(route.params.id));
const fullName = ref('');

const {
  data: author,
  error,
  isPending,
  reload: loadAuthor,
} = useResource<Author | null>(
  () => api.GET('/authors/{id}', { params: { path: { id: authorId.value } } }).then(unwrapResponse),
  null,
);

useNotFoundRedirect(error);

const hasLoadError = computed(
  () =>
    Boolean(error.value) &&
    !(error.value instanceof ApiRequestError && error.value.status === NOT_FOUND_STATUS),
);

watch(authorId, loadAuthor, { immediate: true });

watch(
  author,
  (loaded) => {
    if (loaded) {
      fullName.value = loaded.full_name ?? '';
    }
  },
  { immediate: true },
);

async function handleFormSubmit() {
  fieldErrors.value = validateAuthorForm(fullName.value);
  if (Object.keys(fieldErrors.value).length > 0) {
    return;
  }

  await submit(async () => {
    const { error: requestError } = await api.PUT('/authors/{id}', {
      params: { path: { id: authorId.value } },
      body: { full_name: normalizeFullName(fullName.value) },
    });
    if (requestError) {
      applyApiErrors(requestError.errors, AUTHOR_FIELDS);
      return;
    }
    invalidateAuthorsDirectory();
    await router.push(`/authors/${authorId.value}`);
  });
}
</script>

<template>
  <FormPageLayout
    :form-error="formError"
    :has-load-error="hasLoadError"
    :is-busy="isSubmitting"
    :is-load-pending="isPending"
    load-error-message="Не удалось загрузить автора."
    title="Редактирование автора"
    @form-submit="handleFormSubmit"
    @retry-load="loadAuthor"
  >
    <BaseInput
      v-model="fullName"
      :disabled="isSubmitting"
      :error="fieldErrors.full_name"
      label="ФИО автора"
      required
    />
    <template #actions>
      <BaseButton :loading="isSubmitting" type="submit">Сохранить</BaseButton>
      <BaseButton :to="`/authors/${authorId}`" variant="secondary">Отмена</BaseButton>
    </template>
  </FormPageLayout>
</template>
