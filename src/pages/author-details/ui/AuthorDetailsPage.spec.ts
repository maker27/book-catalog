import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { SESSION_STORAGE_KEY } from '@/features/auth';
import { API_INJECTION_KEY, type Author } from '@/shared/api';
import AuthorDetailsPage from './AuthorDetailsPage.vue';

vi.mock('@/shared/lib', async () => {
  const actual = await vi.importActual<typeof import('@/shared/lib')>('@/shared/lib');
  return { ...actual, getApiMode: vi.fn<typeof actual.getApiMode>() };
});

vi.mock('@/entities/author', async () => {
  const actual = await vi.importActual<typeof import('@/entities/author')>('@/entities/author');
  return { ...actual, useAuthorsDirectory: vi.fn<typeof actual.useAuthorsDirectory>() };
});

const { getApiMode } = await import('@/shared/lib');
const { useAuthorsDirectory } = await import('@/entities/author');

type ApiGet = (path: string) => Promise<{
  data: unknown;
  error: undefined;
  response: { ok: boolean };
}>;

type ApiDeleteResult = {
  data?: unknown;
  error?: unknown;
  response: { ok: boolean; status: number };
};

type ApiDelete = (path: string) => Promise<ApiDeleteResult>;

const AUTHOR_ID = 1;
const HOUR_MS = 60 * 60 * 1000;
const author: Author = { id: AUTHOR_ID, full_name: 'Лев Толстой' };

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/authors/:id', component: AuthorDetailsPage },
      { path: '/authors', component: { template: '<div />' } },
      { path: '/authors/:id/edit', component: { template: '<div />' } },
      { path: '/not-found', component: { template: '<div />' } },
    ],
  });
}

function setAuthenticatedSession() {
  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({
      expiresAt: new Date(Date.now() + HOUR_MS).toISOString(),
      token: 'test-token',
      user: { id: 1, username: 'admin', role: 'user' },
    }),
  );
}

function stubAuthorsDirectory() {
  const invalidate = vi.fn<() => void>();
  vi.mocked(useAuthorsDirectory).mockReturnValue({
    authors: ref([]),
    error: ref(null),
    invalidate,
    isPending: ref(false),
    load: vi.fn<() => Promise<void>>(() => Promise.resolve()),
  });
  return { invalidate };
}

async function mountPage(
  options: {
    apiDelete?: ApiDelete;
    isAuthenticated?: boolean;
    isSubscriptionsEnabled?: boolean;
  } = {},
) {
  const { apiDelete, isAuthenticated = false, isSubscriptionsEnabled = false } = options;
  vi.mocked(getApiMode).mockReturnValue({ isMock: true, mockMode: '', isSubscriptionsEnabled });

  if (isAuthenticated) {
    setAuthenticatedSession();
  }

  const apiGet = vi.fn<ApiGet>((path) => {
    if (path === '/authors/{id}') {
      return Promise.resolve({ data: { data: author }, error: undefined, response: { ok: true } });
    }
    return Promise.resolve({
      data: { data: { items: [] } },
      error: undefined,
      response: { ok: true },
    });
  });

  const router = createTestRouter();
  await router.push(`/authors/${AUTHOR_ID}`);
  await router.isReady();

  const wrapper = mount(AuthorDetailsPage, {
    global: {
      plugins: [router],
      provide: {
        [API_INJECTION_KEY]: {
          api: { GET: apiGet, DELETE: apiDelete ?? vi.fn<ApiDelete>() },
          localApi: {},
        },
      },
    },
  });
  await flushPromises();
  return { router, wrapper };
}

beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.clear();
  stubAuthorsDirectory();
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});

describe('AuthorDetailsPage — форма подписки', () => {
  test('рендерится при включённом флаге isSubscriptionsEnabled', async () => {
    const { wrapper } = await mountPage({ isSubscriptionsEnabled: true });
    expect(wrapper.find('.subscribe-form__form').exists()).toBe(true);
  });

  test('не рендерится при выключенном флаге isSubscriptionsEnabled', async () => {
    const { wrapper } = await mountPage({ isSubscriptionsEnabled: false });
    expect(wrapper.find('.author-page__title').exists()).toBe(true);
    expect(wrapper.find('.subscribe-form__form').exists()).toBe(false);
  });
});

describe('AuthorDetailsPage — удаление автора', () => {
  test('успешное удаление — редирект на список и сброс справочника авторов', async () => {
    const { invalidate } = stubAuthorsDirectory();
    const apiDelete = vi.fn<ApiDelete>(() =>
      Promise.resolve({
        data: { data: null },
        error: undefined,
        response: { ok: true, status: 204 },
      }),
    );
    const { router, wrapper } = await mountPage({ apiDelete, isAuthenticated: true });

    await wrapper.find('.author-page__actions button').trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/authors');
    expect(invalidate).toHaveBeenCalledOnce();
  });

  test('ошибка удаления — без редиректа, показано сообщение, справочник не сброшен', async () => {
    const { invalidate } = stubAuthorsDirectory();
    const apiDelete = vi.fn<ApiDelete>(() =>
      Promise.resolve({
        data: undefined,
        error: { errors: [{ message: 'Автора нельзя удалить: есть книги' }] },
        response: { ok: false, status: 409 },
      }),
    );
    const { router, wrapper } = await mountPage({ apiDelete, isAuthenticated: true });

    await wrapper.find('.author-page__actions button').trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe(`/authors/${AUTHOR_ID}`);
    expect(invalidate).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Автора нельзя удалить: есть книги');
  });
});
