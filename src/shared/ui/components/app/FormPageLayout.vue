<script setup lang="ts">
import BaseBusy from '@/shared/ui/components/base/BaseBusy.vue';
import BaseCard from '@/shared/ui/components/base/BaseCard.vue';
import ErrorRetry from './ErrorRetry.vue';

withDefaults(
  defineProps<{
    formError?: string;
    hasLoadError?: boolean;
    isBusy: boolean;
    isLoadPending?: boolean;
    loadErrorMessage?: string;
    title: string;
  }>(),
  {
    formError: '',
    hasLoadError: false,
    isLoadPending: false,
    loadErrorMessage: 'Не удалось загрузить данные.',
  },
);

const emit = defineEmits<{ formSubmit: []; retryLoad: [] }>();

function handleLoadRetry() {
  emit('retryLoad');
}

function handleFormSubmit() {
  emit('formSubmit');
}
</script>

<template>
  <div class="form-page">
    <h1 class="form-page__title">{{ title }}</h1>
    <ErrorRetry
      v-if="hasLoadError"
      :message="loadErrorMessage"
      :pending="isLoadPending"
      @retry="handleLoadRetry"
    />

    <BaseCard v-else tag="section">
      <BaseBusy :busy="isBusy">
        <form class="form-page__form" novalidate @submit.prevent="handleFormSubmit">
          <slot />
          <p v-if="formError" class="form-page__error" role="alert">{{ formError }}</p>
          <div class="form-page__actions">
            <slot name="actions" />
          </div>
        </form>
      </BaseBusy>
    </BaseCard>
  </div>
</template>

<style scoped lang="scss">
.form-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin: 0 auto;
  max-width: 640px;
}

.form-page__title {
  font-size: var(--font-size-headline-lg);
  line-height: var(--line-height-headline-lg);
}

.form-page__form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.form-page__error {
  color: var(--color-error);
  font-size: var(--font-size-body-sm);
}
</style>
