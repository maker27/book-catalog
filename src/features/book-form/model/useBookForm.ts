import { computed, ref, watch, type ComputedRef } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthorsDirectory } from '@/entities/author';
import {
  BOOK_FIELDS,
  buildBookJsonBody,
  buildBookMultipartRequest,
  createEmptyBookForm,
  validateBookForm,
  type BookFormState,
} from '@/entities/book';
import { ApiRequestError, NOT_FOUND_STATUS, unwrapResponse, useApi, type Book } from '@/shared/api';
import { useFormSubmit, useNotFoundRedirect, useResource } from '@/shared/lib';

interface UseBookFormOptions {
  bookId?: ComputedRef<number>;
}

export function useBookForm(options: UseBookFormOptions = {}) {
  const bookId = options.bookId;

  const { api } = useApi();
  const router = useRouter();
  const { applyApiErrors, fieldErrors, formError, isSubmitting, submit } = useFormSubmit();
  const { authors, error: authorsError, load: loadAuthors } = useAuthorsDirectory();

  const form = ref<BookFormState>(createEmptyBookForm());

  const {
    data: book,
    error: loadError,
    isPending: isLoadPending,
    reload: loadBook,
  } = useResource<Book | null>(async () => {
    if (!bookId) {
      return null;
    }
    return api.GET('/books/{id}', { params: { path: { id: bookId.value } } }).then(unwrapResponse);
  }, null);

  if (bookId) {
    useNotFoundRedirect(loadError);
  }

  const hasLoadError = computed(() => {
    return (
      Boolean(loadError.value) &&
      !(loadError.value instanceof ApiRequestError && loadError.value.status === NOT_FOUND_STATUS)
    );
  });

  loadAuthors();

  if (bookId) {
    watch(bookId, loadBook, { immediate: true });
    watch(
      book,
      (loaded) => {
        if (!loaded) {
          return;
        }
        form.value = {
          authorIds: (loaded.authors ?? []).map((author) => author.id ?? 0),
          cover: null,
          description: loaded.description ?? '',
          isbn: loaded.isbn ?? '',
          title: loaded.title ?? '',
          year: loaded.year ? String(loaded.year) : '',
        };
      },
      { immediate: true },
    );
  }

  async function handleFormSubmit() {
    fieldErrors.value = validateBookForm(form.value, !bookId);
    if (Object.keys(fieldErrors.value).length > 0) {
      return;
    }

    await submit(async () => {
      if (!bookId) {
        const { data, error } = await api.POST('/books', buildBookMultipartRequest(form.value));
        if (error) {
          applyApiErrors(error.errors, BOOK_FIELDS);
          return;
        }
        await router.push(`/books/${data?.data?.id}`);
        return;
      }

      const response = form.value.cover
        ? await api.PUT('/books/{id}', {
            params: { path: { id: bookId.value } },
            ...buildBookMultipartRequest(form.value),
          })
        : await api.PATCH('/books/{id}', {
            params: { path: { id: bookId.value } },
            body: buildBookJsonBody(form.value),
          });
      if (response.error) {
        applyApiErrors(response.error.errors, BOOK_FIELDS);
        return;
      }
      await router.push(`/books/${bookId.value}`);
    });
  }

  return {
    authors,
    authorsError,
    book,
    fieldErrors,
    form,
    formError,
    handleFormSubmit,
    hasLoadError,
    isLoadPending,
    isSubmitting,
    loadAuthors,
    loadBook,
  };
}
