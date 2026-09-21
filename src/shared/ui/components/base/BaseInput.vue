<script setup lang="ts">
import { computed, type InputHTMLAttributes, nextTick, useId } from 'vue';

const props = withDefaults(
  defineProps<{
    autocomplete?: string;
    disabled?: boolean;
    error?: string;
    hint?: string;
    id?: string;
    inputmode?: InputHTMLAttributes['inputmode'];
    label?: string;
    maxlength?: number;
    modelValue?: string | number | null;
    placeholder?: string;
    required?: boolean;
    type?: string;
  }>(),
  {
    autocomplete: undefined,
    disabled: false,
    error: '',
    hint: '',
    id: undefined,
    inputmode: undefined,
    label: '',
    maxlength: undefined,
    modelValue: '',
    placeholder: '',
    required: false,
    type: 'text',
  },
);

const emit = defineEmits<{ 'update:modelValue': [string] }>();

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);
const errorId = computed(() => `${inputId.value}-error`);
const hasError = computed(() => Boolean(props.error));

async function handleInput(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  emit('update:modelValue', target.value);
  await nextTick();

  // Keep the DOM in sync when the parent normalizes the emitted value back to the current one.
  const normalizedValue = String(props.modelValue ?? '');
  if (target.value !== normalizedValue) {
    target.value = normalizedValue;
  }
}
</script>

<template>
  <div class="base-input">
    <label v-if="label" class="base-input__label" :for="inputId">
      {{ label }}<span v-if="required" class="base-input__required"> *</span>
    </label>
    <input
      :id="inputId"
      :aria-describedby="hasError ? errorId : undefined"
      :aria-invalid="hasError ? 'true' : 'false'"
      :aria-required="required ? 'true' : undefined"
      :autocomplete="autocomplete"
      class="base-input__control"
      :class="{ 'base-input__control_error': hasError }"
      :disabled="disabled"
      :inputmode="inputmode"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :required="required"
      :type="type"
      :value="modelValue ?? ''"
      @input="handleInput"
    />
    <p v-if="hint && !hasError" class="base-input__hint">{{ hint }}</p>
    <p v-if="hasError" :id="errorId" class="base-input__error">{{ error }}</p>
  </div>
</template>

<style scoped lang="scss">
.base-input {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: 100%;
}

.base-input__label {
  color: var(--color-on-surface);
  font-size: var(--font-size-label-md);
}

.base-input__required {
  color: var(--color-error);
}

.base-input__control {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  color: var(--color-on-surface);
  padding: var(--spacing-sm) 12px;
  width: 100%;

  &:focus {
    border-color: var(--color-primary);
    outline: 2px solid color-mix(in srgb, var(--color-accent) 20%, transparent);
  }

  &:disabled {
    background-color: var(--color-surface-muted);
    color: var(--color-muted);
    cursor: not-allowed;
  }
}

.base-input__control_error {
  border-color: var(--color-error);
}

.base-input__hint {
  color: var(--color-muted);
  font-size: var(--font-size-label-sm);
}

.base-input__error {
  color: var(--color-error);
  font-size: var(--font-size-label-sm);
}
</style>
