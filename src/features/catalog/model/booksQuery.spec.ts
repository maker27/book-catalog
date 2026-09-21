import { describe, expect, test } from 'vitest';
import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  filtersToApiQuery,
  filtersToRouteQuery,
  parseBooksFilters,
} from './booksQuery';

describe('parseBooksFilters', () => {
  test('пустая query даёт дефолтные фильтры', () => {
    expect(parseBooksFilters({})).toEqual({
      authorId: null,
      page: DEFAULT_PAGE,
      search: '',
      year: null,
    });
  });

  test('читает все параметры и отбрасывает мусор', () => {
    expect(
      parseBooksFilters({ author_id: '3', page: '2', search: '  Толстой ', year: '2024' }),
    ).toEqual({
      authorId: 3,
      page: 2,
      search: 'Толстой',
      year: 2024,
    });
    expect(parseBooksFilters({ author_id: 'abc', page: '0', year: '-1' })).toEqual({
      authorId: null,
      page: DEFAULT_PAGE,
      search: '',
      year: null,
    });
  });
});

describe('filtersToRouteQuery', () => {
  test('не пишет дефолтные и пустые значения', () => {
    expect(
      filtersToRouteQuery({ authorId: null, page: DEFAULT_PAGE, search: '', year: null }),
    ).toEqual({});
  });

  test('сериализует заданные фильтры', () => {
    expect(filtersToRouteQuery({ authorId: 3, page: 2, search: 'Война', year: 2024 })).toEqual({
      author_id: '3',
      page: '2',
      search: 'Война',
      year: '2024',
    });
  });
});

describe('filtersToApiQuery', () => {
  test('использует контрактное имя per-page и опускает пустые фильтры', () => {
    expect(filtersToApiQuery({ authorId: null, page: 3, search: '', year: null })).toEqual({
      page: 3,
      'per-page': DEFAULT_PER_PAGE,
    });
    expect(filtersToApiQuery({ authorId: 1, page: 1, search: 'Мир', year: 2023 }, 5)).toEqual({
      author_id: 1,
      page: 1,
      'per-page': 5,
      search: 'Мир',
      year: 2023,
    });
  });
});
