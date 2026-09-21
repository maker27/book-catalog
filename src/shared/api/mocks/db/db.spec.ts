import { describe, expect, test, beforeEach } from 'vitest';
import { createMockDb, getMockDb, resetMockDb, type MockDb } from './index';

const BOOKS_COUNT = 15;
const AUTHORS_COUNT = 12;
const COVER_URL_PREFIX = '/covers/';

describe('MockDb', () => {
  test('строит одинаковый набор данных при каждом создании', () => {
    const first = createMockDb();
    const second = createMockDb();
    expect(first.books).toEqual(second.books);
    expect(first.authors).toEqual(second.authors);
  });

  test('содержит 15 книг и 12 авторов', () => {
    const db = createMockDb();
    expect(db.books).toHaveLength(BOOKS_COUNT);
    expect(db.authors).toHaveLength(AUTHORS_COUNT);
  });

  test('у каждой книги локальная обложка', () => {
    const db = createMockDb();
    for (const book of db.books) {
      expect(book.isbn).toMatch(/^\d{13}$/);
      expect(book.cover_url).toBe(`${COVER_URL_PREFIX}${book.isbn}.jpg`);
    }
  });

  test('у каждой книги есть хотя бы один существующий автор', () => {
    const db = createMockDb();
    const authorIds = new Set(db.authors.map((a) => a.id));
    for (const book of db.books) {
      expect(book.author_ids.length).toBeGreaterThan(0);
      for (const authorId of book.author_ids) {
        expect(authorIds.has(authorId)).toBe(true);
      }
    }
  });

  test('listBooks поддерживает пагинацию', () => {
    const db = createMockDb();
    const result = db.listBooks({ page: 1, perPage: 12 });
    expect(result.pagination).toEqual({ total: 15, page: 1, per_page: 12, total_pages: 2 });
    expect(result.items).toHaveLength(12);
  });

  test('listBooks фильтрует по году', () => {
    const db = createMockDb();
    const result = db.listBooks({ year: 2003 });
    expect(result.pagination.total).toBe(2);
    expect(result.items.every((book) => book.year === 2003)).toBe(true);
  });

  test('listBooks фильтрует по автору', () => {
    const db = createMockDb();
    const author = db.authors[0];
    if (!author) throw new Error('author fixture missing');
    const result = db.listBooks({ authorId: author.id });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((book) => (book.authors ?? []).some((a) => a.id === author.id))).toBe(
      true,
    );
  });

  test('listBooks ищет по названию и ISBN', () => {
    const db = createMockDb();
    const byTitle = db.listBooks({ search: 'hobbit' });
    expect(byTitle.items).toHaveLength(1);
    const byIsbn = db.listBooks({ search: '9780618260300' });
    expect(byIsbn.items).toHaveLength(1);
  });

  test('listBooks ищет по описанию', () => {
    const db = createMockDb();
    const target = db.books[0];
    if (!target) throw new Error('book fixture missing');
    const descriptionFragment = target.description.slice(0, 10).toLowerCase();
    if (!descriptionFragment) throw new Error('book fixture has no description');
    const result = db.listBooks({ search: descriptionFragment });
    expect(result.items.some((book) => book.id === target.id)).toBe(true);
  });

  test('createBook / patchBook / deleteBook меняют состояние', () => {
    const db = createMockDb();
    const created = db.createBook({
      title: 'Новая книга',
      year: 2020,
      description: 'Тестовое описание',
      isbn: '9780000000002',
      author_ids: [1, 2],
    });
    const createdId = created.id;
    if (createdId === undefined) throw new Error('created book has no id');
    expect(createdId).toBe(16);
    expect(created.authors).toHaveLength(2);
    expect(db.getBook(createdId)).toBeDefined();

    const patched = db.patchBook(createdId, { title: 'Обновлённое название' });
    expect(patched?.title).toBe('Обновлённое название');

    const deleted = db.deleteBook(createdId);
    expect(deleted).toBe(true);
    expect(db.getBook(createdId)).toBeUndefined();
  });

  test('replaceBook заменяет книгу целиком', () => {
    const db = createMockDb();
    const replaced = db.replaceBook(1, {
      title: 'Другая книга',
      year: 2021,
      description: 'Описание',
      isbn: '9780000000003',
      author_ids: [2],
    });
    expect(replaced?.title).toBe('Другая книга');
    expect(replaced?.authors).toEqual([{ id: 2, full_name: db.authors[1]?.full_name }]);
  });

  test('getAuthor возвращает книги автора', () => {
    const db = createMockDb();
    const author = db.getAuthor(1);
    expect(author).toBeDefined();
    expect(author?.books?.length).toBeGreaterThan(0);
  });

  test('deleteAuthor удаляет автора и убирает его из книг', () => {
    const db = createMockDb();
    const deleted = db.deleteAuthor(1);
    expect(deleted).toBe(true);
    expect(db.authorExists(1)).toBe(false);
    expect(db.books.every((book) => !book.author_ids.includes(1))).toBe(true);
  });

  test('listAuthors поддерживает пагинацию и поиск', () => {
    const db = createMockDb();
    const page = db.listAuthors({ page: 1, perPage: 10 });
    expect(page.pagination).toEqual({ total: 12, page: 1, per_page: 10, total_pages: 2 });
    const found = db.listAuthors({ search: 'толкин' });
    expect(found.items).toHaveLength(1);
  });

  test('topAuthors считает количество книг автора за год с детерминированным порядком', () => {
    const db = createMockDb();
    const result = db.topAuthors(2003);
    expect(result).toHaveLength(2);
    expect(result[0]?.rank).toBe(1);
    expect(result.map((row) => row.books_count)).toEqual([1, 1]);
  });

  test('topAuthors возвращает пустой список без книг за год', () => {
    const db = createMockDb();
    expect(db.topAuthors(1900)).toEqual([]);
  });

  test('upsertSubscription идемпотентен для одинаковой пары автор/телефон', () => {
    const db = createMockDb();
    const first = db.upsertSubscription(1, '+79990001122');
    const second = db.upsertSubscription(1, '+79990001122');
    expect(first.existed).toBe(false);
    expect(second.existed).toBe(true);
    expect(first.record.id).toBe(second.record.id);
    expect(db.subscriptions).toHaveLength(1);
  });

  test('deleteSubscription удаляет подписку по id', () => {
    const db = createMockDb();
    const { record } = db.upsertSubscription(1, '+79990001122');
    expect(db.deleteSubscription(record.id)).toBe(true);
    expect(db.deleteSubscription(record.id)).toBe(false);
  });
});

describe('singleton', () => {
  let db: MockDb;

  beforeEach(() => {
    db = resetMockDb();
  });

  test('getMockDb возвращает один и тот же экземпляр', () => {
    expect(getMockDb()).toBe(db);
  });

  test('resetMockDb создаёт новый экземпляр с исходными данными', () => {
    db.deleteBook(1);
    const reset = resetMockDb();
    expect(reset.books).toHaveLength(BOOKS_COUNT);
    expect(getMockDb()).toBe(reset);
  });
});
