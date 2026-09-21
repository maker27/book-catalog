import { describe, expect, test } from 'vitest';
import { ApiRequestError, extractApiErrors, unwrapResponse, UNKNOWN_ERROR_MESSAGE } from './unwrap';

function okResult<T>(payload: T) {
  return { data: { success: true, data: payload }, response: new Response('', { status: 200 }) };
}

describe('unwrapResponse', () => {
  test('возвращает полезную нагрузку из конверта', () => {
    expect(unwrapResponse(okResult({ items: [1, 2] }))).toEqual({ items: [1, 2] });
  });

  test('кидает ApiRequestError со статусом и полями при 422', () => {
    const result = {
      error: { success: false, errors: [{ field: 'isbn', message: 'Некорректный ISBN' }] },
      response: new Response('', { status: 422 }),
    };

    try {
      unwrapResponse(result);
      expect.unreachable('должно было выбросить ошибку');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiRequestError);
      if (error instanceof ApiRequestError) {
        expect(error.status).toBe(422);
        expect(error.errors).toEqual([{ field: 'isbn', message: 'Некорректный ISBN' }]);
        expect(error.message).toBe('Некорректный ISBN');
      }
    }
  });

  test('пустой ответ 200 без data — тоже ошибка', () => {
    expect(() =>
      unwrapResponse({ data: undefined, response: new Response('', { status: 200 }) }),
    ).toThrowError(UNKNOWN_ERROR_MESSAGE);
  });
});

describe('extractApiErrors', () => {
  test('неизвестный формат даёт пустой список', () => {
    expect(extractApiErrors('boom')).toEqual([]);
    expect(extractApiErrors({ errors: 'boom' })).toEqual([]);
  });

  test('пропускает нестроковые поля', () => {
    expect(extractApiErrors({ errors: [{ field: 1, message: 'Ошибка' }, 'мусор'] })).toEqual([
      { message: 'Ошибка' },
    ]);
  });
});
