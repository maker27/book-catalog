<script setup lang="ts">
import { computed, useId } from 'vue';

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    error?: string;
    id?: string;
    label?: string;
    modelValue?: string;
    placeholder?: string;
    rows?: number;
  }>(),
  {
    disabled: false,
    error: '',
    id: undefined,
    label: '',
    modelValue: '',
    placeholder: '',
    rows: 5,
  },
);

const emit = defineEmits<{ 'update:modelValue': [string] }>();

const generatedId = useId();
const textareaId = computed(() => props.id ?? generatedId);
const errorId = computed(() => `${textareaId.value}-error`);
const hasError = computed(() => Boolean(props.error));

function handleInput(event: Event) {
  const target = event.target;
  if (target instanceof HTMLTextAreaElement) {
    emit('update:modelValue', target.value);
  }
}
</script>

<template>
  <div class="base-textarea">
    <label v-if="label" class="base-textarea__label" :for="textareaId">{{ label }}</label>
    <textarea
      :id="textareaId"
      :aria-describedby="hasError ? errorId : undefined"
      :aria-invalid="hasError ? 'true' : 'false'"
      class="base-textarea__control"
      :class="{ 'base-textarea__control_error': hasError }"
      :disabled="disabled"
      :placeholder="placeholder"
      :rows="rows"
      :value="modelValue"
      @input="handleInput"
    />
    <p v-if="hasError" :id="errorId" class="base-textarea__error">
      {{ error }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.base-textarea {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: 100%;
}

.base-textarea__label {
  color: var(--color-on-surface);
  font-size: var(--font-size-label-md);
}

.base-textarea__control {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  color: var(--color-on-surface);
  padding: var(--spacing-sm) 12px;
  resize: vertical;
  width: 100%;

  &:disabled {
    background-color: var(--color-surface-muted);
    color: var(--color-muted);
    cursor: not-allowed;
  }
}

.base-textarea__control_error {
  border-color: var(--color-error);
}

.base-textarea__error {
  color: var(--color-error);
  font-size: var(--font-size-label-sm);
}
</style>
