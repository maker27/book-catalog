<script setup lang="ts">
import BaseButton from '@/shared/ui/components/base/BaseButton.vue';

withDefaults(
  defineProps<{
    message?: string;
    pending?: boolean;
  }>(),
  {
    message: 'Не удалось загрузить данные.',
    pending: false,
  },
);

const emit = defineEmits<{ retry: [] }>();

function handleRetryClick() {
  emit('retry');
}
</script>

<template>
  <div class="error-retry" role="alert">
    <p class="error-retry__message">
      {{ message }}
    </p>
    <BaseButton compact :loading="pending" variant="secondary" @click="handleRetryClick">
      Повторить
    </BaseButton>
  </div>
</template>

<style scoped lang="scss">
.error-retry {
  align-items: center;
  border: 1px solid var(--color-error);
  border-radius: var(--radius-card);
  display: flex;
  gap: var(--spacing-sm);
  justify-content: space-between;
  padding: var(--spacing-sm);
}

.error-retry__message {
  color: var(--color-error);
}
</style>
