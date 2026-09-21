<script setup lang="ts">
import { BookFormFields, useBookForm } from '@/features/book-form';
import { BaseButton, ErrorRetry, FormPageLayout } from '@/shared/ui';

const {
  authors,
  authorsError,
  fieldErrors,
  form,
  formError,
  handleFormSubmit,
  isSubmitting,
  loadAuthors,
} = useBookForm();
</script>

<template>
  <FormPageLayout
    :form-error="formError"
    :is-busy="isSubmitting"
    title="Новая книга"
    @form-submit="handleFormSubmit"
  >
    <ErrorRetry
      v-if="authorsError"
      message="Не удалось загрузить список авторов."
      @retry="loadAuthors"
    />
    <BookFormFields
      v-model="form"
      :authors="authors"
      :disabled="isSubmitting"
      :errors="fieldErrors"
    />
    <template #actions>
      <BaseButton :loading="isSubmitting" type="submit">Сохранить</BaseButton>
      <BaseButton to="/books" variant="secondary">Отмена</BaseButton>
    </template>
  </FormPageLayout>
</template>
