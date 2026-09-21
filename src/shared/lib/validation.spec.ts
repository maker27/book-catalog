import { describe, expect, test } from 'vitest';
import { formatPhoneInput, isValidIsbn, normalizeFullName, PHONE_PATTERN } from './validation';

describe('isValidIsbn', () => {
  test('принимает 10 цифр без разделителей', () => {
    expect(isValidIsbn('0618260307')).toBe(true);
  });

  test('принимает 13 цифр с дефисами', () => {
    expect(isValidIsbn('978-0-618-26030-0')).toBe(true);
  });

  test('принимает 13 цифр без разделителей', () => {
    expect(isValidIsbn('9780618260300')).toBe(true);
  });

  test('отклоняет длину, отличную от 10 или 13', () => {
    expect(isValidIsbn('12345')).toBe(false);
    expect(isValidIsbn('123456789012')).toBe(false);
  });

  test('отклоняет буквы, включая контрольную X', () => {
    expect(isValidIsbn('012345678X')).toBe(false);
    expect(isValidIsbn('нет')).toBe(false);
  });

  test('отклоняет пустую строку', () => {
    expect(isValidIsbn('')).toBe(false);
  });
});

describe('normalizeFullName', () => {
  test('схлопывает лишние пробелы и обрезает края', () => {
    expect(normalizeFullName('  Иван   Тестов ')).toBe('Иван Тестов');
  });
});

describe('PHONE_PATTERN', () => {
  test('принимает телефон в формате +7XXXXXXXXXX', () => {
    expect(PHONE_PATTERN.test('+79991234567')).toBe(true);
  });

  test('отклоняет телефон без +7', () => {
    expect(PHONE_PATTERN.test('89991234567')).toBe(false);
  });
});

describe('formatPhoneInput', () => {
  test('оставляет валидный телефон без изменений', () => {
    expect(formatPhoneInput('+79991234567')).toBe('+79991234567');
  });

  test('удаляет буквы и разделители', () => {
    expect(formatPhoneInput('+7 (999) 123-45-67 abc')).toBe('+79991234567');
  });

  test('заменяет ведущую 8 на +7', () => {
    expect(formatPhoneInput('89991234567')).toBe('+79991234567');
  });

  test('обрезает лишние цифры', () => {
    expect(formatPhoneInput('+7123456789000')).toBe('+71234567890');
  });

  test('возвращает пустую строку, когда цифр нет', () => {
    expect(formatPhoneInput('уыввывы')).toBe('');
  });
});
