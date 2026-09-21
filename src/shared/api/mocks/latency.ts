import { HttpResponse } from 'msw';
import type { ErrorBody } from './handlers/helpers';

export type MockMode = 'normal' | 'slow' | 'with_errors';

export const MOCK_MODES: readonly MockMode[] = ['normal', 'slow', 'with_errors'];

export const DEFAULT_MOCK_MODE: MockMode = 'normal';

export const LATENCY_RANGES: Record<MockMode, readonly [number, number]> = {
  normal: [150, 300],
  slow: [1000, 2000],
  with_errors: [200, 200],
};

export const MOCK_ERROR_RATE = 0.3;

interface LatencyState {
  mode: MockMode;
}

const state: LatencyState = {
  mode: DEFAULT_MOCK_MODE,
};

function isMockMode(mode: string | undefined): mode is MockMode {
  return MOCK_MODES.some((known) => known === mode);
}

export function configureLatency(mode: string | undefined) {
  state.mode = isMockMode(mode) ? mode : DEFAULT_MOCK_MODE;
}

export function getLatencyMode(): MockMode {
  return state.mode;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withLatency(): Promise<HttpResponse<ErrorBody> | undefined> {
  const [min, max] = LATENCY_RANGES[state.mode];
  const delay = min === max ? min : min + Math.round(Math.random() * (max - min));
  await sleep(delay);
  if (state.mode === 'with_errors' && Math.random() < MOCK_ERROR_RATE) {
    return HttpResponse.json(
      {
        success: false,
        errors: [{ field: 'server', message: 'Внутренняя ошибка сервера (режим with_errors)' }],
      },
      { status: 500 },
    );
  }
  return;
}
