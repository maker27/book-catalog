import {
  HttpResponse,
  type AsyncResponseResolverReturnType,
  type DefaultBodyType,
  type ResponseResolverReturnType,
} from 'msw';
import { createOpenApiHttp } from 'openapi-msw';
import type { paths } from '../../openapi/schema';
import { withLatency } from '../latency';

export const MOCK_BASE_URL = '*/api/v1';

export const http = createOpenApiHttp<paths>({ baseUrl: MOCK_BASE_URL });

export interface ErrorItem {
  field: string;
  message: string;
}

export interface ErrorBody {
  success: false;
  errors: ErrorItem[];
}

export function errorBody(errors: ErrorItem[]): ErrorBody {
  return { success: false, errors };
}

export function errorResponse(status: number, errors: ErrorItem[]): HttpResponse<ErrorBody> {
  return HttpResponse.json(errorBody(errors), { status });
}

const DEFAULT_BINARY_MIME_TYPE = 'application/octet-stream';

export async function readFileAsDataUrl(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return `data:${file.type || DEFAULT_BINARY_MIME_TYPE};base64,${btoa(binary)}`;
}

export const MOCK_USER = { id: 1, username: 'admin', role: 'user' } as const;
export const MOCK_PASSWORD = 'admin123';
export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function base64UrlEncode(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string): string {
  return atob(value.replace(/-/g, '+').replace(/_/g, '/'));
}

export function issueToken(now: number = Date.now()): { token: string; expires_at: string } {
  const expiresAtMs = now + TOKEN_TTL_MS;
  const header = base64UrlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: MOCK_USER.id,
      username: MOCK_USER.username,
      role: MOCK_USER.role,
      exp: Math.floor(expiresAtMs / 1000),
    }),
  );
  return {
    token: `${header}.${payload}.mock-signature`,
    expires_at: new Date(expiresAtMs).toISOString(),
  };
}

export function requireAuth(request: Request): HttpResponse<ErrorBody> | null {
  const header = request.headers.get('Authorization') ?? '';
  const match = header.match(/^Bearer (.+)$/);
  if (!match) {
    return errorResponse(401, [{ field: 'auth', message: 'Требуется авторизация' }]);
  }

  try {
    const parts = match[1]!.split('.');
    if (parts.length !== 3) throw new Error('bad token');
    const payload = JSON.parse(base64UrlDecode(parts[1]!)) as { exp?: number };
    if (typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) {
      return errorResponse(401, [{ field: 'auth', message: 'Срок действия токена истёк' }]);
    }
  } catch {
    return errorResponse(401, [{ field: 'auth', message: 'Некорректный токен' }]);
  }
  return null;
}

export function parseIntParam(value: string | undefined): number | undefined {
  if (value === undefined || value === '') return;

  const num = Number(value);
  return Number.isInteger(num) ? num : undefined;
}

export interface WithMockOptions {
  isAuthRequired?: boolean;
}

interface MockResolverInfo<ResponseBody extends DefaultBodyType> {
  request: Request;
  response: { untyped: (response: Response) => ResponseResolverReturnType<ResponseBody> };
}

export function withMock<
  ResponseBody extends DefaultBodyType,
  Info extends MockResolverInfo<ResponseBody>,
>(
  resolver: (info: Info) => AsyncResponseResolverReturnType<ResponseBody>,
  options: WithMockOptions = {},
): (info: Info) => AsyncResponseResolverReturnType<ResponseBody> {
  return async (info) => {
    const early = await withLatency();
    if (early) {
      return info.response.untyped(early);
    }

    if (options.isAuthRequired) {
      const unauthorized = requireAuth(info.request);
      if (unauthorized) {
        return info.response.untyped(unauthorized);
      }
    }

    return resolver(info);
  };
}
