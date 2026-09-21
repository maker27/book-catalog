import { getMockDb } from '../db';
import { http, withMock } from './helpers';

export const reportHandlers = [
  http.get(
    '/reports/top-authors',
    withMock(({ query, response }) => {
      const yearRaw = query.get('year');
      const year = Number(yearRaw);
      if (
        yearRaw === null ||
        yearRaw === '' ||
        !Number.isInteger(year) ||
        year < 1000 ||
        year > 2100
      ) {
        return response(400).json({
          success: false,
          errors: [{ field: 'year', message: 'Параметр year не указан или неверен' }],
        });
      }

      const items = getMockDb().topAuthors(year);
      return response(200).json({ success: true, data: { year, items } });
    }),
  ),
];
