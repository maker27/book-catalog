<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BaseSelect, BaseSkeleton, ErrorRetry, type SelectOption } from '@/shared/ui';
import { unwrapResponse, useApi, type TopAuthor } from '@/shared/api';
import { buildYearOptions } from '@/shared/config';
import { useResource } from '@/shared/lib';

const SKELETON_ROWS = 10;

const { api } = useApi();
const route = useRoute();
const router = useRouter();

const years = buildYearOptions(new Date().getFullYear());
const yearOptions: SelectOption[] = years.map((year) => ({
  label: String(year),
  value: String(year),
}));

const currentYear = computed(() => {
  const raw = route.query.year;
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  const fallback = String(years[0] ?? new Date().getFullYear());
  return years.includes(value) ? String(value) : fallback;
});

const {
  data: rows,
  error,
  isPending,
  reload: loadTopAuthors,
} = useResource<TopAuthor[]>(async () => {
  const result = await api.GET('/reports/top-authors', {
    params: { query: { year: Number(currentYear.value) } },
  });
  const payload = unwrapResponse(result);
  return payload.items ?? [];
}, []);

watch(currentYear, loadTopAuthors, { immediate: true });

function handleYearChange(year: string) {
  return router.push({ query: { year } });
}
</script>

<template>
  <div class="top-authors">
    <h1 class="top-authors__title">ТОП-10 авторов по количеству книг</h1>

    <BaseSelect
      class="top-authors__year"
      label="Год"
      :model-value="currentYear"
      :options="yearOptions"
      @update:model-value="handleYearChange"
    />

    <ErrorRetry
      v-if="error"
      message="Не удалось загрузить отчёт."
      :pending="isPending"
      @retry="loadTopAuthors"
    />

    <div v-else-if="isPending" class="top-authors__skeleton">
      <BaseSkeleton v-for="row in SKELETON_ROWS" :key="row" height="20px" />
    </div>

    <p v-else-if="rows.length === 0" class="top-authors__empty">
      За {{ currentYear }} год данных нет.
    </p>

    <table v-else class="top-authors__table">
      <thead>
        <tr>
          <th class="top-authors__cell top-authors__cell_rank" scope="col">#</th>
          <th class="top-authors__cell" scope="col">Автор</th>
          <th class="top-authors__cell top-authors__cell_count" scope="col">Книг за год</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.author_id">
          <td class="top-authors__cell top-authors__cell_rank">
            {{ row.rank }}
          </td>
          <td class="top-authors__cell">
            <RouterLink class="top-authors__link" :to="`/authors/${row.author_id}`">
              {{ row.full_name }}
            </RouterLink>
          </td>
          <td class="top-authors__cell top-authors__cell_count">
            {{ row.books_count }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.top-authors {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.top-authors__title {
  font-size: var(--font-size-headline-lg);
  line-height: var(--line-height-headline-lg);
}

.top-authors__year {
  max-width: 200px;
}

.top-authors__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.top-authors__table {
  border-collapse: collapse;
  width: 100%;
}

.top-authors__cell {
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-sm);
  text-align: left;
}

.top-authors__cell_rank {
  width: 48px;
}

.top-authors__cell_count {
  text-align: right;
  width: 140px;
}

.top-authors__link {
  color: var(--color-on-surface);

  &:hover {
    color: var(--color-primary);
  }
}

.top-authors__empty {
  color: var(--color-muted);
}
</style>
