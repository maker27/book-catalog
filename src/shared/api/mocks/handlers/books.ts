import { ALLOWED_COVER_TYPES, MAX_COVER_SIZE_BYTES } from '@/shared/forms';
import { getMockDb, type MockDb } from '../db';
import { errorResponse, http, parseIntParam, withMock, type ErrorItem } from './helpers';

interface ParsedBookForm {
  title: string;
  year: number;
  description: string | undefined;
  isbn: string | undefined;
  author_ids: number[];
  cover: File | null;
}

async function parseBookForm(request: Request): Promise<ParsedBookForm> {
  const form = await request.formData();
  const rawAuthorIds = [...form.getAll('author_ids'), ...form.getAll('author_ids[]')];
  const authorIds = rawAuthorIds
    .flatMap((value) => String(value).split(','))
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value));
  const coverValue = form.get('cover');
  const description = form.get('description');
  const isbn = form.get('isbn');
  return {
    title: String(form.get('title') ?? '').trim(),
    year: form.get('year') === null ? Number.NaN : Number(form.get('year')),
    description: description === null ? undefined : String(description),
    isbn: isbn === null ? undefined : String(isbn).trim(),
    author_ids: authorIds,
    cover: coverValue !== null && typeof coverValue !== 'string' ? coverValue : null,
  };
}

export function isValidIsbn(value: string): boolean {
  if (!/^[0-9-]+$/.test(value)) return false;

  const digits = value.replace(/-/g, '');
  return digits.length === 10 || digits.length === 13;
}

function validateBookPayload(
  db: MockDb,
  payload: Partial<ParsedBookForm>,
  options: { requireAll: boolean; requireCover: boolean },
): ErrorItem[] {
  const errors: ErrorItem[] = [];
  if (options.requireAll || payload.title !== undefined) {
    if (!payload.title || !payload.title.trim()) {
      errors.push({ field: 'title', message: 'Название обязательно' });
    }
  }
  if (options.requireAll || payload.year !== undefined) {
    const year = payload.year;
    if (typeof year !== 'number' || !Number.isInteger(year) || year < 1000 || year > 2100) {
      errors.push({ field: 'year', message: 'Некорректный год издания' });
    }
  }
  if (options.requireAll || payload.author_ids !== undefined) {
    const ids = payload.author_ids ?? [];
    if (ids.length === 0) {
      errors.push({ field: 'author_ids', message: 'Укажите хотя бы одного автора' });
    } else if (ids.some((id) => !db.authorExists(id))) {
      errors.push({ field: 'author_ids', message: 'Автор не найден' });
    }
  }
  if (payload.isbn !== undefined && payload.isbn !== '' && !isValidIsbn(payload.isbn)) {
    errors.push({ field: 'isbn', message: 'Некорректный ISBN' });
  }
  if (options.requireCover) {
    const cover = payload.cover ?? null;
    if (!cover) {
      errors.push({ field: 'cover', message: 'Файл обложки обязателен' });
    } else {
      if (cover.type && !ALLOWED_COVER_TYPES.some((type) => type === cover.type)) {
        errors.push({
          field: 'cover',
          message: 'Обложка должна быть изображением (JPEG, PNG или WebP)',
        });
      }
      if (cover.size > MAX_COVER_SIZE_BYTES) {
        errors.push({ field: 'cover', message: 'Файл обложки больше 5 МБ' });
      }
    }
  }
  return errors;
}

export const bookHandlers = [
  http.get(
    '/books',
    withMock(({ query, response }) => {
      const db = getMockDb();
      const result = db.listBooks({
        page: parseIntParam(query.get('page') ?? undefined) ?? 1,
        perPage: parseIntParam(query.get('per-page') ?? undefined) ?? 20,
        ...(query.get('author_id') !== null
          ? { authorId: parseIntParam(query.get('author_id') ?? undefined) }
          : {}),
        ...(query.get('year') !== null
          ? { year: parseIntParam(query.get('year') ?? undefined) }
          : {}),
        ...(query.get('search') !== null ? { search: query.get('search') ?? '' } : {}),
      });
      return response(200).json({ success: true, data: result });
    }),
  ),

  http.post(
    '/books',
    withMock(
      async ({ request, response }) => {
        const db = getMockDb();
        const payload = await parseBookForm(request);
        const errors = validateBookPayload(db, payload, { requireAll: true, requireCover: true });
        if (errors.length > 0) {
          return response(422).json({ success: false, errors });
        }

        const book = db.createBook({
          title: payload.title,
          year: payload.year,
          ...(payload.description !== undefined ? { description: payload.description } : {}),
          ...(payload.isbn !== undefined ? { isbn: payload.isbn } : {}),
          author_ids: payload.author_ids,
        });
        return response(201).json({ success: true, data: book });
      },
      { isAuthRequired: true },
    ),
  ),

  http.get(
    '/books/{id}',
    withMock(({ params, response }) => {
      const db = getMockDb();
      const book = db.getBook(Number(params.id));
      if (!book) {
        return response(404).json({
          success: false,
          errors: [{ field: 'id', message: 'Книга не найдена' }],
        });
      }

      return response(200).json({ success: true, data: book });
    }),
  ),

  http.put(
    '/books/{id}',
    withMock(
      async ({ params, request, response }) => {
        const db = getMockDb();
        const id = Number(params.id);
        if (!db.getBook(id)) {
          return response.untyped(
            errorResponse(404, [{ field: 'id', message: 'Книга не найдена' }]),
          );
        }

        const payload = await parseBookForm(request);
        const errors = validateBookPayload(db, payload, { requireAll: true, requireCover: true });
        if (errors.length > 0) {
          return response(422).json({ success: false, errors });
        }

        const book = db.replaceBook(id, {
          title: payload.title,
          year: payload.year,
          ...(payload.description !== undefined ? { description: payload.description } : {}),
          ...(payload.isbn !== undefined ? { isbn: payload.isbn } : {}),
          author_ids: payload.author_ids,
        });
        return response(200).json({ success: true, data: book });
      },
      { isAuthRequired: true },
    ),
  ),

  http.patch(
    '/books/{id}',
    withMock(
      async ({ params, request, response }) => {
        const db = getMockDb();
        const id = Number(params.id);
        if (!db.getBook(id)) {
          return response.untyped(
            errorResponse(404, [{ field: 'id', message: 'Книга не найдена' }]),
          );
        }

        const body = await request.json();
        const partial: Partial<ParsedBookForm> = {
          ...(body.title !== undefined ? { title: body.title } : {}),
          ...(body.year !== undefined ? { year: body.year } : {}),
          ...(body.description !== undefined ? { description: body.description } : {}),
          ...(body.isbn !== undefined ? { isbn: body.isbn } : {}),
          ...(body.author_ids !== undefined ? { author_ids: body.author_ids } : {}),
        };
        const errors = validateBookPayload(db, partial, { requireAll: false, requireCover: false });
        if (errors.length > 0) {
          return response(422).json({ success: false, errors });
        }

        const book = db.patchBook(id, partial);
        return response(200).json({ success: true, data: book });
      },
      { isAuthRequired: true },
    ),
  ),

  http.delete(
    '/books/{id}',
    withMock(
      ({ params, response }) => {
        const db = getMockDb();
        const deleted = db.deleteBook(Number(params.id));
        if (!deleted) {
          return response.untyped(
            errorResponse(404, [{ field: 'id', message: 'Книга не найдена' }]),
          );
        }

        return response(204).empty();
      },
      { isAuthRequired: true },
    ),
  ),
];
