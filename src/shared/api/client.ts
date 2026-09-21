import createClient, { type Middleware } from 'openapi-fetch';
import type { paths as LocalPaths } from './openapi/schema-local';
import type { paths } from './openapi/schema';

export interface ApiClientOptions {
  baseUrl: string;
  getToken?: () => string | null | undefined;
  fetch?: (input: Request) => Promise<Response>;
}

function authMiddleware(getToken?: ApiClientOptions['getToken']): Middleware {
  return {
    onRequest({ request }) {
      const token = getToken?.();
      if (token) {
        request.headers.set('Authorization', `Bearer ${token}`);
      }
      return request;
    },
  };
}

export function createApiClient<TPaths extends object>(options: ApiClientOptions) {
  const client = createClient<TPaths>({
    baseUrl: options.baseUrl,
    ...(options.fetch ? { fetch: options.fetch } : {}),
  });
  client.use(authMiddleware(options.getToken));
  return client;
}

export type ApiClient = ReturnType<typeof createApiClient<paths>>;
export type LocalApiClient = ReturnType<typeof createApiClient<LocalPaths>>;
