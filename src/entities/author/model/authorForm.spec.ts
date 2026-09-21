import { describe, expect, test } from 'vitest';
import { validateAuthorForm } from './authorForm';

describe('validateAuthorForm', () => {
  test('пустое ФИО отклоняется', () => {
    expect(validateAuthorForm('   ').full_name).toBeTruthy();
  });

  test('валидное ФИО проходит', () => {
    expect(validateAuthorForm('Иван Тестов')).toEqual({});
  });
});
