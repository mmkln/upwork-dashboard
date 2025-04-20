# План рефакторингу фронтенду

Цей файл містить покроковий план для міграції існуючого React-проєкту до нової архітектури без овер-інжинірингу.

---

## 1. Створити скелет структури

- [x] Створити папки:
  - `src/api/`
  - `src/context/`
  - `src/hooks/`
  - `src/models/`
  - `src/features/jobs/components/`
  - `src/features/jobs/hooks/`
  - `src/features/jobs/services/`
  - `src/features/analytics/charts/`
  - `src/features/analytics/hooks/`
  - `src/features/analytics/services/`
  - `src/features/public/components/`
  - `src/features/public/hooks/`
  - `src/features/public/services/`
  - `src/features/blog/components/`
  - `src/features/blog/hooks/`
  - `src/features/blog/services/`
  - `src/pages/`

- [x] Створити базові файли:
  - `src/api/index.ts` (axios/fetch клієнт + точки доступу)
  - `src/context/AuthContext.tsx`
  - `src/hooks/useJobs.ts`, `useTags.ts`, `useAnalytics.ts`, `useAuth.ts`
  - `src/models/job.ts`, `user.ts`, `blog.ts`
  - `src/pages/JobsPage.tsx`, `AnalyticsPage.tsx`, `PublicAnalyticsPage.tsx`, `BlogListPage.tsx`, `BlogPostPage.tsx`, `LoginPage.tsx`
  - `src/App.tsx` (новий роутинг + Layouts)
  - `.env` з `REACT_APP_API_URL`

## 2. Налаштування залежностей

- [x] Додати у `package.json`:
  - `react-query` (або `swr`)
  - `axios`
  - (за потреби) `mdx`/`react-markdown`

- [x] Налаштувати Tailwind, ESLint, Prettier, Husky для однотипності коду.

## 3. Міграція існуючого коду

- [x] Перенести `models`/інтерфейси з `src/models/`.
- [x] Звести `services/apiService.ts` в `src/api/index.ts`.
- [x] Винести fetch-логіку в hooks (`useJobs`, `usePublicStats`, `useBlogPosts`).
- [x] Розбити великий `JobList` на презентаційні блоки (`FiltersPanel`, `CopyExportControls`).
- [x] Розбити `Dashboard` на презентаційні компоненти (`DashboardFiltersPanel`, `StatsPanel`).
- [x] Реалізувати `BaseChart` та конкретні чарти у `features/analytics/charts`.
- [x] Оновити `App.tsx` з новими маршрутами та Layout.

## 4. Налаштування Auth

- [x] Реалізувати `AuthContext` та `useAuth`.
- [x] Додати `ProtectedRoute` для захищених сторінок.

## 5. Тестування й перевірка

- [ ] Запустити локально, перевірити: логін, завантаження списку вакансій, публічну сторінку, блог.
- [ ] Перевірити базову поведінку React Query (loading/error).

## 6. Завершальні кроки

- [ ] Видалити застарілі файли/папки з кореня.
- [ ] Оновити README з новою структурою.
- [ ] Зафіксувати ADR з остаточним рішенням.
