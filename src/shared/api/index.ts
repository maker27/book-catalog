import type { components as LocalComponents } from './openapi/schema-local';
import type { components } from './openapi/schema';

export * from './client';
export * from './useApi';
export * from './unwrap';
export type { paths } from './openapi/schema';
export type { paths as LocalPaths } from './openapi/schema-local';

export type Book = components['schemas']['Book'];
export type BookShort = components['schemas']['BookShort'];
export type BookInput = components['schemas']['BookInput'];
export type Author = components['schemas']['Author'];
export type AuthorShort = components['schemas']['AuthorShort'];
export type AuthorInput = components['schemas']['AuthorInput'];
export type TopAuthor = components['schemas']['TopAuthor'];
export type Pagination = components['schemas']['Pagination'];
export type ApiError = components['schemas']['Error'];
export type ApiErrorItem = components['schemas']['ErrorItem'];
export type LoginResponse = components['schemas']['LoginResponse'];

export type Subscription = LocalComponents['schemas']['Subscription'];
export type SubscriptionInput = LocalComponents['schemas']['SubscriptionInput'];
