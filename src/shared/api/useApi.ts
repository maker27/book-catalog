import { inject, type InjectionKey } from 'vue';

import type { ApiClient, LocalApiClient } from './client';

export interface ApiClients {
  api: ApiClient;
  localApi: LocalApiClient;
}

export const API_INJECTION_KEY: InjectionKey<ApiClients> = Symbol('api');

export function useApi(): ApiClients {
  const clients = inject(API_INJECTION_KEY);
  if (!clients) {
    throw new Error('API clients are not provided. Call provideApi(app) before mounting.');
  }
  return clients;
}
