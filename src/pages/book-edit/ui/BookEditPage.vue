<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { BookFormFields, useBookForm } from '@/features/book-form';
import { BaseButton, ErrorRetry, FormPageLayout } from '@/shared/ui';

const route = useRoute();
const bookId = computed(() => Number(route.params.id));

const {
  authors,
  authorsError,
  book,
  fieldErrors,
  form,
  formError,
  handleFormSubmit,
  hasLoadError,
  isLoadPending,
  isSubmitting,
  loadAuthors,
  loadBook,
} = useBookForm({ bookId });
</script>

<template>
  <FormPageLayout
    :form-error="formError"
    :has-load-error="hasLoadError"
    :is-busy="isSubmitting"
    :is-load-pending="isLoadPending"
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
