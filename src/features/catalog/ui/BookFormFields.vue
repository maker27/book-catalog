<script setup lang="ts">
import { computed } from 'vue';
import type { AuthorShort } from '@/shared/api';
import { handleCoverError } from '@/shared/lib';
import BaseInput from '@/shared/ui/components/base/BaseInput.vue';
import BaseTextarea from '@/shared/ui/components/base/BaseTextarea.vue';
import type { BookFormErrors, BookFormState } from '@/shared/forms';

const props = defineProps<{
  authors: AuthorShort[];
  coverPreviewUrl?: string;
  disabled?: boolean;
  errors: BookFormErrors;
  modelValue: BookFormState;
}>();

const emit = defineEmits<{ 'update:modelValue': [BookFormState] }>();

const selectedAuthorIds = computed(() => new Set(props.modelValue.authorIds));

function update(patch: Partial<BookFormState>) {
  emit('update:modelValue', { ...props.modelValue, ...patch });
}

function handleAuthorChange(authorId: number, checked: boolean) {
  const next = props.modelValue.authorIds.filter((id) => id !== authorId);
  if (checked) {
    next.push(authorId);
  }
  update({ authorIds: next });
}

function handleAuthorInput(event: Event, authorId: number) {
  const target = event.target;
  if (target instanceof HTMLInputElement) {
    handleAuthorChange(authorId, target.checked);
  }
}

function handleCoverChange(event: Event) {
  const target = event.target;
  if (target instanceof HTMLInputElement) {
    update({ cover: target.files?.[0] ?? null });
  }
}
</script>

<template>
  <div class="book-form-fields">
    <BaseInput
      :disabled="disabled"
      :error="errors.title"
      label="Название"
      :model-value="modelValue.title"
      required
      @update:model-value="update({ title: $event })"
    />

    <BaseInput
      :disabled="disabled"
      :error="errors.year"
      label="Год издания"
      :model-value="modelValue.year"
      required
      @update:model-value="update({ year: $event })"
    />

    <BaseInput
      :disabled="disabled"
      :error="errors.isbn"
      label="ISBN"
      :model-value="modelValue.isbn"
      placeholder="978-5-0000-0000-0"
      @update:model-value="update({ isbn: $event })"
    />

    <BaseTextarea
      :disabled="disabled"
      :error="errors.description"
      label="Описание"
      :model-value="modelValue.description"
      @update:model-value="update({ description: $event })"
    />

    <fieldset class="book-form-fields__authors">
      <legend class="book-form-fields__legend">Авторы</legend>
      <p v-if="authors.length === 0" class="book-form-fields__empty">
        Сначала добавьте автора в справочник.
      </p>
      <label v-for="author in authors" :key="author.id" class="book-form-fields__author">
        <input
          :checked="selectedAuthorIds.has(author.id ?? 0)"
          :disabled="disabled"
          type="checkbox"
          @change="handleAuthorInput($event, author.id ?? 0)"
        />
        {{ author.full_name }}
      </label>
      <p v-if="errors.author_ids" class="book-form-fields__error" role="alert">
        {{ errors.author_ids }}
      </p>
    </fieldset>

    <div class="book-form-fields__cover">
      <label class="book-form-fields__legend" for="book-cover"> Обложка </label>
      <img
        v-if="coverPreviewUrl"
        alt=""
        class="book-form-fields__preview"
        :src="coverPreviewUrl"
        @error="handleCoverError"
      />
      <input
        id="book-cover"
        accept="image/jpeg,image/png,image/webp"
        :disabled="disabled"
        type="file"
        @change="handleCoverChange"
      />
      <p v-if="errors.cover" class="book-form-fields__error" role="alert">
        {{ errors.cover }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.book-form-fields {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.book-form-fields__authors {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
}

.book-form-fields__legend {
  font-size: var(--font-size-label-md);
}

.book-form-fields__author {
  align-items: center;
  display: flex;
  gap: var(--spacing-xs);
  font-size: var(--font-size-body-sm);
}

.book-form-fields__cover {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.book-form-fields__preview {
  border-radius: var(--radius-card);
  max-width: 160px;
}

.book-form-fields__empty {
  color: var(--color-muted);
  font-size: var(--font-size-body-sm);
}

.book-form-fields__error {
  color: var(--color-error);
  font-size: var(--font-size-label-sm);
}
</style>
