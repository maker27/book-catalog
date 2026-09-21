import type { LocationQuery, LocationQueryValue } from 'vue-router';

type QueryValue = LocationQueryValue | LocationQueryValue[] | undefined;

export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 12;

export interface BooksFilters {
  authorId: number | null;
  page: number;
  search: string;
  year: number | null;
}

export interface BooksApiQuery {
  author_id?: number;
  page: number;
  'per-page': number;
  search?: string;
  year?: number;
}

function readString(value: QueryValue): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}

function readPositiveInt(value: QueryValue): number | null {
  const raw = readString(value);
  if (!/^\d+$/.test(raw)) {
    return null;
  }
  const parsed = Number(raw);
  return parsed > 0 ? parsed : null;
}

export function parseBooksFilters(query: LocationQuery): BooksFilters {
  return {
    authorId: readPositiveInt(query.author_id),
    page: readPositiveInt(query.page) ?? DEFAULT_PAGE,
    search: readString(query.search).trim(),
    year: readPositiveInt(query.year),
  };
}

export function filtersToRouteQuery(filters: BooksFilters): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.authorId !== null) {
    query.author_id = String(filters.authorId);
  }
  if (filters.page !== DEFAULT_PAGE) {
    query.page = String(filters.page);
  }
  if (filters.search) {
    query.search = filters.search;
  }
  if (filters.year !== null) {
    query.year = String(filters.year);
  }
  return query;
}

export function filtersToApiQuery(
  filters: BooksFilters,
  perPage: number = DEFAULT_PER_PAGE,
): BooksApiQuery {
  const query: BooksApiQuery = { page: filters.page, 'per-page': perPage };
  if (filters.authorId !== null) {
    query.author_id = filters.authorId;
  }
  if (filters.search) {
    query.search = filters.search;
  }
  if (filters.year !== null) {
    query.year = filters.year;
  }
  return query;
}
