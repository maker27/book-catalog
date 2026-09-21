<script setup lang="ts">
import { computed } from 'vue';

import { BookCard, CatalogSkeleton } from '@/features/catalog';
import type { Book } from '@/shared/api';

const props = withDefaults(
  defineProps<{
    books: Book[];
    isPending?: boolean;
    skeletonCount?: number;
  }>(),
  { isPending: false, skeletonCount: 6 },
);

const isEmpty = computed(() => !props.isPending && props.books.length === 0);
</script>

<template>
  <CatalogSkeleton v-if="isPending" :count="skeletonCount" />

  <slot v-else-if="isEmpty" name="empty">
    <p class="books-list__empty">Книг пока нет.</p>
  </slot>

  <ul v-else class="books-list">
    <li v-for="book in books" :key="book.id">
      <BookCard :book="book" />
    </li>
  </ul>
</template>

<style scoped lang="scss">
.books-list {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.books-list li {
  display: grid;
}

.books-list__empty {
  color: var(--color-muted);
}
</style>
