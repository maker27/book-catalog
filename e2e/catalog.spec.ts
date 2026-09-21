import { expect, test } from '@playwright/test';

test('открывает каталог книг', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Каталог книг');
  await expect(page.locator('.book-card').first()).toBeVisible();
});

test('переходит с карточки книги на страницу книги', async ({ page }) => {
  await page.goto('/books');

  const firstTitle = page.locator('.book-card__title-link').first();
  const title = await firstTitle.innerText();
  await firstTitle.click();

  await expect(page).toHaveURL(/\/books\/\d+$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
});

test('открывает отчёт по авторам', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Отчёт' }).click();

  await expect(page).toHaveURL(/\/top-authors/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'ТОП-10 авторов по количеству книг',
  );
});
