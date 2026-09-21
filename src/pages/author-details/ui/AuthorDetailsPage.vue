<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAuthorsDirectory } from '@/entities/author';
import { useSessionStore } from '@/features/auth';
import { getApiMode, useDeleteAction, useNotFoundRedirect, useResource } from '@/shared/lib';
import { assertResponseOk, unwrapResponse, useApi, type Author, type Book } from '@/shared/api';
import { BaseButton, BaseSkeleton, ErrorRetry } from '@/shared/ui';
import { BooksList } from '@/widgets/books-list';
import SubscribeForm from './SubscribeForm.vue';

const AUTHOR_BOOKS_LIMIT = 100;
const AUTHOR_BOOKS_SKELETON_COUNT = 3;
const AUTHOR_SKELETON_ROWS = 4;

const { api } = useApi();
const { isSubscriptionsEnabled } = getApiMode();
const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const { invalidate: invalidateAuthorsDirectory } = useAuthorsDirectory();

const authorId = computed(() => Number(route.params.id));

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

const {
  data: books,
  error: booksError,
  isPending: isBooksPending,
  reload: loadBooks,
} = useResource<Book[]>(async () => {
  const result = await api
    .GET('/books', {
      params: { query: { author_id: authorId.value, page: 1, 'per-page': AUTHOR_BOOKS_LIMIT } },
    })
    .then(unwrapResponse);
  return result.items ?? [];
}, []);

function loadAuthorPage() {
  loadAuthor();
  loadBooks();
}

watch(authorId, loadAuthorPage, { immediate: true });

const {
  confirmAndDelete: handleDeleteClick,
  deleteError,
  isDeleting,
} = useDeleteAction({
  confirmMessage: 'Удалить автора?',
  remove: async () => {
    assertResponseOk(
      await api.DELETE('/authors/{id}', { params: { path: { id: authorId.value } } }),
    );
    invalidateAuthorsDirectory();
    await router.push('/authors');
  },
});
</script>

<template>
  <div class="author-page">
    <ErrorRetry
      v-if="error"
      message="Не удалось загрузить автора."
      :pending="isPending"
      @retry="loadAuthorPage"
    />

    <div v-else-if="isPending" class="author-page__skeleton">
      <BaseSkeleton height="var(--line-height-headline-lg)" width="50%" />
      <BaseSkeleton v-for="row in AUTHOR_SKELETON_ROWS" :key="row" height="20px" width="80%" />
    </div>

    <template v-else-if="author">
      <div class="author-page__head">
        <h1 class="author-page__title">{{ author.full_name }}</h1>
        <div v-if="session.isAuthenticated" class="author-page__actions">
          <BaseButton compact :to="`/authors/${authorId}/edit`" variant="secondary">
            Редактировать
          </BaseButton>
          <BaseButton compact :loading="isDeleting" variant="secondary" @click="handleDeleteClick">
            Удалить
          </BaseButton>
        </div>
      </div>

      <p v-if="deleteError" class="author-page__delete-error" role="alert">
        {{ deleteError }}
      </p>

      <section class="author-page__books">
        <h2 class="author-page__subtitle">Книги автора</h2>

        <ErrorRetry
          v-if="booksError"
          message="Не удалось загрузить книги автора."
          :pending="isBooksPending"
          @retry="loadBooks"
        />

        <BooksList
          v-else
          :books="books"
          :is-pending="isBooksPending"
          :skeleton-count="AUTHOR_BOOKS_SKELETON_COUNT"
        >
          <template #empty>
            <p class="author-page__empty">У автора пока нет книг в каталоге.</p>
          </template>
        </BooksList>
      </section>

      <SubscribeForm v-if="isSubscriptionsEnabled" :author-id="authorId" />

      <BaseButton class="author-page__back" to="/authors" variant="secondary">
        Вернуться к списку авторов
      </BaseButton>
    </template>
  </div>
</template>

<style scoped lang="scss">
.author-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.author-page__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.author-page__head {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  justify-content: space-between;
}

.author-page__title {
  font-size: var(--font-size-headline-lg);
  line-height: var(--line-height-headline-lg);
}

.author-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.author-page__delete-error {
  color: var(--color-error);
  font-size: var(--font-size-body-sm);
}

.author-page__subtitle {
  font-size: var(--font-size-headline-md);
  line-height: var(--line-height-headline-md);
  padding-bottom: var(--spacing-sm);
}

.author-page__empty {
  color: var(--color-muted);
}

.author-page__back {
  align-self: flex-start;
}
</style>
