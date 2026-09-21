import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { SESSION_STORAGE_KEY } from '@/features/auth';
import { API_INJECTION_KEY, type Book } from '@/shared/api';
import BookDetailsPage from './BookDetailsPage.vue';

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

const BOOK_ID = 1;
const HOUR_MS = 60 * 60 * 1000;
const book: Book = { id: BOOK_ID, title: 'Хоббит', year: 1937, authors: [] };

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/books/:id', component: BookDetailsPage },
      { path: '/books', component: { template: '<div />' } },
      { path: '/books/:id/edit', component: { template: '<div />' } },
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

async function mountPage(apiDelete?: ApiDelete) {
  setAuthenticatedSession();

  const apiGet = vi.fn<ApiGet>(() =>
    Promise.resolve({ data: { data: book }, error: undefined, response: { ok: true } }),
  );

  const router = createTestRouter();
  await router.push(`/books/${BOOK_ID}`);
  await router.isReady();

  const wrapper = mount(BookDetailsPage, {
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
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});

describe('BookDetailsPage — удаление книги', () => {
  test('успешное удаление — редирект на список книг', async () => {
    const apiDelete = vi.fn<ApiDelete>(() =>
      Promise.resolve({
        data: { data: null },
        error: undefined,
        response: { ok: true, status: 204 },
      }),
    );
    const { router, wrapper } = await mountPage(apiDelete);

    await wrapper.find('.book-page__actions button').trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/books');
  });

  test('ошибка удаления — без редиректа, показано сообщение', async () => {
    const apiDelete = vi.fn<ApiDelete>(() =>
      Promise.resolve({
        data: undefined,
        error: { errors: [{ message: 'Книгу нельзя удалить' }] },
        response: { ok: false, status: 409 },
      }),
    );
    const { router, wrapper } = await mountPage(apiDelete);

    await wrapper.find('.book-page__actions button').trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe(`/books/${BOOK_ID}`);
    expect(wrapper.text()).toContain('Книгу нельзя удалить');
  });
});
