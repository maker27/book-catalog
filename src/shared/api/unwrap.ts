import type { ApiErrorItem } from '@/shared/api';

export const UNKNOWN_ERROR_MESSAGE = 'Неизвестная ошибка API';
export const NOT_FOUND_STATUS = 404;

export class ApiRequestError extends Error {
  readonly errors: ApiErrorItem[];
  readonly status: number;

  constructor(status: number, errors: ApiErrorItem[]) {
    super(errors[0]?.message ?? UNKNOWN_ERROR_MESSAGE);
    this.name = 'ApiRequestError';
    this.errors = errors;
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function extractApiErrors(error: unknown): ApiErrorItem[] {
  if (!isRecord(error) || !Array.isArray(error.errors)) {
    return [];
  }
  const items: ApiErrorItem[] = [];
  for (const item of error.errors) {
    if (!isRecord(item)) {
      continue;
    }
    items.push({
      ...(typeof item.field === 'string' ? { field: item.field } : {}),
      ...(typeof item.message === 'string' ? { message: item.message } : {}),
    });
  }
  return items;
}

export interface ApiResult<TPayload> {
  data?: { data?: TPayload } | undefined;
  error?: unknown;
  response: Response;
}

export function unwrapResponse<TPayload>(result: ApiResult<TPayload>): TPayload {
  if (result.error !== undefined || !result.response.ok) {
    throw new ApiRequestError(result.response.status, extractApiErrors(result.error));
  }
  const payload = result.data?.data;
  if (payload === undefined) {
    throw new ApiRequestError(result.response.status, []);
  }
  return payload;
}
