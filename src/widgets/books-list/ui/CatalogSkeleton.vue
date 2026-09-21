<script setup lang="ts">
import BaseCard from '@/shared/ui/components/base/BaseCard.vue';
import BaseSkeleton from '@/shared/ui/components/base/BaseSkeleton.vue';

withDefaults(defineProps<{ count?: number }>(), { count: 6 });
</script>

<template>
  <div class="catalog-skeleton">
    <BaseCard v-for="index in count" :key="index">
      <div class="catalog-skeleton__item">
        <BaseSkeleton height="220px" />
        <BaseSkeleton height="20px" width="80%" />
        <BaseSkeleton height="14px" width="40%" />
      </div>
    </BaseCard>
  </div>
</template>

<style scoped lang="scss">
.catalog-skeleton {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.catalog-skeleton__item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>
