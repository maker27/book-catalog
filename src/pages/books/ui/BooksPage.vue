<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  BookFilters,
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  filtersToApiQuery,
  filtersToRouteQuery,
  parseBooksFilters,
  type BooksFilters,
} from '@/features/catalog';
import { useAuthorsDirectory } from '@/features/authors';
import { useSessionStore } from '@/features/auth';
import { useResource } from '@/shared/lib';
import { AppPagination, BaseButton, ErrorRetry } from '@/shared/ui';
import { unwrapResponse, useApi, type Book, type Pagination } from '@/shared/api';
import { buildYearOptions } from '@/shared/config';
import { BooksList } from '@/widgets/books-list';

interface BooksResult {
  books: Book[];
  pagination: Pagination | null;
}

const EMPTY_BOOKS_RESULT: BooksResult = { books: [], pagination: null };

const { api } = useApi();
const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const { authors, error: authorsError, load: loadAuthors } = useAuthorsDirectory();

const filters = computed(() => parseBooksFilters(route.query));
const years = buildYearOptions(new Date().getFullYear());

const {
  data: booksResult,
  error,
  isPending,
  reload: loadBooks,
} = useResource<BooksResult>(async () => {
  const result = await api
    .GET('/books', { params: { query: filtersToApiQuery(filters.value, DEFAULT_PER_PAGE) } })
    .then(unwrapResponse);
  return { books: result.items ?? [], pagination: result.pagination ?? null };
}, EMPTY_BOOKS_RESULT);

const books = computed(() => booksResult.value.books);
const totalPages = computed(() => booksResult.value.pagination?.total_pages ?? 1);
const isEmpty = computed(() => !isPending.value && !error.value && books.value.length === 0);

onMounted(() => {
  loadBooks();
  loadAuthors();
});

watch(filters, loadBooks);

function applyFilters(next: BooksFilters) {
  return router.push({ query: filtersToRouteQuery(next) });
}

function handleFiltersReset() {
  return applyFilters({ authorId: null, page: DEFAULT_PAGE, search: '', year: null });
}

function handlePageUpdate(page: number) {
  return applyFilters({ ...filters.value, page });
}
</script>

<template>
  <div class="catalog">
    <div class="catalog__head">
      <h1 class="catalog__title">Каталог книг</h1>
      <BaseButton v-if="session.isAuthenticated" compact to="/books/new">
        Добавить книгу
      </BaseButton>
    </div>

    <ErrorRetry
      v-if="authorsError"
      message="Не удалось загрузить список авторов."
      @retry="loadAuthors"
    />

    <BookFilters
      :authors="authors"
      :disabled="isPending"
      :filters="filters"
      :years="years"
      @reset="handleFiltersReset"
      @submit="applyFilters"
    />

    <ErrorRetry
      v-if="error"
      message="Не удалось загрузить список книг."
      :pending="isPending"
      @retry="loadBooks"
    />

    <template v-else>
      <BooksList :books="books" :is-pending="isPending" :skeleton-count="DEFAULT_PER_PAGE">
        <template #empty>
          <p class="catalog__empty">
            Ничего не найдено. Измените условия поиска или
            <BaseButton variant="link" @click="handleFiltersReset">сбросьте фильтры</BaseButton>
          </p>
        </template>
      </BooksList>

      <AppPagination
        v-if="!isPending && !isEmpty"
        :disabled="isPending"
        :page="filters.page"
        :total-pages="totalPages"
        @update:page="handlePageUpdate"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.catalog {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.catalog__head {
  align-items: center;
  display: flex;
  gap: var(--spacing-md);
  justify-content: space-between;
}

.catalog__title {
  font-size: var(--font-size-headline-lg);
  line-height: var(--line-height-headline-lg);
}

.catalog__empty {
  color: var(--color-muted);
}
</style>
