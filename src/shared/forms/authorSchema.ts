import { z } from 'zod';

export const AUTHOR_FULL_NAME_MAX_LENGTH = 255;
export const AUTHOR_FIELDS = ['full_name'] as const;

export type AuthorFormErrors = Partial<Record<(typeof AUTHOR_FIELDS)[number], string>>;

export const authorFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Укажите ФИО автора')
    .max(AUTHOR_FULL_NAME_MAX_LENGTH, 'ФИО слишком длинное'),
});

export function validateAuthorForm(fullName: string): AuthorFormErrors {
  const result = authorFormSchema.safeParse({ fullName });
  if (result.success) {
    return {};
  }
  return { full_name: result.error.issues[0]?.message };
}

export function normalizeFullName(fullName: string): string {
  return fullName.trim().replace(/\s+/g, ' ');
}
