<script setup lang="ts">
import { computed, useId } from 'vue';

export interface SelectOption {
  label: string;
  value: string;
}

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    error?: string;
    id?: string;
    label?: string;
    modelValue?: string;
    options: SelectOption[];
    placeholder?: string;
    required?: boolean;
  }>(),
  {
    disabled: false,
    error: '',
    id: undefined,
    label: '',
    modelValue: '',
    placeholder: '',
    required: false,
  },
);

const emit = defineEmits<{ 'update:modelValue': [string] }>();

const generatedId = useId();
const selectId = computed(() => props.id ?? generatedId);
const errorId = computed(() => `${selectId.value}-error`);
const hasError = computed(() => Boolean(props.error));

function handleChange(event: Event) {
  const target = event.target;
  if (target instanceof HTMLSelectElement) {
    emit('update:modelValue', target.value);
  }
}
</script>

<template>
  <div class="base-select">
    <label v-if="label" class="base-select__label" :for="selectId">
      {{ label }}<span v-if="required" class="base-select__required"> *</span>
    </label>
    <select
      :id="selectId"
      :aria-describedby="hasError ? errorId : undefined"
      :aria-invalid="hasError ? 'true' : 'false'"
      :aria-required="required ? 'true' : undefined"
      class="base-select__control"
      :class="{ 'base-select__control_error': hasError }"
      :disabled="disabled"
      :required="required"
      :value="modelValue"
      @change="handleChange"
    >
      <option v-if="placeholder" value="">
        {{ placeholder }}
      </option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <p v-if="hasError" :id="errorId" class="base-select__error">
      {{ error }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.base-select {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: 100%;
}

.base-select__label {
  color: var(--color-on-surface);
  font-size: var(--font-size-label-md);
}

.base-select__required {
  color: var(--color-error);
}

.base-select__control {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  color: var(--color-on-surface);
  padding: var(--spacing-sm) 12px;
  width: 100%;

  &:disabled {
    background-color: var(--color-surface-muted);
    color: var(--color-muted);
    cursor: not-allowed;
  }
}

.base-select__control_error {
  border-color: var(--color-error);
}

.base-select__error {
  color: var(--color-error);
  font-size: var(--font-size-label-sm);
}
</style>
