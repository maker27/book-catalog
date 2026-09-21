<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { BookFormFields } from '@/features/catalog';
import { useAuthorsDirectory } from '@/features/authors';
import { useFormSubmit } from '@/shared/lib';
import { BaseButton, ErrorRetry, FormPageLayout } from '@/shared/ui';
import { useApi } from '@/shared/api';
import { BOOK_FIELDS, buildBookMultipartRequest, createEmptyBookForm, validateBookForm } from '@/shared/forms';

const { api } = useApi();
const router = useRouter();
const { applyApiErrors, fieldErrors, formError, isSubmitting, submit } = useFormSubmit();
const { authors, error: authorsError, load: loadAuthors } = useAuthorsDirectory();

const form = ref(createEmptyBookForm());

onMounted(loadAuthors);

async function handleFormSubmit() {
  fieldErrors.value = validateBookForm(form.value, true);
  if (Object.keys(fieldErrors.value).length > 0) {
    return;
  }

  await submit(async () => {
    const { data, error } = await api.POST('/books', buildBookMultipartRequest(form.value));
    if (error) {
      applyApiErrors(error.errors, BOOK_FIELDS);
      return;
    }
    await router.push(`/books/${data?.data?.id}`);
  });
}
</script>

<template>
  <FormPageLayout :form-error="formError" :is-busy="isSubmitting" title="Новая книга" @form-submit="handleFormSubmit">
    <ErrorRetry
      v-if="authorsError"
      message="Не удалось загрузить список авторов."
      @retry="loadAuthors"
    />
    <BookFormFields v-model="form" :authors="authors" :disabled="isSubmitting" :errors="fieldErrors" />
    <template #actions>
      <BaseButton :loading="isSubmitting" type="submit">Сохранить</BaseButton>
      <BaseButton to="/books" variant="secondary">Отмена</BaseButton>
    </template>
  </FormPageLayout>
</template>
