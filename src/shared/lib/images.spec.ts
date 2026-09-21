import { describe, expect, test } from 'vitest';

import {
  getAuthorPhotoUrl,
  getCoverUrl,
  handleCoverError,
  handlePhotoError,
  PLACEHOLDER_COVER_URL,
  PLACEHOLDER_PHOTO_URL,
} from './images';

describe('getCoverUrl', () => {
  test('строит путь к обложке по ISBN', () => {
    expect(getCoverUrl('9780451524935')).toBe('/covers/9780451524935.jpg');
  });
});

describe('getAuthorPhotoUrl', () => {
  test('строит путь к фото по идентификатору автора', () => {
    expect(getAuthorPhotoUrl(7)).toBe('/authors/7.jpg');
  });

  test('возвращает заглушку без идентификатора', () => {
    expect(getAuthorPhotoUrl(undefined)).toBe(PLACEHOLDER_PHOTO_URL);
  });
});

function emitImageError(src: string, handler: (event: Event) => void): HTMLImageElement {
  const image = document.createElement('img');
  image.src = src;
  image.addEventListener('error', handler);
  image.dispatchEvent(new Event('error'));
  return image;
}

describe('handlePhotoError', () => {
  test('подменяет недоступное фото заглушкой', () => {
    const image = emitImageError('/authors/99.jpg', handlePhotoError);

    expect(image.src).toContain(PLACEHOLDER_PHOTO_URL);
  });

  test('не зацикливается на заглушке', () => {
    const image = emitImageError(PLACEHOLDER_PHOTO_URL, handlePhotoError);

    expect(image.src).toContain(PLACEHOLDER_PHOTO_URL);
  });
});

describe('handleCoverError', () => {
  test('подменяет недоступную обложку заглушкой', () => {
    const image = emitImageError('/covers/0000000000000.jpg', handleCoverError);

    expect(image.src).toContain(PLACEHOLDER_COVER_URL);
  });
});
