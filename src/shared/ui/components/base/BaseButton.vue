<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import { RouterLink } from 'vue-router';
import { computed } from 'vue';

type ButtonVariant = 'primary' | 'secondary' | 'link';
type ButtonType = 'button' | 'submit' | 'reset';

const props = withDefaults(
  defineProps<{
    block?: boolean;
    compact?: boolean;
    disabled?: boolean;
    loading?: boolean;
    to?: RouteLocationRaw;
    type?: ButtonType;
    variant?: ButtonVariant;
  }>(),
  {
    block: false,
    compact: false,
    disabled: false,
    loading: false,
    to: undefined,
    type: 'button',
    variant: 'primary',
  },
);

const emit = defineEmits<{ click: [MouseEvent] }>();

const isDisabled = computed(() => props.disabled || props.loading);

const modifierClasses = computed(() => [
  `base-button_${props.variant}`,
  {
    'base-button_block': props.block,
    'base-button_compact': props.compact,
    'base-button_loading': props.loading,
  },
]);

function handleClick(event: MouseEvent) {
  if (isDisabled.value) {
    return;
  }
  emit('click', event);
}
</script>

<template>
  <RouterLink
    v-if="to && !isDisabled"
    class="base-button"
    :class="modifierClasses"
    :to="to"
    @click="handleClick"
  >
    <span class="base-button__label"><slot /></span>
  </RouterLink>
  <a
    v-else-if="to"
    aria-disabled="true"
    class="base-button base-button_disabled"
    :class="modifierClasses"
    tabindex="-1"
    @click.prevent
  >
    <span class="base-button__label"><slot /></span>
  </a>
  <button
    v-else
    :aria-busy="loading ? 'true' : 'false'"
    class="base-button"
    :class="modifierClasses"
    :disabled="isDisabled"
    :type="type"
    @click="handleClick"
  >
    <span aria-hidden="true" class="base-button__spinner-slot">
      <span v-if="loading" class="base-button__spinner" />
    </span>
    <span class="base-button__label"><slot /></span>
    <span aria-hidden="true" class="base-button__spinner-slot" />
  </button>
</template>

<style scoped lang="scss">
.base-button {
  align-items: center;
  border-radius: var(--radius-button);
  border-style: solid;
  border-width: 1px;
  cursor: pointer;
  display: inline-flex;
  font-size: var(--font-size-label-lg);
  font-weight: 400;
  gap: var(--spacing-sm);
  justify-content: center;
  min-height: var(--button-min-height);
  min-width: var(--button-min-width);
  padding: var(--button-padding);
  text-decoration: none;
  transition: opacity 0.15s ease-in-out;

  &:not(:disabled):not(.base-button_disabled):hover {
    opacity: 0.85;
  }
}

.base-button:disabled,
.base-button_disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.base-button_primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-surface);
}

.base-button_secondary {
  background-color: transparent;
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.base-button_link .base-button__spinner-slot {
  display: none;
}

.base-button_link {
  background-color: transparent;
  border-color: transparent;
  border-radius: var(--rounded-none);
  border-width: 0;
  color: var(--color-on-surface);
  min-height: 0;
  min-width: 0;
  padding: 0;
  text-decoration: underline;
}

.base-button_block {
  width: 100%;
}

.base-button_compact {
  min-width: 0;
  padding: var(--button-compact-padding);
}

.base-button__spinner-slot {
  flex: 0 0 auto;
  height: 14px;
  width: 14px;
}

.base-button__spinner {
  animation: base-button-spin 0.8s linear infinite;
  border: 2px solid currentcolor;
  border-radius: var(--radius-full);
  border-right-color: transparent;
  display: inline-block;
  height: 14px;
  width: 14px;
}

@keyframes base-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
