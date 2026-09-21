<template>
  <div class="not-found">
    <h1 class="not-found__title">Страница не найдена</h1>
    <RouterLink class="not-found__link" to="/books">Вернуться в каталог</RouterLink>
  </div>
</template>

<style scoped lang="scss">
.not-found {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.not-found__title {
  font-size: var(--font-size-headline-lg);
  line-height: var(--line-height-headline-lg);
}

.not-found__link {
  color: var(--color-primary);
}
</style>
