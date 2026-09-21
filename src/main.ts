import { createApp } from 'vue';
import { createPinia } from 'pinia';

import '@/app/styles';
import App from '@/app/App.vue';
import router from '@/app/router';
import { provideApi } from '@/app/api';
import { getApiMode } from '@/shared/lib';

const { isMock, mockMode } = getApiMode();

if (isMock) {
  const { startMockWorker } = await import('@/shared/api/mocks/browser');
  await startMockWorker(mockMode);
}

const app = createApp(App);

app.use(createPinia());
app.use(router);
provideApi(app);

app.mount('#app');
