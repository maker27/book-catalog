import { flushPromises, mount } from '@vue/test-utils';
import { computed, defineComponent, ref, type ComputedRef } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { API_INJECTION_KEY, type Book } from '@/shared/api';
import { useBookForm } from './useBookForm';

vi.mock('@/entities/author', async () => {
  const actual = await vi.importActual<typeof import('@/entities/author')>('@/entities/author');
  return { ...actual, useAuthorsDirectory: vi.fn<typeof actual.useAuthorsDirectory>() };
});

const { useAuthorsDirectory } = await import('@/entities/author');

function stubAuthorsDirectory() {
  vi.mocked(useAuthorsDirectory).mockReturnValue({
    authors: ref([]),
    error: ref(null),
    invalidate: vi.fn<() => void>(),
    isPending: ref(false),
    load: vi.fn<() => Promise<void>>(() => Promise.resolve()),
  });
}

type ApiGet = (
  path: string,
) => Promise<{ data: unknown; error: undefined; response: { ok: boolean } }>;
type ApiPost = (
  path: string,
  init: unknown,
) => Promise<{ data?: unknown; error?: unknown; response: { ok: boolean } }>;
type ApiPatch = ApiPost;
type ApiPut = ApiPost;

const BOOK_ID = 1;
const book: Book = {
  authors: [{ id: 1, full_name: 'Лев Толстой' }],
  description: 'Роман',
  id: BOOK_ID,
  isbn: '978-5-0000-0000-0',
  title: 'Война и мир',
  year: 2024,
};

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/books/:id', component: { template: '<div />' } },
      { path: '/not-found', component: { template: '<div />' } },
    ],
  });
}

const TestHost = defineComponent({
  props: { bookId: { required: false, type: Number } },
  setup(props) {
    const initialBookId = props.bookId;
    const bookId: ComputedRef<number> | undefined =
      initialBookId === undefined ? undefined : computed(() => initialBookId);
    return useBookForm(bookId ? { bookId } : {});
  },
  render() {
    return null;
  },
});

async function mountHost(options: {
  apiGet?: ApiGet;
  apiPatch?: ApiPatch;
  apiPost?: ApiPost;
  apiPut?: ApiPut;
  bookId?: number;
}) {
  const router = createTestRouter();
  await router.push('/');
  await router.isReady();

  const wrapper = mount(TestHost, {
    global: {
      plugins: [router],
      provide: {
        [API_INJECTION_KEY]: {
          api: {
            GET: options.apiGet ?? vi.fn<ApiGet>(),
            PATCH: options.apiPatch ?? vi.fn<ApiPatch>(),
            POST: options.apiPost ?? vi.fn<ApiPost>(),
            PUT: options.apiPut ?? vi.fn<ApiPut>(),
          },
          localApi: {},
        },
      },
    },
    props: options.bookId === undefined ? {} : { bookId: options.bookId },
  });
  await flushPromises();
  return { router, wrapper };
}

beforeEach(() => {
  stubAuthorsDirectory();
});

describe('useBookForm — создание книги', () => {
  test('отправляет POST /books и переходит на страницу созданной книги', async () => {
    const apiPost = vi
      .fn<ApiPost>()
      .mockResolvedValue({ data: { data: { id: 42 } }, error: undefined, response: { ok: true } });
    const { router, wrapper } = await mountHost({ apiPost });

    wrapper.vm.form.authorIds = [1];
    wrapper.vm.form.title = 'Новая книга';
    wrapper.vm.form.year = '2024';
    wrapper.vm.form.cover = new File([new Uint8Array(4)], 'cover.png', { type: 'image/png' });

    await wrapper.vm.handleFormSubmit();
    await flushPromises();

    expect(apiPost).toHaveBeenCalledOnce();
    expect(apiPost.mock.calls[0]?.[0]).toBe('/books');
    expect(router.currentRoute.value.path).toBe('/books/42');
  });

  test('обложка обязательна при создании — запрос не отправляется', async () => {
    const apiPost = vi.fn<ApiPost>();
    const { wrapper } = await mountHost({ apiPost });

    wrapper.vm.form.authorIds = [1];
    wrapper.vm.form.title = 'Новая книга';
    wrapper.vm.form.year = '2024';

    await wrapper.vm.handleFormSubmit();

    expect(apiPost).not.toHaveBeenCalled();
    expect(wrapper.vm.fieldErrors.cover).toBeTruthy();
  });

  test('ошибки API раскладываются по полям формы', async () => {
    const apiPost = vi.fn<ApiPost>().mockResolvedValue({
      data: undefined,
      error: { errors: [{ field: 'title', message: 'Название занято' }] },
      response: { ok: false },
    });
    const { wrapper } = await mountHost({ apiPost });

    wrapper.vm.form.authorIds = [1];
    wrapper.vm.form.title = 'Новая книга';
    wrapper.vm.form.year = '2024';
    wrapper.vm.form.cover = new File([new Uint8Array(4)], 'cover.png', { type: 'image/png' });

    await wrapper.vm.handleFormSubmit();
    await flushPromises();

    expect(wrapper.vm.fieldErrors.title).toBe('Название занято');
  });
});

describe('useBookForm — редактирование книги', () => {
  test('загружает книгу и заполняет форму', async () => {
    const apiGet = vi.fn<ApiGet>(() =>
      Promise.resolve({ data: { data: book }, error: undefined, response: { ok: true } }),
    );
    const { wrapper } = await mountHost({ apiGet, bookId: BOOK_ID });

    expect(wrapper.vm.form.title).toBe('Война и мир');
    expect(wrapper.vm.form.authorIds).toEqual([1]);
  });

  test('без новой обложки отправляет PATCH', async () => {
    const apiGet = vi.fn<ApiGet>(() =>
      Promise.resolve({ data: { data: book }, error: undefined, response: { ok: true } }),
    );
    const apiPatch = vi
      .fn<ApiPatch>()
      .mockResolvedValue({ data: { data: book }, error: undefined, response: { ok: true } });
    const { router, wrapper } = await mountHost({ apiGet, apiPatch, bookId: BOOK_ID });

    await wrapper.vm.handleFormSubmit();
    await flushPromises();

    expect(apiPatch).toHaveBeenCalledOnce();
    expect(apiPatch.mock.calls[0]?.[0]).toBe('/books/{id}');
    expect(router.currentRoute.value.path).toBe(`/books/${BOOK_ID}`);
  });

  test('с новой обложкой отправляет PUT', async () => {
    const apiGet = vi.fn<ApiGet>(() =>
      Promise.resolve({ data: { data: book }, error: undefined, response: { ok: true } }),
    );
    const apiPut = vi
      .fn<ApiPut>()
      .mockResolvedValue({ data: { data: book }, error: undefined, response: { ok: true } });
    const { router, wrapper } = await mountHost({ apiGet, apiPut, bookId: BOOK_ID });

    wrapper.vm.form.cover = new File([new Uint8Array(4)], 'cover.png', { type: 'image/png' });

    await wrapper.vm.handleFormSubmit();
    await flushPromises();

    expect(apiPut).toHaveBeenCalledOnce();
    expect(apiPut.mock.calls[0]?.[0]).toBe('/books/{id}');
    expect(router.currentRoute.value.path).toBe(`/books/${BOOK_ID}`);
  });
});
