<script setup lang="ts">
import { ref } from 'vue';
import BaseBusy from '@/shared/ui/components/base/BaseBusy.vue';
import BaseButton from '@/shared/ui/components/base/BaseButton.vue';
import BaseCard from '@/shared/ui/components/base/BaseCard.vue';
import BaseInput from '@/shared/ui/components/base/BaseInput.vue';
import { useApi } from '@/shared/api';
import { useFormSubmit } from '@/shared/lib';
import { SUBSCRIPTION_FIELDS, validateSubscriptionForm } from '@/shared/forms';

const props = defineProps<{ authorId: number }>();

const SUCCESS_MESSAGE = 'Готово! Мы пришлём SMS, когда у автора выйдет новая книга.';

const { localApi } = useApi();
const { applyApiErrors, fieldErrors, formError, isSubmitting, submit } = useFormSubmit();

const phone = ref('');
const successMessage = ref('');

async function handleFormSubmit() {
  successMessage.value = '';
  fieldErrors.value = validateSubscriptionForm(phone.value);
  if (Object.keys(fieldErrors.value).length > 0) {
    return;
  }
  await submit(async () => {
    const { error } = await localApi.POST('/subscriptions', {
      body: { author_id: props.authorId, phone: phone.value.trim() },
    });
    if (error) {
      applyApiErrors(error.errors, SUBSCRIPTION_FIELDS);
      return;
    }
    successMessage.value = SUCCESS_MESSAGE;
    phone.value = '';
  });
}
</script>

<template>
  <BaseCard tag="section">
    <h2 class="subscribe-form__title">Подписка на новые книги автора</h2>
    <BaseBusy :busy="isSubmitting">
      <form class="subscribe-form__form" novalidate @submit.prevent="handleFormSubmit">
        <BaseInput
          v-model="phone"
          autocomplete="tel"
          :disabled="isSubmitting"
          :error="fieldErrors.phone"
          hint="Формат: +7XXXXXXXXXX"
          label="Телефон"
          placeholder="+79991234567"
          required
          type="tel"
        />
        <p v-if="formError" class="subscribe-form__error" role="alert">
          {{ formError }}
        </p>
        <p v-if="successMessage" class="subscribe-form__success" role="status">
          {{ successMessage }}
        </p>
        <BaseButton compact :loading="isSubmitting" type="submit"> Подписаться </BaseButton>
      </form>
    </BaseBusy>
  </BaseCard>
</template>

<style scoped lang="scss">
.subscribe-form__title {
  font-size: var(--font-size-headline-md);
  line-height: var(--line-height-headline-md);
  padding-bottom: var(--spacing-sm);
}

.subscribe-form__form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-width: 320px;
}

.subscribe-form__error {
  color: var(--color-error);
  font-size: var(--font-size-body-sm);
}

.subscribe-form__success {
  color: var(--color-primary);
  font-size: var(--font-size-body-sm);
}
</style>
