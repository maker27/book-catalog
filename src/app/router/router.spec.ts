import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, test } from 'vitest';

import { useSessionStore } from '@/features/auth';
import router from './index';

const HOUR_MS = 60 * 60 * 1000;
const TEST_USER = { id: 1, username: 'admin', role: 'user' };

function futureExpiresAt() {
  return new Date(Date.now() + HOUR_MS).toISOString();
}

function pastExpiresAt() {
  return new Date(Date.now() - HOUR_MS).toISOString();
}

beforeEach(async () => {
  setActivePinia(createPinia());
  localStorage.clear();
  await router.push('/');
});

describe('router', () => {
  test('гость на защищённом роуте редиректится на /login с redirect', async () => {
    await router.push('/books/new');

    expect(router.currentRoute.value.path).toBe('/login');
    expect(router.currentRoute.value.query.redirect).toBe('/books/new');
  });

  test('авторизованный проходит на защищённый роут', async () => {
    const session = useSessionStore();
    session.setSession({
      expiresAt: futureExpiresAt(),
      token: 'test-token',
      user: TEST_USER,
    });

    await router.push('/books/new');

    expect(router.currentRoute.value.path).toBe('/books/new');
  });

  test('истёкшая сессия сбрасывается через checkSessionExpiration и роут редиректит на /login', async () => {
    const session = useSessionStore();
    session.setSession({
      expiresAt: pastExpiresAt(),
      token: 'test-token',
      user: TEST_USER,
    });

    await router.push('/books/new');

    expect(session.isAuthenticated).toBe(false);
    expect(session.token).toBeNull();
    expect(router.currentRoute.value.path).toBe('/login');
  });

  test('публичный роут доступен гостю', async () => {
    await router.push('/books');

    expect(router.currentRoute.value.path).toBe('/books');
  });
});
