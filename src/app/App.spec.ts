import { describe, expect, test } from 'vitest';
import { createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import App from '@/app/App.vue';
import router from '@/app/router';

describe('App', () => {
  test('монтируется корректно с провайдерами', () => {
    const pinia = createPinia();
    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router],
        stubs: {
          RouterView: true,
        },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
