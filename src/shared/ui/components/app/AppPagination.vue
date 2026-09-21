<script setup lang="ts">
import { computed } from 'vue';
import BaseButton from '@/shared/ui/components/base/BaseButton.vue';

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    page: number;
    totalPages: number;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{ 'update:page': [number] }>();

const isFirst = computed(() => props.page <= 1);
const isLast = computed(() => props.page >= props.totalPages);

function handlePrevClick() {
  if (!isFirst.value) {
    emit('update:page', props.page - 1);
  }
}

function handleNextClick() {
  if (!isLast.value) {
    emit('update:page', props.page + 1);
  }
}
</script>

<template>
  <nav v-if="totalPages > 1" aria-label="Пагинация" class="app-pagination">
    <BaseButton
      compact
      :disabled="disabled || isFirst"
      variant="secondary"
      @click="handlePrevClick"
    >
      Назад
    </BaseButton>
    <span class="app-pagination__status">Стр. {{ page }} из {{ totalPages }}</span>
    <BaseButton compact :disabled="disabled || isLast" variant="secondary" @click="handleNextClick">
      Вперёд
    </BaseButton>
  </nav>
</template>

<style scoped lang="scss">
.app-pagination {
  align-items: center;
  display: flex;
  gap: var(--spacing-sm);
}

.app-pagination__status {
  color: var(--color-muted);
  font-size: var(--font-size-label-md);
}
</style>
