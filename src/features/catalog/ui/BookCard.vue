<script setup lang="ts">
import { RouterLink } from 'vue-router';

import type { Book } from '@/shared/api';
import { handleCoverError, PLACEHOLDER_COVER_URL } from '@/shared/lib';
import BaseCard from '@/shared/ui/components/base/BaseCard.vue';

defineProps<{ book: Book }>();
</script>

<template>
  <BaseCard tag="article">
    <div class="book-card">
      <RouterLink class="book-card__cover-link" :to="`/books/${book.id}`">
        <img
          :alt="book.title ?? 'Обложка книги'"
          class="book-card__cover"
          loading="lazy"
          :src="book.cover_url || PLACEHOLDER_COVER_URL"
          @error="handleCoverError"
        />
      </RouterLink>
      <div class="book-card__body">
        <h2 class="book-card__title">
          <RouterLink class="book-card__title-link" :to="`/books/${book.id}`">
            {{ book.title }}
          </RouterLink>
        </h2>
        <p class="book-card__year">
          {{ book.year }}
        </p>
        <ul class="book-card__authors">
          <li v-for="author in book.authors ?? []" :key="author.id">
            <RouterLink class="book-card__author-link" :to="`/authors/${author.id}`">
              {{ author.full_name }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped lang="scss">
.book-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  height: 100%;
  min-width: 0;
}

.book-card__cover-link {
  display: block;
}

.book-card__cover {
  aspect-ratio: 3 / 4;
  border-radius: var(--radius-card);
  display: block;
  object-fit: cover;
  width: 100%;
}

.book-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
}

.book-card__title {
  font-size: var(--font-size-headline-md);
  line-height: var(--line-height-headline-md);
  overflow-wrap: anywhere;
}

.book-card__title-link {
  color: var(--color-on-surface);

  &:hover {
    color: var(--color-primary);
  }
}

.book-card__year {
  color: var(--color-muted);
  font-size: var(--font-size-label-md);
}

.book-card__authors {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  overflow-wrap: anywhere;
}
</style>
