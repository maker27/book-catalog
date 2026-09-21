import type { HttpHandler } from 'msw';
import { authHandlers } from './auth';
import { authorHandlers } from './authors';
import { bookHandlers } from './books';
import { reportHandlers } from './report';
import { subscriptionHandlers } from './subscriptions';

export const handlers: HttpHandler[] = [
  ...authHandlers,
  ...bookHandlers,
  ...authorHandlers,
  ...reportHandlers,
  ...subscriptionHandlers,
];
