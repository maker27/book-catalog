<script setup lang="ts">
const CURRENT_YEAR = new Date().getFullYear();
</script>

<template>
  <footer class="app-footer">
    <div class="page-container app-footer__container">
      <span class="app-footer__copyright">© {{ CURRENT_YEAR }} Каталог книг</span>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.app-footer {
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.app-footer__container {
  align-items: center;
  display: flex;
  min-height: 64px;
}

.app-footer__copyright {
  color: var(--color-muted);
  font-size: var(--font-size-label-md);
}
</style>
