# Каталог книг

SPA на Vue 3 + TypeScript + Vite: каталог книг и авторов, вход по паролю, отчёт ТОП-10
авторов за год, подписка на новые книги автора.

Бэкенд не нужен — по умолчанию запросы перехватывает MSW, данные лежат в памяти.

## Запуск

Нужны Node 22+ и pnpm 11+ (`corepack enable`).

```bash
pnpm install
pnpm dev
```

Откроется http://localhost:5173. Логин для демо — `admin` / `admin123`.

Прод-сборка: `pnpm build`, посмотреть результат — `pnpm preview`.

## Настройки

Всё через `.env`, шаблон рядом — `.env.example`.

- `VITE_API_MODE` — `mock` (по умолчанию) или `real`.
- `VITE_API_BASE` — база реального API, по умолчанию `/api/v1`.
- `VITE_MOCK_MODE` — `normal`, `slow` (задержки 1–2 с) или `with_errors` (30% ответов падают
  с 500). Удобно для проверки лоадеров и ошибок.
- `VITE_SUBSCRIPTIONS_ENABLED` — фиче-флаг подписок. Если пусто, включается только в моках.

С реальным сервером:

```bash
VITE_API_MODE=real VITE_API_BASE=https://example.com/api/v1 pnpm dev
```

## Команды

`pnpm type-check`, `pnpm lint`, `pnpm format`, `pnpm test:unit`, `pnpm test:e2e`.

Перед первым e2e-прогоном: `pnpm exec playwright install chromium`.

## Как устроено

Раскладка по FSD: `app`, `pages`, `widgets`, `features`, `entities`, `shared`, плюс `ui` с дизайн-системой. Моки — в `mocks/`, e2e — в `e2e/`.

Типы и клиент генерируются из OpenAPI (`contracts/`), поэтому расхождение с контрактом видно на `pnpm type-check`. Эндпоинтов подписки в `book.yaml` нет — фича живёт на локально пропатченной копии `book.local.yaml` и закрыта флагом, предложение для владельца API лежит в `contracts/proposals/subscriptions.md`.

Фильтры каталога, номер страницы и год отчёта хранятся в URL, чтобы ссылку можно было переслать. Сессия — в localStorage. Стили на БЭМ + SCSS, цвета и отступы только через токены.
