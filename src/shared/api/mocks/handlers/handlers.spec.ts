import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { getMockDb, resetMockDb } from '../db';
import { configureLatency } from '../latency';
import { handlers } from './index';
import { issueToken } from './helpers';

const BASE = 'http://localhost/api/v1';
const server = setupServer(...handlers);
const MULTIPART_BOUNDARY = 'vitest-multipart-boundary';
const CRLF = '\r\n';

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${issueToken().token}` };
}

interface BookFormRequest {
  body: ArrayBuffer;
  headers: Record<string, string>;
}

function concatBytes(chunks: Uint8Array[]): ArrayBuffer {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result.buffer;
}

function bookFormData(
  overrides: Partial<Record<string, string>> = {},
  withCover = true,
): BookFormRequest {
  const encoder = new TextEncoder();
  const fields: [string, string][] = [
    ['title', overrides.title ?? 'Тестовая книга'],
    ['year', overrides.year ?? '2024'],
    ['description', overrides.description ?? 'Описание'],
    ['isbn', overrides.isbn ?? '9780000000009'],
    ...(overrides.author_ids ?? '1,2').split(',').map((id): [string, string] => ['author_ids', id]),
  ];
  const chunks: Uint8Array[] = fields.map(([name, value]) =>
    encoder.encode(
      `--${MULTIPART_BOUNDARY}${CRLF}Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}${value}${CRLF}`,
    ),
  );
  if (withCover) {
    chunks.push(
      encoder.encode(
        `--${MULTIPART_BOUNDARY}${CRLF}Content-Disposition: form-data; name="cover"; filename="cover.png"${CRLF}Content-Type: image/png${CRLF}${CRLF}`,
      ),
      new Uint8Array([137, 80, 78, 71]),
      encoder.encode(CRLF),
    );
  }
  chunks.push(encoder.encode(`--${MULTIPART_BOUNDARY}--${CRLF}`));
  return {
    body: concatBytes(chunks),
    headers: { 'Content-Type': `multipart/form-data; boundary=${MULTIPART_BOUNDARY}` },
  };
}

beforeAll(() => {
  configureLatency('normal');
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => {
  resetMockDb();
});
afterAll(() => {
  server.close();
});

describe('GET /books', () => {
  test('отдаёт конверт {success, data:{items, pagination}}', async () => {
    const res = await fetch(`${BASE}/books?page=1&per-page=5`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.items).toHaveLength(5);
    expect(body.data.pagination).toEqual({ total: 15, page: 1, per_page: 5, total_pages: 3 });
  });

  test('фильтры author_id/year и search работают', async () => {
    const db = getMockDb();
    const target = db.books[0]!;
    const byYear = await (await fetch(`${BASE}/books?year=${target.year}&per-page=100`)).json();
    expect(byYear.data.items.every((b: { year: number }) => b.year === target.year)).toBe(true);

    const byAuthor = await (
      await fetch(`${BASE}/books?author_id=${target.author_ids[0]}&per-page=100`)
    ).json();
    expect(byAuthor.data.items.length).toBeGreaterThan(0);

    const bySearch = await (
      await fetch(`${BASE}/books?search=${encodeURIComponent(target.title)}`)
    ).json();
    expect(bySearch.data.items.some((b: { id: number }) => b.id === target.id)).toBe(true);
  });
});

describe('POST /books', () => {
  test('без токена — 401 с конвертом ошибки', async () => {
    const form = bookFormData();
    const res = await fetch(`${BASE}/books`, {
      method: 'POST',
      headers: form.headers,
      body: form.body,
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.errors.length).toBeGreaterThan(0);
  });

  test('с истёкшим токеном — 401', async () => {
    const { token } = issueToken(Date.now() - 48 * 60 * 60 * 1000);
    const form = bookFormData();
    const res = await fetch(`${BASE}/books`, {
      method: 'POST',
      headers: { ...form.headers, Authorization: `Bearer ${token}` },
      body: form.body,
    });
    expect(res.status).toBe(401);
  });

  test('невалидный год — 422 с field=year', async () => {
    const form = bookFormData({ year: 'not-a-year' });
    const res = await fetch(`${BASE}/books`, {
      method: 'POST',
      headers: { ...form.headers, ...authHeaders() },
      body: form.body,
    });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.errors.some((e: { field: string }) => e.field === 'year')).toBe(true);
  });

  test('без обложки — 422 с field=cover', async () => {
    const form = bookFormData({}, false);
    const res = await fetch(`${BASE}/books`, {
      method: 'POST',
      headers: { ...form.headers, ...authHeaders() },
      body: form.body,
    });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.errors.some((e: { field: string }) => e.field === 'cover')).toBe(true);
  });

  test('валидный запрос — 201, книга видна в GET', async () => {
    const form = bookFormData({ title: 'Свежесозданная книга' });
    const res = await fetch(`${BASE}/books`, {
      method: 'POST',
      headers: { ...form.headers, ...authHeaders() },
      body: form.body,
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.title).toBe('Свежесозданная книга');

    const get = await (await fetch(`${BASE}/books/${body.data.id}`)).json();
    expect(get.data.title).toBe('Свежесозданная книга');
    expect(get.data.authors.map((a: { id: number }) => a.id)).toEqual([1, 2]);
  });
});

describe('PUT/PATCH/DELETE /books/{id}', () => {
  test('PATCH принимает JSON без файла', async () => {
    const res = await fetch(`${BASE}/books/1`, {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Новое название' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.title).toBe('Новое название');
    expect(body.data.year).toBe(getMockDb().getBook(1)?.year);
  });

  test('PATCH с пустым title — 422', async () => {
    const res = await fetch(`${BASE}/books/1`, {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ' }),
    });
    expect(res.status).toBe(422);
  });

  test('PUT требует cover', async () => {
    const noCoverForm = bookFormData({}, false);
    const noCover = await fetch(`${BASE}/books/1`, {
      method: 'PUT',
      headers: { ...noCoverForm.headers, ...authHeaders() },
      body: noCoverForm.body,
    });
    expect(noCover.status).toBe(422);

    const withCoverForm = bookFormData({ title: 'Полностью обновлена' });
    const withCover = await fetch(`${BASE}/books/1`, {
      method: 'PUT',
      headers: { ...withCoverForm.headers, ...authHeaders() },
      body: withCoverForm.body,
    });
    expect(withCover.status).toBe(200);
    expect((await withCover.json()).data.title).toBe('Полностью обновлена');
  });

  test('DELETE — 204, книга исчезает; повтор — 404', async () => {
    const res = await fetch(`${BASE}/books/1`, { method: 'DELETE', headers: authHeaders() });
    expect(res.status).toBe(204);
    const get = await fetch(`${BASE}/books/1`);
    expect(get.status).toBe(404);
    const repeat = await fetch(`${BASE}/books/1`, { method: 'DELETE', headers: authHeaders() });
    expect(repeat.status).toBe(404);
  });
});

describe('авторы', () => {
  test('CRUD автора через HTTP', async () => {
    const created = await fetch(`${BASE}/authors`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: '  Иван   Тестов ' }),
    });
    expect(created.status).toBe(201);
    const body = await created.json();
    expect(body.data.full_name).toBe('Иван Тестов');

    const updated = await fetch(`${BASE}/authors/${body.data.id}`, {
      method: 'PUT',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: 'Пётр Тестов' }),
    });
    expect(updated.status).toBe(200);

    const deleted = await fetch(`${BASE}/authors/${body.data.id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    expect(deleted.status).toBe(204);
  });

  test('POST без full_name — 422 с field=full_name', async () => {
    const res = await fetch(`${BASE}/authors`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: '' }),
    });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.errors[0].field).toBe('full_name');
  });

  test('GET /authors/{id} отдаёт книги автора, 404 для несуществующего', async () => {
    const res = await (await fetch(`${BASE}/authors/1`)).json();
    expect(res.data.full_name).toBeTruthy();
    expect(Array.isArray(res.data.books)).toBe(true);

    const missing = await fetch(`${BASE}/authors/99999`);
    expect(missing.status).toBe(404);
  });
});

describe('GET /reports/top-authors', () => {
  test('без year — 400 в формате Error', async () => {
    const res = await fetch(`${BASE}/reports/top-authors`);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.errors[0].field).toBe('year');
  });

  test('с годом — максимум 10 строк, rank с 1, детерминированный порядок', async () => {
    const res = await (await fetch(`${BASE}/reports/top-authors?year=2003`)).json();
    expect(res.success).toBe(true);
    expect(res.data.year).toBe(2003);
    expect(res.data.items.length).toBeLessThanOrEqual(10);
    res.data.items.forEach((row: { rank: number }, index: number) => {
      expect(row.rank).toBe(index + 1);
    });
    const again = await (await fetch(`${BASE}/reports/top-authors?year=2003`)).json();
    expect(again.data.items).toEqual(res.data.items);
  });
});

describe('POST /auth/login', () => {
  test('admin/admin123 — token с exp и user', async () => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.token.split('.')).toHaveLength(3);
    expect(new Date(body.data.expires_at).getTime()).toBeGreaterThan(Date.now());
    expect(body.data.user.username).toBe('admin');
  });

  test('неверный пароль — 401', async () => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrong' }),
    });
    expect(res.status).toBe(401);
    expect((await res.json()).success).toBe(false);
  });
});

describe('POST /subscriptions', () => {
  test('идемпотентен: 201, повтор — 200 с той же записью', async () => {
    const payload = { author_id: 1, phone: '+79991234567' };
    const first = await fetch(`${BASE}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(first.status).toBe(201);
    const firstBody = await first.json();

    const repeat = await fetch(`${BASE}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(repeat.status).toBe(200);
    const repeatBody = await repeat.json();
    expect(repeatBody.data.id).toBe(firstBody.data.id);
  });

  test('кривой телефон — 422 с field=phone; чужой автор — 404', async () => {
    const bad = await fetch(`${BASE}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author_id: 1, phone: '89991234567' }),
    });
    expect(bad.status).toBe(422);
    expect((await bad.json()).errors[0].field).toBe('phone');

    const missing = await fetch(`${BASE}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author_id: 99999, phone: '+79991234567' }),
    });
    expect(missing.status).toBe(404);
  });
});
