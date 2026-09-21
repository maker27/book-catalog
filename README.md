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

Раскладка по FSD: `src/app`, `src/pages`, `src/widgets`, `src/features`, `src/entities`,
`src/shared`.

- `entities` — доменные модели: форма и запросы книги (`entities/book/model`), справочник
  и форма автора (`entities/author/model`), карточки `BookCard` и `AuthorCard`.
- `features` — вход и сессия (`features/auth`), общая форма книги для создания
  и редактирования (`features/book-form`).
- `pages` — страницы-композиции; состояние фильтров каталога лежит рядом со страницей
  в `pages/books/model`.
- `widgets` — шапка, подвал, список книг.
- `shared` — API-клиент и моки MSW (`src/shared/api`, моки в `src/shared/api/mocks`),
  дизайн-система (`src/shared/ui`), токены (`src/shared/config/theme`), общие утилиты
  и валидаторы (`src/shared/lib`).

Типы и клиент генерируются из OpenAPI. Основной контракт — `book.yaml` в корне репозитория.
Эндпоинтов подписки в нём нет — фича живёт на локально пропатченной копии
`src/shared/api/openapi/book.local.yaml` (черновик контракта, который со временем должен
попасть в `book.yaml`, см. `src/shared/api/openapi/README.md`) и закрыта флагом
`VITE_SUBSCRIPTIONS_ENABLED`. Расхождение сгенерированных типов с контрактом видно
на `pnpm type-check`.

Фильтры каталога, номер страницы и год отчёта хранятся в URL, чтобы ссылку можно было
переслать. Сессия — в localStorage. Стили на БЭМ + SCSS, цвета и отступы только через токены.
