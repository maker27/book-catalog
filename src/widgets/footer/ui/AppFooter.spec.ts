import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import AppFooter from './AppFooter.vue';

describe('AppFooter', () => {
  test('отображает копирайт с текущим годом', () => {
    const wrapper = mount(AppFooter);
    const currentYear = new Date().getFullYear();
    expect(wrapper.text()).toContain(String(currentYear));
    expect(wrapper.text()).toContain('Каталог книг');
  });
});
