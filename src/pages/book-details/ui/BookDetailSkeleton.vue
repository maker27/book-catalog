<script setup lang="ts">
import BaseSkeleton from '@/shared/ui/components/base/BaseSkeleton.vue';
</script>

<template>
  <div class="book-detail-skeleton">
    <BaseSkeleton height="400px" />
    <div class="book-detail-skeleton__body">
      <BaseSkeleton height="28px" width="60%" />
      <BaseSkeleton height="16px" width="30%" />
      <BaseSkeleton height="16px" width="40%" />
      <BaseSkeleton height="120px" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.book-detail-skeleton {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: minmax(200px, 300px) 1fr;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
}

.book-detail-skeleton__body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>
