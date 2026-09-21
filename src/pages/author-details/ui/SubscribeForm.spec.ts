import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, type Mock, test, vi } from 'vitest';

import { API_INJECTION_KEY } from '@/shared/api';
import SubscribeForm from './SubscribeForm.vue';

const AUTHOR_ID = 1;
const VALID_PHONE = '+79991234567';
const INVALID_PHONE = '8999123';
const SUCCESS_MESSAGE = 'Готово! Мы пришлём SMS, когда у автора выйдет новая книга.';
const DIRTY_PHONE = '+7123456789000-----уыввывы';
const CLEANED_PHONE = '+71234567890';

type SubscribePost = (
  path: string,
  init: { body: { author_id: number; phone: string } },
) => Promise<{ error: unknown }>;

function mountForm(post: Mock<SubscribePost> = vi.fn<SubscribePost>()) {
  const wrapper = mount(SubscribeForm, {
    global: { provide: { [API_INJECTION_KEY]: { localApi: { POST: post } } } },
    props: { authorId: AUTHOR_ID },
  });
  return wrapper;
}

describe('SubscribeForm', () => {
  test('невалидный телефон показывает ошибку поля и не отправляет запрос', async () => {
    const post = vi.fn<SubscribePost>();
    const wrapper = mountForm(post);
    await wrapper.get('input').setValue(INVALID_PHONE);
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('Телефон в формате +7XXXXXXXXXX');
    expect(post).not.toHaveBeenCalled();
  });

  test('поле очищает посторонние символы и лишние цифры при вводе', async () => {
    const wrapper = mountForm();
    const input = wrapper.get('input');
    await input.setValue(DIRTY_PHONE);

    expect(input.element.value).toBe(CLEANED_PHONE);
  });

  test('валидный телефон отправляет POST /subscriptions и показывает сообщение об успехе', async () => {
    const post = vi.fn<SubscribePost>().mockResolvedValue({ error: undefined });
    const wrapper = mountForm(post);
    await wrapper.get('input').setValue(VALID_PHONE);
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(post).toHaveBeenCalledWith('/subscriptions', {
      body: { author_id: AUTHOR_ID, phone: VALID_PHONE },
    });
    expect(wrapper.text()).toContain(SUCCESS_MESSAGE);
    expect(wrapper.get('input').element.value).toBe('');
  });
});
