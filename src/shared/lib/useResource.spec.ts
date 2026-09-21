import { nextTick, watch } from 'vue';
import { describe, expect, test } from 'vitest';
import { useResource } from './useResource';

describe('useResource', () => {
  test('замена всего значения data.value реактивна', async () => {
    const { data, reload } = useResource<string>(() => Promise.resolve('loaded'), 'initial');

    const seen: string[] = [];
    watch(data, (value) => {
      seen.push(value);
    });

    await reload();
    await nextTick();

    expect(data.value).toBe('loaded');
    expect(seen).toEqual(['loaded']);
  });

  test('поднимает isPending на время загрузки и записывает результат', async () => {
    const { data, isPending, reload } = useResource<string>(() => Promise.resolve('loaded'), '');

    const pending = reload();
    expect(isPending.value).toBe(true);
    await pending;

    expect(isPending.value).toBe(false);
    expect(data.value).toBe('loaded');
  });

  test('исключение из loader записывается в error, data не меняется', async () => {
    const failure = new Error('network');
    const { data, error, isPending, reload } = useResource<string>(
      () => Promise.reject(failure),
      'initial',
    );

    await reload();

    expect(error.value).toBe(failure);
    expect(data.value).toBe('initial');
    expect(isPending.value).toBe(false);
  });

  test('устаревший ответ не перетирает результат более нового запроса', async () => {
    let resolveFirst: (value: string) => void = () => {};
    let callCount = 0;

    const { data, error, isPending, reload } = useResource<string>(() => {
      callCount += 1;
      if (callCount === 1) {
        return new Promise<string>((resolve) => {
          resolveFirst = resolve;
        });
      }
      return Promise.resolve('second');
    }, '');

    const firstReload = reload();
    const secondReload = reload();

    await secondReload;
    expect(data.value).toBe('second');
    expect(isPending.value).toBe(false);

    resolveFirst('first');
    await firstReload;

    expect(data.value).toBe('second');
    expect(error.value).toBeNull();
  });

  test('устаревшая ошибка не перетирает уже полученный результат', async () => {
    let rejectFirst: (reason: unknown) => void = () => {};
    let callCount = 0;

    const { data, error, reload } = useResource<string>(() => {
      callCount += 1;
      if (callCount === 1) {
        return new Promise<string>((_resolve, reject) => {
          rejectFirst = reject;
        });
      }
      return Promise.resolve('fresh');
    }, '');

    const firstReload = reload();
    const secondReload = reload();

    await secondReload;
    expect(data.value).toBe('fresh');

    rejectFirst(new Error('stale failure'));
    await firstReload;

    expect(data.value).toBe('fresh');
    expect(error.value).toBeNull();
  });
});
