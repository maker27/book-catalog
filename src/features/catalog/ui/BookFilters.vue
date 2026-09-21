<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { AuthorShort } from '@/shared/api';
import type { SelectOption } from '@/shared/ui/components/base/BaseSelect.vue';
import BaseButton from '@/shared/ui/components/base/BaseButton.vue';
import BaseInput from '@/shared/ui/components/base/BaseInput.vue';
import BaseSelect from '@/shared/ui/components/base/BaseSelect.vue';
import { DEFAULT_PAGE, type BooksFilters } from '../model/booksQuery';

const props = withDefaults(
  defineProps<{
    authors: AuthorShort[];
    disabled?: boolean;
    filters: BooksFilters;
    years: number[];
  }>(),
  { disabled: false },
);

const emit = defineEmits<{ reset: []; submit: [BooksFilters] }>();

const authorId = ref(props.filters.authorId === null ? '' : String(props.filters.authorId));
const search = ref(props.filters.search);
const year = ref(props.filters.year === null ? '' : String(props.filters.year));

watch(
  () => props.filters,
  (next) => {
    authorId.value = next.authorId === null ? '' : String(next.authorId);
    search.value = next.search;
    year.value = next.year === null ? '' : String(next.year);
  },
);

const authorOptions = computed<SelectOption[]>(() =>
  props.authors.map((author) => ({
    label: author.full_name ?? '',
    value: String(author.id ?? ''),
  })),
);

const yearOptions = computed<SelectOption[]>(() =>
  props.years.map((value) => ({
    label: String(value),
    value: String(value),
  })),
);

function handleFormSubmit() {
  emit('submit', {
    authorId: authorId.value === '' ? null : Number(authorId.value),
    page: DEFAULT_PAGE,
    search: search.value.trim(),
    year: year.value === '' ? null : Number(year.value),
  });
}

function handleResetClick() {
  emit('reset');
}
</script>

<template>
  <form class="book-filters" @submit.prevent="handleFormSubmit">
    <BaseInput
      v-model="search"
      :disabled="disabled"
      label="Поиск"
      placeholder="Название или описание"
    />
    <BaseSelect
      v-model="year"
      :disabled="disabled"
      label="Год"
      :options="yearOptions"
      placeholder="Любой"
    />
    <BaseSelect
      v-model="authorId"
      :disabled="disabled"
      label="Автор"
      :options="authorOptions"
      placeholder="Любой"
    />
    <div class="book-filters__actions">
      <BaseButton compact :disabled="disabled" type="submit"> Найти </BaseButton>
      <BaseButton compact :disabled="disabled" variant="link" @click="handleResetClick">
        Сбросить
      </BaseButton>
    </div>
  </form>
</template>

<style scoped lang="scss">
.book-filters {
  align-items: end;
  display: grid;
  gap: var(--spacing-sm);
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.book-filters__actions {
  display: flex;
  gap: var(--spacing-sm);
}
</style>
