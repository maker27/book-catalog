import { createOpenApiHttp } from 'openapi-msw';
import type { paths as LocalPaths } from '../../openapi/schema-local';
import { PHONE_PATTERN } from '@/shared/forms';
import { getMockDb } from '../db';
import { MOCK_BASE_URL, withMock } from './helpers';

const http = createOpenApiHttp<LocalPaths>({ baseUrl: MOCK_BASE_URL });

export const subscriptionHandlers = [
  http.post(
    '/subscriptions',
    withMock(async ({ request, response }) => {
      const body = await request.json();
      const phone = String(body.phone ?? '').trim();
      const authorId = Number(body.author_id);
      if (!PHONE_PATTERN.test(phone)) {
        return response(422).json({
          success: false,
          errors: [{ field: 'phone', message: 'Телефон должен быть в формате +7XXXXXXXXXX' }],
        });
      }

      const db = getMockDb();
      if (!Number.isInteger(authorId) || !db.authorExists(authorId)) {
        return response(404).json({
          success: false,
          errors: [{ field: 'author_id', message: 'Автор не найден' }],
        });
      }

      const { record, existed } = db.upsertSubscription(authorId, phone);
      const payload = { success: true, data: record };
      return existed ? response(200).json(payload) : response(201).json(payload);
    }),
  ),

  http.delete(
    '/subscriptions/{id}',
    withMock(({ params, response }) => {
      const deleted = getMockDb().deleteSubscription(Number(params.id));
      if (!deleted) {
        return response(404).json({
          success: false,
          errors: [{ field: 'id', message: 'Подписка не найдена' }],
        });
      }

      return response(204).empty();
    }),
  ),
];
