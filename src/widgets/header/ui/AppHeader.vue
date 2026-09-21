<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useSessionStore } from '@/features/auth';
import BaseButton from '@/shared/ui/components/base/BaseButton.vue';

const session = useSessionStore();
const route = useRoute();
const router = useRouter();

async function handleLogoutClick() {
  session.logout();
  await router.push('/books');
}
</script>

<template>
  <header class="app-header">
    <div class="page-container app-header__inner">
      <RouterLink class="app-header__brand" to="/books">Каталог книг</RouterLink>
      <nav class="app-header__nav">
        <RouterLink class="app-header__link" to="/books">Каталог</RouterLink>
        <RouterLink class="app-header__link" to="/authors">Авторы</RouterLink>
        <RouterLink class="app-header__link" to="/top-authors">Отчёт</RouterLink>
      </nav>
      <div class="app-header__session">
        <template v-if="session.isAuthenticated">
          <span class="app-header__username">{{ session.username }}</span>
          <BaseButton compact variant="secondary" @click="handleLogoutClick">Выйти</BaseButton>
        </template>
        <BaseButton v-else compact :to="`/login?redirect=${encodeURIComponent(route.fullPath)}`">
          Войти
        </BaseButton>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.app-header__inner {
  align-items: center;
  display: flex;
  gap: var(--spacing-md);
  min-height: 64px;
}

.app-header__brand {
  color: var(--color-on-surface);
  font-size: var(--font-size-headline-md);
}

.app-header__nav {
  display: flex;
  flex: 1;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

.app-header__link {
  color: var(--color-on-surface);

  &:hover {
    color: var(--color-primary);
  }
}

.app-header__link.router-link-active {
  color: var(--color-primary);
}

.app-header__session {
  align-items: center;
  display: flex;
  gap: var(--spacing-sm);
}

.app-header__username {
  color: var(--color-muted);
  font-size: var(--font-size-label-md);
}
</style>
