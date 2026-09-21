<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { BookFormFields } from '@/features/catalog';
import { useAuthorsDirectory } from '@/features/authors';
import { useFormSubmit, useNotFoundRedirect, useResource } from '@/shared/lib';
import { BaseButton, ErrorRetry, FormPageLayout } from '@/shared/ui';
import { ApiRequestError, NOT_FOUND_STATUS, unwrapResponse, useApi, type Book } from '@/shared/api';
import {
  BOOK_FIELDS,
  buildBookJsonBody,
  buildBookMultipartRequest,
  createEmptyBookForm,
  validateBookForm,
} from '@/shared/forms';

const { api } = useApi();
const router = useRouter();
const route = useRoute();
const { applyApiErrors, fieldErrors, formError, isSubmitting, submit } = useFormSubmit();
const { authors, error: authorsError, load: loadAuthors } = useAuthorsDirectory();

const bookId = computed(() => Number(route.params.id));
const form = ref(createEmptyBookForm());

const {
  data: book,
  error,
  isPending,
  reload: loadBook,
} = useResource<Book | null>(
  () => api.GET('/books/{id}', { params: { path: { id: bookId.value } } }).then(unwrapResponse),
  null,
);

useNotFoundRedirect(error);

const hasLoadError = computed(() => {
  return (
    Boolean(error.value) &&
    !(error.value instanceof ApiRequestError && error.value.status === NOT_FOUND_STATUS)
  );
});

onMounted(() => {
  loadBook();
  loadAuthors();
});

watch(bookId, loadBook);

watch(
  book,
  (loaded) => {
    if (!loaded) {
      return;
    }
    form.value = {
      authorIds: (loaded.authors ?? []).map((author) => author.id ?? 0),
      cover: null,
      description: loaded.description ?? '',
      isbn: loaded.isbn ?? '',
      title: loaded.title ?? '',
      year: loaded.year ? String(loaded.year) : '',
    };
  },
  { immediate: true },
);

async function handleFormSubmit() {
  fieldErrors.value = validateBookForm(form.value, false);
  if (Object.keys(fieldErrors.value).length > 0) {
    return;
  }

  await submit(async () => {
    const response = form.value.cover
      ? await api.PUT('/books/{id}', {
          params: { path: { id: bookId.value } },
          ...buildBookMultipartRequest(form.value),
        })
      : await api.PATCH('/books/{id}', {
          params: { path: { id: bookId.value } },
          body: buildBookJsonBody(form.value),
        });
    if (response.error) {
      applyApiErrors(response.error.errors, BOOK_FIELDS);
      return;
    }
    await router.push(`/books/${bookId.value}`);
  });
}
</script>

<template>
  <FormPageLayout
    :form-error="formError"
    :has-load-error="hasLoadError"
    :is-busy="isSubmitting"
    :is-load-pending="isPending"
    load-error-message="Не удалось загрузить книгу."
    title="Редактирование книги"
    @form-submit="handleFormSubmit"
    @retry-load="loadBook"
  >
    <ErrorRetry
      v-if="authorsError"
      message="Не удалось загрузить список авторов."
      @retry="loadAuthors"
    />
    <BookFormFields
      v-model="form"
      :authors="authors"
      :cover-preview-url="book?.cover_url"
      :disabled="isSubmitting"
      :errors="fieldErrors"
    />
    <template #actions>
      <BaseButton :loading="isSubmitting" type="submit">Сохранить</BaseButton>
      <BaseButton :to="`/books/${bookId}`" variant="secondary">Отмена</BaseButton>
    </template>
  </FormPageLayout>
</template>
