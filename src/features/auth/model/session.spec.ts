import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const HOUR_MS = 60 * 60 * 1000;

const { SESSION_STORAGE_KEY, useSessionStore } = await import('./session');

function payload(expiresAt: string) {
  return {
    expiresAt,
    token: 'test-token',
    user: { id: 1, username: 'admin', role: 'user' },
  };
}

beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.clear();
});

describe('session store', () => {
  test('setSession кладёт токен и пользователя и пишет в localStorage', () => {
    const session = useSessionStore();
    const data = payload(new Date(Date.now() + HOUR_MS).toISOString());
    session.setSession(data);

    expect(session.isAuthenticated).toBe(true);
    expect(session.token).toBe('test-token');
    expect(session.username).toBe('admin');
    expect(JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || '{}')).toEqual(data);
  });

  test('logout чистит состояние и хранилище', () => {
    const session = useSessionStore();
    session.setSession(payload(new Date(Date.now() + HOUR_MS).toISOString()));
    session.logout();

    expect(session.isAuthenticated).toBe(false);
    expect(session.token).toBeNull();
    expect(session.user).toBeNull();
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  test('сессия из localStorage восстанавливается при создании стора', () => {
    const data = payload(new Date(Date.now() + HOUR_MS).toISOString());
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
    setActivePinia(createPinia());

    const session = useSessionStore();

    expect(session.isAuthenticated).toBe(true);
    expect(session.user).toEqual(data.user);
  });

  test('битая дата истечения не считается живой сессией', () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload('не дата')));
    setActivePinia(createPinia());

    const session = useSessionStore();

    expect(session.isAuthenticated).toBe(false);
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  test('checkSessionExpiration разлогинивает сессию, истёкшую во время работы', () => {
    vi.useFakeTimers();
    try {
      const session = useSessionStore();
      session.setSession(payload(new Date(Date.now() + HOUR_MS).toISOString()));
      expect(session.isAuthenticated).toBe(true);

      vi.advanceTimersByTime(2 * HOUR_MS);
      session.checkSessionExpiration();

      expect(session.isAuthenticated).toBe(false);
      expect(session.token).toBeNull();
      expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  test('истёкшая и битая сессия игнорируются', () => {
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(payload(new Date(Date.now() - HOUR_MS).toISOString())),
    );
    setActivePinia(createPinia());
    const expired = useSessionStore();
    expect(expired.isAuthenticated).toBe(false);
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();

    localStorage.setItem(SESSION_STORAGE_KEY, 'not a session');
    setActivePinia(createPinia());
    const broken = useSessionStore();
    expect(broken.isAuthenticated).toBe(false);
  });
});
