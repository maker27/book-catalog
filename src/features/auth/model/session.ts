import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const SESSION_STORAGE_KEY = 'book-catalog.session';

export interface SessionUser {
  id: number;
  username: string;
  role: string;
}

export interface SessionPayload {
  expiresAt: string;
  token: string;
  user: SessionUser;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSessionPayload(value: unknown): value is SessionPayload {
  if (!isRecord(value)) {
    return false;
  }

  const { expiresAt, token, user } = value;
  return (
    typeof token === 'string' &&
    typeof expiresAt === 'string' &&
    isRecord(user) &&
    typeof user.id === 'number' &&
    typeof user.role === 'string' &&
    typeof user.username === 'string'
  );
}

function isExpired(expiresAt: string | null, now: number): boolean {
  if (!expiresAt) {
    return true;
  }

  const expiresAtMs = new Date(expiresAt).getTime();
  return Number.isNaN(expiresAtMs) || expiresAtMs <= now;
}

function loadStoredSession(): SessionPayload | null {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return isSessionPayload(parsed) ? parsed : null;
  } catch (e) {
    console.warn('loadStoredSession', e);
    return null;
  }
}

function saveStoredSession(payload: SessionPayload | null): void {
  try {
    if (payload) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('saveStoredSession', e);
  }
}

export const useSessionStore = defineStore('session', () => {
  const storedSession = loadStoredSession();

  const initialState =
    storedSession &&
    isSessionPayload(storedSession) &&
    !isExpired(storedSession.expiresAt, Date.now())
      ? storedSession
      : null;

  if (!initialState && storedSession) {
    saveStoredSession(null);
  }

  const expiresAt = ref<string | null>(initialState?.expiresAt ?? null);
  const token = ref<string | null>(initialState?.token ?? null);
  const user = ref<SessionUser | null>(initialState?.user ?? null);

  const checkedAt = ref(Date.now());

  const isAuthenticated = computed(
    () => Boolean(token.value) && !isExpired(expiresAt.value, checkedAt.value),
  );
  const username = computed(() => user.value?.username ?? '');

  function setSession(payload: SessionPayload) {
    expiresAt.value = payload.expiresAt;
    token.value = payload.token;
    user.value = payload.user;
    saveStoredSession(payload);
  }

  function checkSessionExpiration() {
    checkedAt.value = Date.now();
    if (token.value && isExpired(expiresAt.value, checkedAt.value)) {
      logout();
    }
  }

  function logout() {
    expiresAt.value = null;
    token.value = null;
    user.value = null;
    saveStoredSession(null);
  }

  return {
    checkSessionExpiration,
    expiresAt,
    isAuthenticated,
    logout,
    setSession,
    token,
    user,
    username,
  };
});
