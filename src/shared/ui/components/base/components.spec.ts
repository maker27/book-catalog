import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import BaseBusy from './BaseBusy.vue';
import BaseButton from './BaseButton.vue';
import BaseCard from './BaseCard.vue';
import BaseInput from './BaseInput.vue';
import BaseSelect from './BaseSelect.vue';
import BaseSkeleton from './BaseSkeleton.vue';

describe('BaseButton', () => {
  test('по умолчанию primary и type="button"', () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Сохранить' } });
    const button = wrapper.get('button');
    expect(button.classes()).toContain('base-button_primary');
    expect(button.attributes('type')).toBe('button');
    expect(button.text()).toBe('Сохранить');
  });

  test('loading блокирует кнопку, ставит aria-busy и спиннер', async () => {
    const wrapper = mount(BaseButton, { props: { loading: true } });
    const button = wrapper.get('button');
    expect(button.attributes('aria-busy')).toBe('true');
    expect(button.attributes('disabled')).toBeDefined();
    expect(wrapper.find('.base-button__spinner').exists()).toBe(true);

    await button.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  test('обычный клик эмитится, disabled — нет', async () => {
    const enabled = mount(BaseButton);
    await enabled.get('button').trigger('click');
    expect(enabled.emitted('click')).toHaveLength(1);

    const disabled = mount(BaseButton, { props: { disabled: true } });
    await disabled.get('button').trigger('click');
    expect(disabled.emitted('click')).toBeUndefined();
  });

  test('с to рендерит ссылку вместо кнопки', () => {
    const wrapper = mount(BaseButton, {
      global: { stubs: { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
      props: { to: '/books/new' },
      slots: { default: 'Добавить книгу' },
    });
    expect(wrapper.find('button').exists()).toBe(false);
    const link = wrapper.get('a');
    expect(link.attributes('href')).toBe('/books/new');
    expect(link.classes()).toContain('base-button');
    expect(link.attributes('type')).toBeUndefined();
  });

  test('варианты secondary и link дают свои модификаторы', () => {
    expect(
      mount(BaseButton, { props: { variant: 'secondary' } })
        .get('button')
        .classes(),
    ).toContain('base-button_secondary');
    expect(
      mount(BaseButton, { props: { variant: 'link' } })
        .get('button')
        .classes(),
    ).toContain('base-button_link');
  });
});

describe('BaseCard', () => {
  test('рендерит слот и меняет тег', () => {
    const wrapper = mount(BaseCard, { props: { tag: 'article' }, slots: { default: 'Книга' } });
    expect(wrapper.element.tagName).toBe('ARTICLE');
    expect(wrapper.text()).toBe('Книга');
  });
});

describe('BaseInput', () => {
  test('связывает label с полем и эмитит update:modelValue', async () => {
    const wrapper = mount(BaseInput, { props: { label: 'Название', modelValue: '' } });
    const input = wrapper.get('input');
    expect(wrapper.get('label').attributes('for')).toBe(input.attributes('id'));

    await input.setValue('Война и мир');
    expect(wrapper.emitted('update:modelValue')).toEqual([['Война и мир']]);
  });

  test('error помечает поле невалидным и связывает описание', () => {
    const wrapper = mount(BaseInput, { props: { error: 'Обязательное поле', label: 'ISBN' } });
    const input = wrapper.get('input');
    expect(input.attributes('aria-invalid')).toBe('true');
    expect(input.classes()).toContain('base-input__control_error');
    expect(input.attributes('aria-describedby')).toBe(
      wrapper.get('.base-input__error').attributes('id'),
    );
    expect(wrapper.get('.base-input__error').text()).toBe('Обязательное поле');
  });

  test('required доходит до поля, а не только до звёздочки', () => {
    const wrapper = mount(BaseInput, { props: { label: 'ISBN', required: true } });
    const input = wrapper.get('input');
    expect(wrapper.find('.base-input__required').exists()).toBe(true);
    expect(input.attributes('required')).toBeDefined();
    expect(input.attributes('aria-required')).toBe('true');
  });

  test('hint скрывается при ошибке, disabled прокидывается', () => {
    const wrapper = mount(BaseInput, { props: { disabled: true, hint: 'Подсказка' } });
    expect(wrapper.get('.base-input__hint').text()).toBe('Подсказка');
    expect(wrapper.get('input').attributes('disabled')).toBeDefined();

    const withError = mount(BaseInput, { props: { error: 'Ошибка', hint: 'Подсказка' } });
    expect(withError.find('.base-input__hint').exists()).toBe(false);
  });
});

describe('BaseSelect', () => {
  test('required доходит до поля, а не только до звёздочки', () => {
    const wrapper = mount(BaseSelect, {
      props: { label: 'Автор', options: [{ label: 'Толстой', value: '1' }], required: true },
    });
    const select = wrapper.get('select');
    expect(wrapper.find('.base-select__required').exists()).toBe(true);
    expect(select.attributes('required')).toBeDefined();
    expect(select.attributes('aria-required')).toBe('true');
  });
});

describe('BaseSkeleton', () => {
  test('плейсхолдер скрыт от скринридера и принимает размеры', () => {
    const wrapper = mount(BaseSkeleton, { props: { height: '200px', width: '50%' } });
    expect(wrapper.attributes('aria-hidden')).toBe('true');
    expect(wrapper.attributes('style')).toContain('height: 200px');
    expect(wrapper.attributes('style')).toContain('width: 50%');
    expect(wrapper.classes()).toContain('base-skeleton_rounded-sm');
  });
});

describe('BaseBusy', () => {
  test('busy включает aria-busy и модификатор, иначе контент активен', async () => {
    const wrapper = mount(BaseBusy, { props: { busy: true }, slots: { default: 'Форма' } });
    expect(wrapper.attributes('aria-busy')).toBe('true');
    expect(wrapper.classes()).toContain('base-busy_active');

    await wrapper.setProps({ busy: false });
    expect(wrapper.attributes('aria-busy')).toBe('false');
    expect(wrapper.classes()).not.toContain('base-busy_active');
  });
});
