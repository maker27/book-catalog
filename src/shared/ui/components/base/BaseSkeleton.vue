<script setup lang="ts">
withDefaults(
  defineProps<{
    height?: string;
    rounded?: 'sm' | 'md' | 'full';
    width?: string;
  }>(),
  {
    height: '16px',
    rounded: 'sm',
    width: '100%',
  },
);
</script>

<template>
  <span
    class="base-skeleton"
    :class="`base-skeleton_rounded-${rounded}`"
    :style="{ height, width }"
    aria-hidden="true"
  />
</template>

<style scoped lang="scss">
.base-skeleton {
  animation: base-skeleton-pulse 1.4s ease-in-out infinite;
  background-color: var(--color-tertiary);
  display: block;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

.base-skeleton_rounded-sm {
  border-radius: var(--rounded-sm);
}

.base-skeleton_rounded-md {
  border-radius: var(--rounded-md);
}

.base-skeleton_rounded-full {
  border-radius: var(--radius-full);
}

@keyframes base-skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.55;
  }
}
</style>
