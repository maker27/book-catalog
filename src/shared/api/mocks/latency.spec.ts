import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { configureLatency, MOCK_ERROR_RATE, withLatency } from './latency';

const RANDOM_BELOW_ERROR_RATE = MOCK_ERROR_RATE / 2;
const RANDOM_ABOVE_ERROR_RATE = (1 + MOCK_ERROR_RATE) / 2;

describe('withLatency', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    configureLatency('normal');
  });

  test('normal: задержка в пределах 150–300 мс', async () => {
    configureLatency('normal');
    let resolved = false;
    const promise = withLatency().then(() => {
      resolved = true;
    });
    await vi.advanceTimersByTimeAsync(149);
    expect(resolved).toBe(false);
    await vi.advanceTimersByTimeAsync(151);
    expect(resolved).toBe(true);
    await promise;
  });

  test('slow: задержка в пределах 1–2 с', async () => {
    configureLatency('slow');
    let resolved = false;
    const promise = withLatency().then(() => {
      resolved = true;
    });
    await vi.advanceTimersByTimeAsync(999);
    expect(resolved).toBe(false);
    await vi.advanceTimersByTimeAsync(1001);
    expect(resolved).toBe(true);
    await promise;
  });

  test('неизвестный режим трактуется как normal', async () => {
    configureLatency('unknown-mode');
    let resolved = false;
    const promise = withLatency().then(() => {
      resolved = true;
    });
    await vi.advanceTimersByTimeAsync(300);
    expect(resolved).toBe(true);
    await promise;
  });

  test('with_errors: значение ниже порога ошибки даёт 500', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(RANDOM_BELOW_ERROR_RATE);
    configureLatency('with_errors');
    const promise = withLatency();
    await vi.advanceTimersByTimeAsync(200);
    expect((await promise)?.status).toBe(500);
  });

  test('with_errors: значение выше порога ошибки даёт успешный ответ', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(RANDOM_ABOVE_ERROR_RATE);
    configureLatency('with_errors');
    const promise = withLatency();
    await vi.advanceTimersByTimeAsync(200);
    expect(await promise).toBeUndefined();
  });

  test('normal: значение ниже порога ошибки не влияет на режим без отказов', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(RANDOM_BELOW_ERROR_RATE);
    configureLatency('normal');
    const promise = withLatency();
    await vi.advanceTimersByTimeAsync(300);
    expect(await promise).toBeUndefined();
  });

  test('with_errors: тело 500 — конверт Error', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(RANDOM_BELOW_ERROR_RATE);
    configureLatency('with_errors');
    const promise = withLatency();
    await vi.advanceTimersByTimeAsync(200);
    const response = await promise;
    expect(response?.status).toBe(500);
    const body = (await response?.json()) as { success: boolean; errors: { field: string }[] };
    expect(body.success).toBe(false);
    expect(body.errors[0]?.field).toBe('server');
  });
});
