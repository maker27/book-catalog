import type { App } from 'vue';

import { API_INJECTION_KEY, createApiClient, type LocalPaths, type paths } from '@/shared/api';
import { useSessionStore } from '@/features/auth';

const DEFAULT_API_BASE = `${import.meta.env.BASE_URL}api/v1`;
const UNAUTHORIZED_STATUS = 401;

export function provideApi(app: App) {
  const session = useSessionStore();
  const baseUrl = import.meta.env.VITE_API_BASE || DEFAULT_API_BASE;
  const getToken = () => session.token;

  const api = createApiClient<paths>({ baseUrl, getToken });
  const localApi = createApiClient<LocalPaths>({ baseUrl, getToken });

  const unauthorizedMiddleware = {
    onResponse({ response }: { response: Response }) {
      if (response.status === UNAUTHORIZED_STATUS && session.isAuthenticated) {
        session.logout();
      }
      return response;
    },
  };

  api.use(unauthorizedMiddleware);
  localApi.use(unauthorizedMiddleware);

  app.provide(API_INJECTION_KEY, { api, localApi });
}
