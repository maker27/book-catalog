<template>
  <div class="forbidden">
    <h1 class="forbidden__title">Доступ запрещён</h1>
    <div class="forbidden__links">
      <RouterLink class="forbidden__link" to="/books">Вернуться в каталог</RouterLink>
      <RouterLink class="forbidden__link" to="/login">Войти</RouterLink>
    </div>
  </div>
</template>

<style scoped lang="scss">
.forbidden {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.forbidden__title {
  font-size: var(--font-size-headline-lg);
  line-height: var(--line-height-headline-lg);
}

.forbidden__links {
  display: flex;
  gap: var(--spacing-sm);
}

.forbidden__link {
  color: var(--color-primary);
}
</style>
