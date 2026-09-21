import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import type { Book } from '@/shared/api';
import BooksList from './BooksList.vue';

const bookWithoutCover: Book = {
  id: 1,
  title: 'Pride and Prejudice',
  year: 1813,
  cover_url: '',
  authors: [],
};

const bookWithCover: Book = {
  id: 2,
  title: 'Emma',
  year: 1815,
  cover_url: 'https://example.com/emma.jpg',
  authors: [],
};

const books: Book[] = [bookWithoutCover, bookWithCover];

const global = {
  stubs: { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } },
};

describe('BooksList', () => {
  test('рендерит карточку с обложкой для каждой книги', () => {
    const wrapper = mount(BooksList, { global, props: { books } });
    expect(wrapper.findAll('.books-list > li')).toHaveLength(books.length);
    expect(wrapper.findAll('.book-card__cover')).toHaveLength(books.length);
  });

  test('книга без обложки получает плейсхолдер', () => {
    const wrapper = mount(BooksList, { global, props: { books: [bookWithoutCover] } });
    expect(wrapper.get('.book-card__cover').attributes('src')).toBeTruthy();
  });

  test('isPending показывает скелетон вместо списка', () => {
    const wrapper = mount(BooksList, { global, props: { books: [], isPending: true } });
    expect(wrapper.find('.catalog-skeleton').exists()).toBe(true);
    expect(wrapper.find('.books-list').exists()).toBe(false);
  });

  test('пустой список рендерит слот empty', () => {
    const wrapper = mount(BooksList, {
      global,
      props: { books: [] },
      slots: { empty: '<p class="custom-empty">Ничего не найдено</p>' },
    });
    expect(wrapper.get('.custom-empty').text()).toBe('Ничего не найдено');
    expect(wrapper.find('.books-list').exists()).toBe(false);
  });
});
