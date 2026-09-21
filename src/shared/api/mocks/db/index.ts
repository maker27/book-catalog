import type { components } from '../../openapi/schema';
import type { components as LocalComponents } from '../../openapi/schema-local';

import { getCoverUrl, PLACEHOLDER_COVER_URL } from '@/shared/lib';

export type Book = components['schemas']['Book'];
export type BookShort = components['schemas']['BookShort'];
export type Author = components['schemas']['Author'];
export type AuthorShort = components['schemas']['AuthorShort'];
export type TopAuthor = components['schemas']['TopAuthor'];
export type Pagination = components['schemas']['Pagination'];
export type Subscription = LocalComponents['schemas']['Subscription'];

export interface BookRecord {
  id: number;
  title: string;
  year: number;
  description: string;
  isbn: string;
  cover_url: string;
  author_ids: number[];
}

export interface AuthorRecord {
  id: number;
  full_name: string;
}

export interface SubscriptionRecord {
  id: number;
  author_id: number;
  phone: string;
  created_at: string;
}

export interface ListBooksQuery {
  page?: number;
  perPage?: number;
  authorId?: number;
  year?: number;
  search?: string;
}

export interface ListQuery {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface BookWriteInput {
  title: string;
  year: number;
  description?: string;
  isbn?: string;
  author_ids: number[];
}

interface SeedAuthor {
  fullName: string;
}

interface SeedBook {
  title: string;
  year: number;
  description: string;
  isbn: string;
  authorNames: string[];
}

const ROWLING = 'Джоан Роулинг';
const TOLKIEN = 'Джон Рональд Руэл Толкин';
const HAWKING = 'Стивен Хокинг';
const SANDERSON = 'Брендон Сандерсон';
const BROWN = 'Дэн Браун';
const LEE = 'Харпер Ли';
const ORWELL = 'Джордж Оруэлл';
const AUSTEN = 'Джейн Остин';
const SALINGER = 'Джером Дэвид Сэлинджер';
const HUXLEY = 'Олдос Хаксли';
const BRONTE = 'Шарлотта Бронте';
const BRADBURY = 'Рэй Брэдбери';

const SEED_AUTHORS: SeedAuthor[] = [
  { fullName: ROWLING },
  { fullName: TOLKIEN },
  { fullName: HAWKING },
  { fullName: SANDERSON },
  { fullName: BROWN },
  { fullName: LEE },
  { fullName: ORWELL },
  { fullName: AUSTEN },
  { fullName: SALINGER },
  { fullName: HUXLEY },
  { fullName: BRONTE },
  { fullName: BRADBURY },
];

const SEED_BOOKS: SeedBook[] = [
  {
    title: "Harry Potter and the Sorcerer's Stone",
    year: 1997,
    description:
      'Мальчик-волшебник Гарри Поттер узнаёт о своём прошлом и поступает в школу чародейства Хогвартс.',
    isbn: '9780590353427',
    authorNames: [ROWLING],
  },
  {
    title: 'Harry Potter and the Order of the Phoenix',
    year: 2003,
    description: 'Пятый год обучения Гарри Поттера в Хогвартсе на фоне возвращения Волан-де-Морта.',
    isbn: '9780747569404',
    authorNames: [ROWLING],
  },
  {
    title: 'The Hobbit',
    year: 1937,
    description:
      'Хоббит Бильбо Бэггинс отправляется в путешествие вместе с гномами и волшебником Гэндальфом.',
    isbn: '9780618260300',
    authorNames: [TOLKIEN],
  },
  {
    title: 'The Lord of the Rings',
    year: 1954,
    description:
      'Эпическая история о Кольце Всевластия и Братстве Кольца, объединившемся для его уничтожения.',
    isbn: '9780061917813',
    authorNames: [TOLKIEN],
  },
  {
    title: 'A Brief History of Time',
    year: 1988,
    description:
      'Популярное изложение современных представлений о космологии, чёрных дырах и природе времени.',
    isbn: '9780553380163',
    authorNames: [HAWKING],
  },
  {
    title: 'The Way of Kings',
    year: 2010,
    description:
      'Первая книга цикла «Архив Буресвета» о мире, раздираемом войнами и древними пророчествами.',
    isbn: '9780765326355',
    authorNames: [SANDERSON],
  },
  {
    title: 'Mistborn: The Final Empire',
    year: 2006,
    description:
      'В мире, где Тёмный Лорд одержал победу тысячу лет назад, группа заговорщиков готовит восстание.',
    isbn: '9780765311788',
    authorNames: [SANDERSON],
  },
  {
    title: 'The Da Vinci Code',
    year: 2003,
    description:
      'Профессор символогии Роберт Лэнгдон расследует убийство в Лувре, раскрывая древнюю тайну.',
    isbn: '9780307474278',
    authorNames: [BROWN],
  },
  {
    title: 'To Kill a Mockingbird',
    year: 1960,
    description: 'История взросления Джин-Луизы Финч на фоне расового процесса на юге США.',
    isbn: '9780061120084',
    authorNames: [LEE],
  },
  {
    title: 'Nineteen Eighty-Four',
    year: 1949,
    description: 'Антиутопия о тоталитарном государстве, ведущем тотальную слежку за гражданами.',
    isbn: '9780452284234',
    authorNames: [ORWELL],
  },
  {
    title: 'Pride and Prejudice',
    year: 1813,
    description:
      'Роман о нравах, чувствах и предубеждениях в провинциальной Англии начала XIX века.',
    isbn: '9780679783268',
    authorNames: [AUSTEN],
  },
  {
    title: 'The Catcher in the Rye',
    year: 1951,
    description: 'Три дня из жизни подростка Холдена Колфилда, исключённого из очередной школы.',
    isbn: '9780316769488',
    authorNames: [SALINGER],
  },
  {
    title: 'Brave New World',
    year: 1932,
    description:
      'Антиутопия о технократическом обществе будущего, построенном на генетической кастовости.',
    isbn: '9780307356543',
    authorNames: [HUXLEY],
  },
  {
    title: 'Jane Eyre',
    year: 1847,
    description:
      'История гувернантки Джейн Эйр, её взросления и любви к хозяину поместья Торнфилд.',
    isbn: '9781857150100',
    authorNames: [BRONTE],
  },
  {
    title: 'Fahrenheit 451',
    year: 1953,
    description:
      'Антиутопия о пожарном, чья работа — сжигать книги, в обществе, отказавшемся от чтения.',
    isbn: '9780671665579',
    authorNames: [BRADBURY],
  },
];

function paginate<T>(
  items: T[],
  page: number,
  perPage: number,
): { slice: T[]; pagination: Pagination } {
  const total = items.length;
  const totalPages = perPage > 0 ? Math.ceil(total / perPage) : 0;
  const start = (page - 1) * perPage;
  return {
    slice: items.slice(start, start + perPage),
    pagination: { total, page, per_page: perPage, total_pages: totalPages },
  };
}

export class MockDb {
  authors: AuthorRecord[] = [];
  books: BookRecord[] = [];
  subscriptions: SubscriptionRecord[] = [];
  private nextAuthorId = 1;
  private nextBookId = 1;
  private nextSubscriptionId = 1;

  constructor() {
    const authorIdByName = new Map<string, number>();
    for (const seedAuthor of SEED_AUTHORS) {
      const id = this.nextAuthorId++;
      authorIdByName.set(seedAuthor.fullName, id);
      this.authors.push({ id, full_name: seedAuthor.fullName });
    }
    for (const seedBook of SEED_BOOKS) {
      const authorIds = seedBook.authorNames
        .map((name) => authorIdByName.get(name))
        .filter((id): id is number => id !== undefined);
      this.books.push({
        id: this.nextBookId++,
        title: seedBook.title,
        year: seedBook.year,
        description: seedBook.description,
        isbn: seedBook.isbn,
        cover_url: getCoverUrl(seedBook.isbn),
        author_ids: authorIds,
      });
    }
  }

  private toAuthorShort(record: AuthorRecord): AuthorShort {
    return { id: record.id, full_name: record.full_name };
  }

  listAuthors(query: ListQuery = {}): { items: AuthorShort[]; pagination: Pagination } {
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 20;
    const search = query.search?.trim().toLowerCase();
    let items = this.authors;
    if (search) {
      items = items.filter((a) => a.full_name.toLowerCase().includes(search));
    }
    const { slice, pagination } = paginate(items, page, perPage);
    return { items: slice.map((a) => this.toAuthorShort(a)), pagination };
  }

  getAuthor(id: number): Author | undefined {
    const record = this.authors.find((a) => a.id === id);
    if (!record) return;
    const books: BookShort[] = this.books
      .filter((b) => b.author_ids.includes(id))
      .map((b) => ({ id: b.id, title: b.title, year: b.year }));
    return { id: record.id, full_name: record.full_name, books };
  }

  createAuthor(fullName: string): AuthorShort {
    const record: AuthorRecord = { id: this.nextAuthorId++, full_name: fullName };
    this.authors.push(record);
    return this.toAuthorShort(record);
  }

  updateAuthor(id: number, fullName: string): AuthorShort | undefined {
    const record = this.authors.find((a) => a.id === id);
    if (!record) return;
    record.full_name = fullName;
    return this.toAuthorShort(record);
  }

  deleteAuthor(id: number): boolean {
    const index = this.authors.findIndex((a) => a.id === id);
    if (index === -1) return false;
    this.authors.splice(index, 1);
    for (const book of this.books) {
      book.author_ids = book.author_ids.filter((aid) => aid !== id);
    }
    return true;
  }

  authorExists(id: number): boolean {
    return this.authors.some((a) => a.id === id);
  }

  toBook(record: BookRecord): Book {
    return {
      id: record.id,
      title: record.title,
      year: record.year,
      description: record.description,
      isbn: record.isbn,
      cover_url: record.cover_url,
      authors: record.author_ids
        .map((id) => this.authors.find((a) => a.id === id))
        .filter((a): a is AuthorRecord => Boolean(a))
        .map((a) => ({ id: a.id, full_name: a.full_name })),
    };
  }

  listBooks(query: ListBooksQuery = {}): { items: Book[]; pagination: Pagination } {
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 20;
    const search = query.search?.trim().toLowerCase();
    let items = this.books;
    const authorId = query.authorId;
    if (authorId !== undefined) {
      items = items.filter((b) => b.author_ids.includes(authorId));
    }
    if (query.year !== undefined) {
      items = items.filter((b) => b.year === query.year);
    }
    if (search) {
      items = items.filter(
        (b) => b.title.toLowerCase().includes(search) || b.isbn.toLowerCase().includes(search),
      );
    }
    const { slice, pagination } = paginate(items, page, perPage);
    return { items: slice.map((b) => this.toBook(b)), pagination };
  }

  getBook(id: number): Book | undefined {
    const record = this.books.find((b) => b.id === id);
    return record ? this.toBook(record) : undefined;
  }

  createBook(input: BookWriteInput, cover: string = PLACEHOLDER_COVER_URL): Book {
    const record: BookRecord = {
      id: this.nextBookId++,
      title: input.title,
      year: input.year,
      description: input.description ?? '',
      isbn: input.isbn ?? '',
      cover_url: cover,
      author_ids: [...input.author_ids],
    };
    this.books.push(record);
    return this.toBook(record);
  }

  patchBook(id: number, input: Partial<BookWriteInput>): Book | undefined {
    const record = this.books.find((b) => b.id === id);
    if (!record) return;
    if (input.title !== undefined) record.title = input.title;
    if (input.year !== undefined) record.year = input.year;
    if (input.description !== undefined) record.description = input.description;
    if (input.isbn !== undefined) record.isbn = input.isbn;
    if (input.author_ids !== undefined) record.author_ids = [...input.author_ids];
    return this.toBook(record);
  }

  replaceBook(id: number, input: BookWriteInput, cover?: string): Book | undefined {
    const record = this.books.find((b) => b.id === id);
    if (!record) return;
    record.title = input.title;
    record.year = input.year;
    record.description = input.description ?? '';
    record.isbn = input.isbn ?? '';
    record.author_ids = [...input.author_ids];
    if (cover) record.cover_url = cover;
    return this.toBook(record);
  }

  deleteBook(id: number): boolean {
    const index = this.books.findIndex((b) => b.id === id);
    if (index === -1) return false;
    this.books.splice(index, 1);
    return true;
  }

  topAuthors(year: number, limit = 10): TopAuthor[] {
    const counts = new Map<number, number>();
    for (const book of this.books) {
      if (book.year !== year) continue;
      for (const authorId of book.author_ids) {
        counts.set(authorId, (counts.get(authorId) ?? 0) + 1);
      }
    }
    const rows = [...counts.entries()]
      .map(([authorId, count]) => ({
        author: this.authors.find((a) => a.id === authorId),
        count,
      }))
      .filter((row): row is { author: AuthorRecord; count: number } => Boolean(row.author))
      .sort(
        (a, b) =>
          b.count - a.count ||
          a.author.full_name.localeCompare(b.author.full_name, 'ru') ||
          a.author.id - b.author.id,
      )
      .slice(0, limit);
    return rows.map((row, index) => ({
      rank: index + 1,
      author_id: row.author.id,
      full_name: row.author.full_name,
      books_count: row.count,
    }));
  }

  upsertSubscription(
    authorId: number,
    phone: string,
  ): { record: SubscriptionRecord; existed: boolean } {
    const existing = this.subscriptions.find((s) => s.author_id === authorId && s.phone === phone);
    if (existing) {
      return { record: existing, existed: true };
    }
    const record: SubscriptionRecord = {
      id: this.nextSubscriptionId++,
      author_id: authorId,
      phone,
      created_at: new Date().toISOString(),
    };
    this.subscriptions.push(record);
    return { record, existed: false };
  }

  deleteSubscription(id: number): boolean {
    const index = this.subscriptions.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.subscriptions.splice(index, 1);
    return true;
  }
}

export function createMockDb(): MockDb {
  return new MockDb();
}

let singleton: MockDb | undefined;

export function getMockDb(): MockDb {
  if (!singleton) {
    singleton = createMockDb();
  }
  return singleton;
}

export function resetMockDb(): MockDb {
  singleton = createMockDb();
  return singleton;
}
