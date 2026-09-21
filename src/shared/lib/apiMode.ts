const MOCK_MODE = 'mock';
const NORMAL_MODE = 'normal';

export function getApiMode() {
  const apiBase = import.meta.env.VITE_API_BASE;
  const explicitMode = import.meta.env.VITE_API_MODE;
  const subscriptionsEnabled = import.meta.env.VITE_SUBSCRIPTIONS_ENABLED;
  const mockMode = import.meta.env.VITE_MOCK_MODE;

  const apiMode = explicitMode || (apiBase ? NORMAL_MODE : MOCK_MODE);
  const isMock = apiMode === MOCK_MODE;

  return {
    isMock,
    mockMode,
    isSubscriptionsEnabled: subscriptionsEnabled ? subscriptionsEnabled === 'true' : isMock,
  };
}
