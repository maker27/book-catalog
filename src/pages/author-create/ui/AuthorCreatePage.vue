<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useApi } from '@/shared/api';
import { useFormSubmit } from '@/shared/lib';
import { AUTHOR_FIELDS, normalizeFullName, validateAuthorForm } from '@/shared/forms';
import { BaseButton, BaseInput, FormPageLayout } from '@/shared/ui';
import { useAuthorsDirectory } from '@/features/authors';

const { api } = useApi();
const router = useRouter();
const { applyApiErrors, fieldErrors, formError, isSubmitting, submit } = useFormSubmit();
const { invalidate: invalidateAuthorsDirectory } = useAuthorsDirectory();

const fullName = ref('');

async function handleFormSubmit() {
  fieldErrors.value = validateAuthorForm(fullName.value);
  if (Object.keys(fieldErrors.value).length > 0) {
    return;
  }

  await submit(async () => {
    const { data, error } = await api.POST('/authors', {
      body: { full_name: normalizeFullName(fullName.value) },
    });
    if (error) {
      applyApiErrors(error.errors, AUTHOR_FIELDS);
      return;
    }
    invalidateAuthorsDirectory();
    await router.push(`/authors/${data?.data?.id}`);
  });
}
</script>

<template>
  <FormPageLayout :form-error="formError" :is-busy="isSubmitting" title="Новый автор" @form-submit="handleFormSubmit">
    <BaseInput
      v-model="fullName"
      :disabled="isSubmitting"
      :error="fieldErrors.full_name"
      label="ФИО автора"
      required
    />
    <template #actions>
      <BaseButton :loading="isSubmitting" type="submit">Сохранить</BaseButton>
      <BaseButton to="/authors" variant="secondary">Отмена</BaseButton>
    </template>
  </FormPageLayout>
</template>
