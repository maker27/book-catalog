import { describe, expect, test } from 'vitest';
import { normalizeFullName, validateAuthorForm } from './authorSchema';
import {
  buildBookFormData,
  buildBookJsonBody,
  buildBookMultipartRequest,
  createEmptyBookForm,
  validateBookForm,
  type BookFormState,
} from './bookSchema';
import { validateSubscriptionForm } from './subscriptionSchema';

function validBookForm(overrides: Partial<BookFormState> = {}): BookFormState {
  return {
    ...createEmptyBookForm(),
    authorIds: [1, 2],
    isbn: '978-5-0000-0000-0',
    title: 'Книга',
    year: '2024',
    ...overrides,
  };
}

function pngCover(size = 1024): File {
  const file = new File([new Uint8Array(size)], 'cover.png', { type: 'image/png' });
  return file;
}

describe('validateBookForm', () => {
  test('требует название, год и хотя бы одного автора', () => {
    const errors = validateBookForm(createEmptyBookForm(), false);
    expect(errors.title).toBeTruthy();
    expect(errors.year).toBeTruthy();
    expect(errors.author_ids).toBeTruthy();
  });

  test('валидная форма без обложки проходит при isCoverRequired=false', () => {
    expect(validateBookForm(validBookForm(), false)).toEqual({});
  });

  test('обложка обязательна при создании', () => {
    expect(validateBookForm(validBookForm(), true).cover).toBeTruthy();
    expect(validateBookForm(validBookForm({ cover: pngCover() }), true)).toEqual({});
  });

  test('отвергает неверный формат файла и кривой ISBN', () => {
    const badType = new File([new Uint8Array(4)], 'doc.pdf', { type: 'application/pdf' });
    expect(validateBookForm(validBookForm({ cover: badType }), true).cover).toBeTruthy();
    expect(validateBookForm(validBookForm({ isbn: 'нет' }), false).isbn).toBeTruthy();
  });

  test('год вне диапазона отклоняется', () => {
    expect(validateBookForm(validBookForm({ year: '1800' }), false).year).toBeTruthy();
    expect(validateBookForm(validBookForm({ year: '20' }), false).year).toBeTruthy();
  });
});

describe('сериализация книги', () => {
  test('buildBookFormData кладёт каждого автора отдельным полем', () => {
    const formData = buildBookFormData(validBookForm({ cover: pngCover() }));
    expect(formData.getAll('author_ids')).toEqual(['1', '2']);
    expect(formData.get('title')).toBe('Книга');
    expect(formData.get('cover')).toBeInstanceOf(File);
  });

  test('buildBookJsonBody приводит год к числу и тримит строки', () => {
    expect(buildBookJsonBody(validBookForm({ title: '  Книга  ' }))).toEqual({
      author_ids: [1, 2],
      description: '',
      isbn: '978-5-0000-0000-0',
      title: 'Книга',
      year: 2024,
    });
  });

  test('buildBookMultipartRequest отдаёт FormData из сериализатора', () => {
    const request = buildBookMultipartRequest(validBookForm({ cover: pngCover() }));
    expect(request.body.cover).toBe('cover.png');
    expect(request.bodySerializer()).toBeInstanceOf(FormData);
  });
});

describe('автор и подписка', () => {
  test('пустое ФИО отклоняется, нормализация схлопывает пробелы', () => {
    expect(validateAuthorForm('   ').full_name).toBeTruthy();
    expect(validateAuthorForm('Иван Тестов')).toEqual({});
    expect(normalizeFullName('  Иван   Тестов ')).toBe('Иван Тестов');
  });

  test('телефон принимается только в формате +7XXXXXXXXXX', () => {
    expect(validateSubscriptionForm('+79991234567')).toEqual({});
    expect(validateSubscriptionForm('89991234567').phone).toBeTruthy();
  });
});
