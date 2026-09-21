<script setup lang="ts">
defineProps<{ busy: boolean }>();
</script>

<template>
  <div class="base-busy" :class="{ 'base-busy_active': busy }" :aria-busy="busy ? 'true' : 'false'">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.base-busy_active {
  opacity: 0.6;
  pointer-events: none;
  user-select: none;
}
</style>
