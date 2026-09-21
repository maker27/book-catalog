<script setup lang="ts">
import { RouterLink } from 'vue-router';

import type { AuthorShort } from '@/shared/api';
import { getAuthorPhotoUrl, handlePhotoError } from '@/shared/lib';
import BaseCard from '@/shared/ui/components/base/BaseCard.vue';

defineProps<{ author: AuthorShort }>();
</script>

<template>
  <BaseCard tag="article">
    <div class="author-card">
      <RouterLink class="author-card__photo-link" :to="`/authors/${author.id}`">
        <img
          :alt="author.full_name ?? 'Фото автора'"
          class="author-card__photo"
          loading="lazy"
          :src="getAuthorPhotoUrl(author.id)"
          @error="handlePhotoError"
        />
      </RouterLink>
      <h2 class="author-card__name">
        <RouterLink class="author-card__link" :to="`/authors/${author.id}`">
          {{ author.full_name }}
        </RouterLink>
      </h2>
    </div>
  </BaseCard>
</template>

<style scoped lang="scss">
.author-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  height: 100%;
}

.author-card__photo-link {
  display: block;
}

.author-card__photo {
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-card);
  display: block;
  object-fit: cover;
  width: 100%;
}

.author-card__name {
  font-size: var(--font-size-headline-md);
  line-height: var(--line-height-headline-md);
}

.author-card__link {
  color: var(--color-on-surface);

  &:hover {
    color: var(--color-primary);
  }
}
</style>
