<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useSessionStore } from '@/features/auth';
import { AppHeader } from '@/widgets/header';
import { AppFooter } from '@/widgets/footer';

const session = useSessionStore();

onBeforeMount(() => {
  session.checkSessionExpiration();
});
</script>

<template>
  <div class="app">
    <AppHeader />
    <main class="app__main page-container">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped lang="scss">
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-md);
  padding-bottom: var(--spacing-lg);
  padding-top: var(--spacing-md);
}
</style>
