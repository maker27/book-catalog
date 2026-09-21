const COVERS_BASE_PATH = `${import.meta.env.BASE_URL}covers`;
const AUTHORS_BASE_PATH = `${import.meta.env.BASE_URL}authors`;
const PLACEHOLDER_FILE_NAME = 'placeholder.svg';

export const PLACEHOLDER_COVER_URL = `${COVERS_BASE_PATH}/${PLACEHOLDER_FILE_NAME}`;
export const PLACEHOLDER_PHOTO_URL = `${AUTHORS_BASE_PATH}/${PLACEHOLDER_FILE_NAME}`;

export function getCoverUrl(isbn: string): string {
  return `${COVERS_BASE_PATH}/${isbn}.jpg`;
}

export function getAuthorPhotoUrl(id: number | undefined): string {
  return id === undefined ? PLACEHOLDER_PHOTO_URL : `${AUTHORS_BASE_PATH}/${id}.jpg`;
}

function replaceWithPlaceholder(event: Event, placeholderUrl: string) {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || image.src.endsWith(placeholderUrl)) {
    return;
  }

  image.src = placeholderUrl;
}

export function handleCoverError(event: Event) {
  replaceWithPlaceholder(event, PLACEHOLDER_COVER_URL);
}

export function handlePhotoError(event: Event) {
  replaceWithPlaceholder(event, PLACEHOLDER_PHOTO_URL);
}
