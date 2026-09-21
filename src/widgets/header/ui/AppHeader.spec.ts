import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import { beforeEach, describe, expect, test } from 'vitest';
import AppHeader from './AppHeader.vue';
import { useSessionStore } from '@/features/auth';

const HOUR_MS = 60 * 60 * 1000;

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/books', component: { template: '<div />' } },
      { path: '/authors', component: { template: '<div />' } },
      { path: '/top-authors', component: { template: '<div />' } },
      { path: '/login', component: { template: '<div />' } },
    ],
  });
}

async function mountHeader() {
  const router = createTestRouter();
  router.push('/books');
  await router.isReady();
  const wrapper = mount(AppHeader, { global: { plugins: [router] } });
  return { router, wrapper };
}

beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.clear();
});

describe('AppHeader', () => {
  test('гость видит кнопку "Войти"', async () => {
    const { wrapper } = await mountHeader();
    expect(wrapper.text()).toContain('Войти');
    expect(wrapper.text()).not.toContain('Выйти');
  });

  test('авторизованный пользователь видит имя и кнопку "Выйти"', async () => {
    const session = useSessionStore();
    session.setSession({
      expiresAt: new Date(Date.now() + HOUR_MS).toISOString(),
      token: 'test-token',
      user: { id: 1, username: 'admin', role: 'user' },
    });

    const { wrapper } = await mountHeader();
    expect(wrapper.text()).toContain('admin');
    expect(wrapper.text()).toContain('Выйти');
    expect(wrapper.text()).not.toContain('Войти');
  });

  test('клик по "Выйти" очищает сессию', async () => {
    const session = useSessionStore();
    session.setSession({
      expiresAt: new Date(Date.now() + HOUR_MS).toISOString(),
      token: 'test-token',
      user: { id: 1, username: 'admin', role: 'user' },
    });

    const { wrapper } = await mountHeader();
    await wrapper.get('button').trigger('click');

    expect(session.isAuthenticated).toBe(false);
  });
});
