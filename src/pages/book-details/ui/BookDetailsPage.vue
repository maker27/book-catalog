<script setup lang="ts">
import { computed, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

import { useSessionStore } from '@/features/auth';
import {
  handleCoverError,
  PLACEHOLDER_COVER_URL,
  useDeleteAction,
  useNotFoundRedirect,
  useResource,
} from '@/shared/lib';
import { BaseButton, ErrorRetry } from '@/shared/ui';
import { assertResponseOk, unwrapResponse, useApi, type Book } from '@/shared/api';
import BookDetailSkeleton from './BookDetailSkeleton.vue';

const { api } = useApi();
const route = useRoute();
const router = useRouter();
const session = useSessionStore();

const bookId = computed(() => Number(route.params.id));

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

watch(bookId, loadBook, { immediate: true });

const {
  confirmAndDelete: handleDeleteClick,
  deleteError,
  isDeleting,
} = useDeleteAction({
  confirmMessage: 'Удалить книгу?',
  remove: async () => {
    assertResponseOk(await api.DELETE('/books/{id}', { params: { path: { id: bookId.value } } }));
    await router.push('/books');
  },
});
</script>

<template>
  <div class="book-page">
    <ErrorRetry
      v-if="error"
      message="Не удалось загрузить книгу."
      :pending="isPending"
      @retry="loadBook"
    />

    <BookDetailSkeleton v-else-if="isPending || !book" />

    <article v-else class="book-page__content">
      <img
        :alt="book.title ?? 'Обложка книги'"
        class="book-page__cover"
        :src="book.cover_url || PLACEHOLDER_COVER_URL"
        @error="handleCoverError"
      />
      <div class="book-page__body">
        <h1 class="book-page__title">{{ book.title }}</h1>
        <p class="book-page__meta">Год издания: {{ book.year }}</p>
        <p v-if="book.isbn" class="book-page__meta">ISBN: {{ book.isbn }}</p>
        <ul class="book-page__authors">
          <li v-for="author in book.authors ?? []" :key="author.id">
            <RouterLink :to="`/authors/${author.id}`">{{ author.full_name }}</RouterLink>
          </li>
        </ul>
        <p v-if="book.description" class="book-page__description">{{ book.description }}</p>
        <div v-if="session.isAuthenticated" class="book-page__actions">
          <BaseButton compact :to="`/books/${book.id}/edit`" variant="secondary">
            Редактировать
          </BaseButton>
          <BaseButton compact :loading="isDeleting" variant="secondary" @click="handleDeleteClick">
            Удалить
          </BaseButton>
        </div>
        <p v-if="deleteError" class="book-page__delete-error" role="alert">
          {{ deleteError }}
        </p>
      </div>
    </article>
  </div>
</template>

<style scoped lang="scss">
.book-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.book-page__content {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: minmax(200px, 300px) 1fr;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
}

.book-page__cover {
  border-radius: var(--radius-card);
  width: 100%;
}

.book-page__body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.book-page__title {
  font-size: var(--font-size-headline-lg);
  line-height: var(--line-height-headline-lg);
}

.book-page__meta {
  color: var(--color-muted);
  font-size: var(--font-size-label-lg);
}

.book-page__authors {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.book-page__description {
  font-size: var(--font-size-body-md);
  max-width: 70ch;
}

.book-page__actions {
  display: flex;
  gap: var(--spacing-sm);
}

.book-page__delete-error {
  color: var(--color-error);
  font-size: var(--font-size-body-sm);
}
</style>
