import { describe, expect, test, vi } from 'vitest';
import { DEFAULT_REQUEST_ERROR, useFormSubmit } from './useFormSubmit';

describe('useFormSubmit', () => {
  test('поднимает isSubmitting на время запроса и возвращает результат', async () => {
    const { isSubmitting, submit } = useFormSubmit();
    let resolveTask: (value: string) => void = () => {};
    const pending = submit(
      () =>
        new Promise<string>((resolve) => {
          resolveTask = resolve;
        }),
    );

    expect(isSubmitting.value).toBe(true);
    resolveTask('ok');
    await expect(pending).resolves.toBe('ok');
    expect(isSubmitting.value).toBe(false);
  });

  test('повторный сабмит во время запроса игнорируется', async () => {
    const { submit } = useFormSubmit();
    const task = vi.fn<() => Promise<string>>(
      () => new Promise<string>((resolve) => setTimeout(() => resolve('ok'), 10)),
    );
    const first = submit(task);
    const second = await submit(task);

    expect(second).toBeUndefined();
    expect(task).toHaveBeenCalledTimes(1);
    await first;
  });

  test('исключение превращается в общую ошибку формы', async () => {
    const { formError, isSubmitting, submit } = useFormSubmit();
    const result = await submit(() => Promise.reject(new Error('network')));

    expect(result).toBeUndefined();
    expect(formError.value).toBe(DEFAULT_REQUEST_ERROR);
    expect(isSubmitting.value).toBe(false);
  });

  test('ошибки 422 раскладываются по известным полям, остальные — в общую ошибку', () => {
    const { applyApiErrors, fieldErrors, formError } = useFormSubmit();

    applyApiErrors(
      [
        { field: 'isbn', message: 'Некорректный ISBN' },
        { field: 'server', message: 'Что-то пошло не так' },
      ],
      ['isbn', 'title'],
    );

    expect(fieldErrors.value).toEqual({ isbn: 'Некорректный ISBN' });
    expect(formError.value).toBe('Что-то пошло не так');
  });

  test('пустой список ошибок — общая ошибка по умолчанию', () => {
    const { applyApiErrors, fieldErrors, formError } = useFormSubmit();
    applyApiErrors([], ['title']);

    expect(formError.value).toBe(DEFAULT_REQUEST_ERROR);
    expect(fieldErrors.value).toEqual({});
  });

  test('setFieldError записывает ошибку конкретного поля', () => {
    const { fieldErrors, setFieldError } = useFormSubmit();
    setFieldError('title', 'Обязательное поле');

    expect(fieldErrors.value).toEqual({ title: 'Обязательное поле' });
  });

  test('clearFieldErrors очищает все ошибки полей', () => {
    const { clearFieldErrors, fieldErrors, setFieldError } = useFormSubmit();
    setFieldError('title', 'Обязательное поле');
    clearFieldErrors();

    expect(fieldErrors.value).toEqual({});
  });
});
