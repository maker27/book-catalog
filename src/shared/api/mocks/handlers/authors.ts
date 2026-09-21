import { normalizeFullName as normalizeFullNameValue } from '@/shared/forms';
import { getMockDb } from '../db';
import { errorResponse, http, parseIntParam, withMock } from './helpers';

function normalizeFullName(value: unknown): string {
  return normalizeFullNameValue(String(value ?? ''));
}

export const authorHandlers = [
  http.get(
    '/authors',
    withMock(({ query, response }) => {
      const db = getMockDb();
      const result = db.listAuthors({
        page: parseIntParam(query.get('page') ?? undefined) ?? 1,
        perPage: parseIntParam(query.get('per-page') ?? undefined) ?? 20,
        ...(query.get('search') !== null ? { search: query.get('search') ?? '' } : {}),
      });
      return response(200).json({ success: true, data: result });
    }),
  ),

  http.post(
    '/authors',
    withMock(
      async ({ request, response }) => {
        const body = await request.json();
        const fullName = normalizeFullName(body.full_name);
        if (!fullName) {
          return response(422).json({
            success: false,
            errors: [{ field: 'full_name', message: 'ФИО обязательно' }],
          });
        }

        const author = getMockDb().createAuthor(fullName);
        return response(201).json({ success: true, data: author });
      },
      { isAuthRequired: true },
    ),
  ),

  http.get(
    '/authors/{id}',
    withMock(({ params, response }) => {
      const author = getMockDb().getAuthor(Number(params.id));
      if (!author) {
        return response(404).json({
          success: false,
          errors: [{ field: 'id', message: 'Автор не найден' }],
        });
      }

      return response(200).json({ success: true, data: author });
    }),
  ),

  http.put(
    '/authors/{id}',
    withMock(
      async ({ params, request, response }) => {
        const db = getMockDb();
        const id = Number(params.id);
        if (!db.authorExists(id)) {
          return response.untyped(errorResponse(404, [{ field: 'id', message: 'Автор не найден' }]));
        }

        const body = await request.json();
        const fullName = normalizeFullName(body.full_name);
        if (!fullName) {
          return response(422).json({
            success: false,
            errors: [{ field: 'full_name', message: 'ФИО обязательно' }],
          });
        }

        const author = db.updateAuthor(id, fullName);
        return response(200).json({ success: true, data: author });
      },
      { isAuthRequired: true },
    ),
  ),

  http.delete(
    '/authors/{id}',
    withMock(
      ({ params, response }) => {
        const deleted = getMockDb().deleteAuthor(Number(params.id));
        if (!deleted) {
          return response.untyped(errorResponse(404, [{ field: 'id', message: 'Автор не найден' }]));
        }

        return response(204).empty();
      },
      { isAuthRequired: true },
    ),
  ),
];
