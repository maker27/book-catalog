<script setup lang="ts">
import BaseCard from '@/shared/ui/components/base/BaseCard.vue';
import BaseSkeleton from '@/shared/ui/components/base/BaseSkeleton.vue';

withDefaults(defineProps<{ count?: number }>(), { count: 6 });
</script>

<template>
  <div class="authors-skeleton">
    <BaseCard v-for="index in count" :key="index">
      <div class="authors-skeleton__card">
        <BaseSkeleton class="authors-skeleton__photo" height="auto" width="100%" />
        <BaseSkeleton height="24px" width="70%" />
      </div>
    </BaseCard>
  </div>
</template>

<style scoped lang="scss">
.authors-skeleton__card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.authors-skeleton__photo {
  aspect-ratio: 1 / 1;
}

.authors-skeleton {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}
</style>
