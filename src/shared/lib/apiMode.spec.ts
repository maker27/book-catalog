import { afterEach, describe, expect, test, vi } from 'vitest';
import { getApiMode } from './apiMode';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getApiMode', () => {
  test('включает мок-режим, когда URL backend не задан', () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_API_MODE', '');
    vi.stubEnv('VITE_SUBSCRIPTIONS_ENABLED', '');

    const { isMock, isSubscriptionsEnabled } = getApiMode();

    expect(isMock).toBe(true);
    expect(isSubscriptionsEnabled).toBe(true);
  });

  test('выключает мок-режим, когда URL backend задан', () => {
    vi.stubEnv('VITE_API_BASE', 'https://api.example.com');
    vi.stubEnv('VITE_API_MODE', '');
    vi.stubEnv('VITE_SUBSCRIPTIONS_ENABLED', '');

    const { isMock, isSubscriptionsEnabled } = getApiMode();

    expect(isMock).toBe(false);
    expect(isSubscriptionsEnabled).toBe(false);
  });

  test('явный VITE_API_MODE имеет приоритет над URL backend', () => {
    vi.stubEnv('VITE_API_BASE', 'https://api.example.com');
    vi.stubEnv('VITE_API_MODE', 'mock');

    const { isMock } = getApiMode();

    expect(isMock).toBe(true);
  });

  test('пробрасывает VITE_MOCK_MODE как есть', () => {
    vi.stubEnv('VITE_MOCK_MODE', 'with_errors');

    expect(getApiMode().mockMode).toBe('with_errors');
  });

  test('VITE_SUBSCRIPTIONS_ENABLED переопределяет значение по умолчанию', () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_SUBSCRIPTIONS_ENABLED', 'false');

    const { isSubscriptionsEnabled } = getApiMode();

    expect(isSubscriptionsEnabled).toBe(false);
  });
});
