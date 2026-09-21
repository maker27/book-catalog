<script setup lang="ts">
withDefaults(defineProps<{ tag?: string }>(), { tag: 'div' });
</script>

<template>
  <component :is="tag" class="base-card">
    <slot />
  </component>
</template>

<style scoped lang="scss">
.base-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  color: var(--color-on-surface);
  padding: var(--card-padding);
}
</style>
