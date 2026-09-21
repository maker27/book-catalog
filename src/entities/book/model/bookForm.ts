import { z } from 'zod';
import { ALLOWED_COVER_TYPES, FIRST_CATALOG_YEAR, MAX_COVER_SIZE_BYTES } from '@/shared/config';
import { isValidIsbn } from '@/shared/lib';

export const BOOK_TITLE_MAX_LENGTH = 255;
export const BOOK_DESCRIPTION_MAX_LENGTH = 2000;

export const BOOK_FIELDS = ['title', 'year', 'description', 'isbn', 'author_ids', 'cover'] as const;

export interface BookFormState {
  authorIds: number[];
  cover: File | null;
  description: string;
  isbn: string;
  title: string;
  year: string;
}

export type BookFormErrors = Partial<Record<(typeof BOOK_FIELDS)[number], string>>;

export const createEmptyBookForm = (): BookFormState => ({
  authorIds: [],
  cover: null,
  description: '',
  isbn: '',
  title: '',
  year: '',
});

const yearSchema = z
  .string()
  .trim()
  .min(1, 'Укажите год издания')
  .refine((value) => /^\d{4}$/.test(value), 'Год должен состоять из 4 цифр')
  .refine((value) => Number(value) >= FIRST_CATALOG_YEAR, `Год не раньше ${FIRST_CATALOG_YEAR}`);

export const bookFormSchema = z.object({
  authorIds: z.array(z.number()).min(1, 'Выберите хотя бы одного автора'),
  cover: z
    .instanceof(File)
    .nullable()
    .refine(
      (file) => file === null || ALLOWED_COVER_TYPES.some((type) => type === file.type),
      'Допустимы форматы JPEG, PNG или WebP',
    )
    .refine(
      (file) => file === null || file.size <= MAX_COVER_SIZE_BYTES,
      'Файл не должен превышать 5 МБ',
    ),
  description: z.string().trim().max(BOOK_DESCRIPTION_MAX_LENGTH, 'Описание слишком длинное'),
  isbn: z
    .string()
    .trim()
    .refine((value) => value === '' || isValidIsbn(value), 'Некорректный ISBN'),
  title: z
    .string()
    .trim()
    .min(1, 'Укажите название книги')
    .max(BOOK_TITLE_MAX_LENGTH, 'Название слишком длинное'),
  year: yearSchema,
});

const FIELD_BY_FORM_KEY: Record<string, (typeof BOOK_FIELDS)[number]> = {
  authorIds: 'author_ids',
  cover: 'cover',
  description: 'description',
  isbn: 'isbn',
  title: 'title',
  year: 'year',
};

export function validateBookForm(state: BookFormState, isCoverRequired: boolean): BookFormErrors {
  const errors: BookFormErrors = {};
  const result = bookFormSchema.safeParse(state);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const formKey = issue.path[0];
      const field = typeof formKey === 'string' ? FIELD_BY_FORM_KEY[formKey] : undefined;
      if (field && !errors[field]) {
        errors[field] = issue.message;
      }
    }
  }
  if (isCoverRequired && state.cover === null && !errors.cover) {
    errors.cover = 'Загрузите обложку';
  }
  return errors;
}

export function buildBookFormData(state: BookFormState): FormData {
  const formData = new FormData();
  formData.set('title', state.title.trim());
  formData.set('year', state.year.trim());
  formData.set('description', state.description.trim());
  formData.set('isbn', state.isbn.trim());
  for (const authorId of state.authorIds) {
    formData.append('author_ids', String(authorId));
  }
  if (state.cover) {
    formData.set('cover', state.cover);
  }
  return formData;
}

export function buildBookJsonBody(state: BookFormState) {
  return {
    author_ids: state.authorIds,
    description: state.description.trim(),
    isbn: state.isbn.trim(),
    title: state.title.trim(),
    year: Number(state.year),
  };
}

export function buildBookMultipartRequest(state: BookFormState) {
  const formData = buildBookFormData(state);
  return {
    body: { ...buildBookJsonBody(state), cover: state.cover?.name ?? '' },
    bodySerializer: () => formData,
  };
}
