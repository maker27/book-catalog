import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { configureLatency } from './latency';

export async function startMockWorker(mode: string | undefined) {
  configureLatency(mode);
  const worker = setupWorker(...handlers);
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    quiet: true,
  });
  return worker;
}
