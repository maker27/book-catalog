<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { AuthorCard, AuthorsSkeleton } from '@/features/authors';
import { useSessionStore } from '@/features/auth';
import { useResource } from '@/shared/lib';
import { AppPagination, BaseButton, ErrorRetry } from '@/shared/ui';
import { unwrapResponse, useApi, type AuthorShort, type Pagination } from '@/shared/api';

const AUTHORS_PER_PAGE = 12;
const FIRST_PAGE = 1;

interface AuthorsResult {
  authors: AuthorShort[];
  pagination: Pagination | null;
}

const EMPTY_AUTHORS_RESULT: AuthorsResult = { authors: [], pagination: null };

const { api } = useApi();
const route = useRoute();
const router = useRouter();
const session = useSessionStore();

const page = computed(() => {
  const raw = route.query.page;
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(value) && value > 0 ? value : FIRST_PAGE;
});

const {
  data: authorsResult,
  error,
  isPending,
  reload: loadAuthors,
} = useResource<AuthorsResult>(async () => {
  const result = await api
    .GET('/authors', { params: { query: { page: page.value, 'per-page': AUTHORS_PER_PAGE } } })
    .then(unwrapResponse);
  return { authors: result.items ?? [], pagination: result.pagination ?? null };
}, EMPTY_AUTHORS_RESULT);

const authors = computed(() => authorsResult.value.authors);
const totalPages = computed(() => authorsResult.value.pagination?.total_pages ?? 1);

onMounted(loadAuthors);
watch(page, loadAuthors);

function handlePageUpdate(next: number) {
  router.push({ query: next === FIRST_PAGE ? {} : { page: String(next) } });
}
</script>

<template>
  <div class="authors">
    <div class="authors__head">
      <h1 class="authors__title">Авторы</h1>
      <BaseButton v-if="session.isAuthenticated" compact to="/authors/new">
        Добавить автора
      </BaseButton>
    </div>

    <ErrorRetry
      v-if="error"
      message="Не удалось загрузить список авторов."
      :pending="isPending"
      @retry="loadAuthors"
    />

    <AuthorsSkeleton v-else-if="isPending" />

    <p v-else-if="authors.length === 0" class="authors__empty">Авторов пока нет.</p>

    <template v-else>
      <ul class="authors__grid">
        <li v-for="author in authors" :key="author.id">
          <AuthorCard :author="author" />
        </li>
      </ul>
      <AppPagination
        :disabled="isPending"
        :page="page"
        :total-pages="totalPages"
        @update:page="handlePageUpdate"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.authors {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.authors__head {
  align-items: center;
  display: flex;
  gap: var(--spacing-md);
  justify-content: space-between;
}

.authors__title {
  font-size: var(--font-size-headline-lg);
  line-height: var(--line-height-headline-lg);
}

.authors__grid {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.authors__grid li {
  display: grid;
}

.authors__empty {
  color: var(--color-muted);
}
</style>
