# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Type-check (tsc -b) and build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

There are no tests yet.

## Stack

- React 19 + TypeScript
- Vite 8 (`/api` requests proxied to `http://localhost:3001` — see `vite.config.ts`; `build.sourcemap` is explicitly `false` to avoid leaking source paths in production)
- Tailwind CSS v4 (via `@tailwindcss/vite`; design tokens in `@theme` in `src/index.css`)
- React Router 7 (`react-router-dom`)
- Zustand 5 (state management)
- `clsx` via the `cn()` helper in `src/lib/cn.ts` for conditional classes

## Architecture

```
src/
├── pages/          # Route components: LoginPage, LibraryPage, StudyPage, CardFormPage
├── components/
│   ├── ui/         # Design-system primitives: Button, Badge, CardSurface, Input,
│   │               #   Textarea, Modal, Toast, Spinner, EmptyState, Rule,
│   │               #   LevelIndicator, StatLine
│   ├── layout/     # AppShell, Header, BottomNav, Container, AuthGuard,
│   │               #   ErrorBoundary, ThemeToggle
│   ├── cards/      # CardContent (card body rendering)
│   └── stats/      # StreakWidget
├── stores/         # Zustand stores: authStore, cardStore, toastStore, themeStore, streakStore
├── hooks/          # useAuth, useCards, useDueCards (thin wrappers over stores)
├── lib/            # api.ts, scheduler.ts, cn.ts, highlight.tsx
├── types/          # card.ts, user.ts, api.ts (shared shapes mirroring root CLAUDE.md data model)
├── test/           # mocks.ts — fixture data (mockUser, mockCards, mockApi); not currently
│                   #   imported by app code or any test (no test runner is configured yet)
└── styles/         # typography.css
```

### Routing

`/login` is public. All other routes nest under `AuthGuard` (redirects to `/login` when unauthenticated), an `ErrorBoundary`, and `AppShell` (header + bottom nav layout): `/` (library), `/study`, `/cards/new`, `/cards/:id/edit`. `CardFormPage` handles both create and edit. A `<ToastContainer />` is mounted at the top level, outside the router.

### Talking to the server

The app calls the real backend — there is no mock mode anymore:

- `src/lib/api.ts` is the fetch client (`api.get/post/put/patch/del`). Every request sends `credentials: 'include'` and an `X-Requested-With: fetch` header (required by the server's CSRF check — don't drop it when adding new calls). Error bodies are mapped through a `SAFE_MESSAGES` table keyed by status code (400/401/403/404) so raw server error text isn't shown to users; unmapped errors fall back to `body.message` or a generic message.
- `authStore` calls `GET /api/auth/me` to check session, redirects to `/api/auth/google` (with a same-origin-only `returnTo` guard against open-redirect payloads) to log in, and `POST /api/auth/logout` to log out.
- `cardStore` calls the full cards API (`GET/POST /api/users/:userId/cards`, `GET .../due`, `PUT/DELETE .../:id`, `PATCH .../:id/review`), reading `userId` from `useAuthStore.getState().user?.id`.
- `src/test/mocks.ts` still holds an in-memory `mockApi` fixture from the earlier mock-data phase, but nothing imports it today — treat it as inert unless/until a test suite is added.

### Scheduling display helpers

`src/lib/scheduler.ts` contains display-only helpers (`getIntervalHint`, `formatRelativeDate`) mirroring the retention engine in the root CLAUDE.md. The server is the source of truth for actual level/interval updates; the client only previews intervals on the study buttons.

## Design system

Editorial "paper & ink" aesthetic — defined entirely as CSS variables in `src/index.css`:

- **Palette:** `paper`/`ink`/`rule` neutrals, `ochre` as the single accent, plus four muted assessment colors (`forgot`, `struggled`, `gotit`, `mastered`), each with a `-soft` variant.
- **Legacy aliases:** older semantic names (`surface`, `border`, `text`, `primary-*`) are aliased onto the editorial palette — prefer the editorial names in new code.
- **Dark theme:** applied at runtime via `[data-theme="dark"]` on `<html>`, managed by `themeStore` (light/dark/system preference persisted to localStorage as `recall-theme`). Because Tailwind v4 resolves `@theme` vars at build time, any aliased color must be explicitly redeclared inside the `[data-theme="dark"]` block or utilities won't pick up the dark value.
- **Typography:** Fraunces (serif/display), Inter Tight (sans), JetBrains Mono — see `src/styles/typography.css`.
- **Geometry:** minimal radii, near-zero shadows (hairline `rule` lines instead of elevation).

Use existing `components/ui` primitives before adding new ones, and style with the token classes (e.g. `bg-paper`, `text-ink-muted`, `border-rule`) rather than raw hex values.
