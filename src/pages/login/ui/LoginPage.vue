<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BaseBusy, BaseButton, BaseCard, BaseInput } from '@/shared/ui';
import { useApi } from '@/shared/api';
import { getApiMode, useFormSubmit } from '@/shared/lib';
import { useSessionStore } from '@/features/auth';

const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'admin123';
const INVALID_CREDENTIALS_MESSAGE = 'Неверный логин или пароль';
const DEFAULT_REDIRECT = '/books';

const { api } = useApi();
const { isMock } = getApiMode();
const { formError, isSubmitting, submit } = useFormSubmit();
const route = useRoute();
const router = useRouter();
const session = useSessionStore();

const password = ref('');
const username = ref('');

const redirectTo = computed(() => {
  const target = route.query.redirect;
  if (typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')) {
    return target;
  }
  return DEFAULT_REDIRECT;
});

async function handleFormSubmit() {
  await submit(async () => {
    const { data } = await api.POST('/auth/login', {
      body: { username: username.value, password: password.value },
    });
    const token = data?.data?.token;
    if (!token) {
      formError.value = INVALID_CREDENTIALS_MESSAGE;
      return;
    }
    const user = data.data?.user;
    session.setSession({
      expiresAt: data.data?.expires_at ?? '',
      token,
      user: {
        id: user?.id ?? 0,
        role: user?.role ?? 'user',
        username: user?.username ?? username.value,
      },
    });
    await router.push(redirectTo.value);
  });
}
</script>

<template>
  <div class="login">
    <h1 class="login__title">Вход</h1>
    <BaseCard tag="section">
      <BaseBusy :busy="isSubmitting">
        <form class="login__form" novalidate @submit.prevent="handleFormSubmit">
          <BaseInput v-model="username" autocomplete="username" label="Логин" required />
          <BaseInput
            v-model="password"
            autocomplete="current-password"
            label="Пароль"
            required
            type="password"
          />
          <p v-if="formError" class="login__error" role="alert">
            {{ formError }}
          </p>
          <BaseButton :loading="isSubmitting" type="submit">Войти</BaseButton>
        </form>
      </BaseBusy>
    </BaseCard>
    <p v-if="isMock" class="login__hint">Демо-доступ: {{ DEMO_USERNAME }} / {{ DEMO_PASSWORD }}</p>
  </div>
</template>

<style scoped lang="scss">
.login {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-width: 420px;
}

.login__title {
  font-size: var(--font-size-headline-lg);
  line-height: var(--line-height-headline-lg);
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.login__error {
  color: var(--color-error);
  font-size: var(--font-size-label-md);
}

.login__hint {
  color: var(--color-muted);
  font-size: var(--font-size-label-md);
}
</style>
