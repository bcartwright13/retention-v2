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
- Vite 8 (`/api` requests proxied to `http://localhost:3001` — see `vite.config.ts`)
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
│   ├── layout/     # AppShell, Header, BottomNav, Container, AuthGuard, ThemeToggle
│   ├── cards/      # CardContent (card body rendering)
│   └── stats/      # StreakWidget
├── stores/         # Zustand stores: authStore, cardStore, toastStore, themeStore, streakStore
├── hooks/          # useAuth, useCards, useDueCards (thin wrappers over stores)
├── lib/            # api.ts, mocks.ts, scheduler.ts, cn.ts, highlight.tsx
├── types/          # card.ts, user.ts, api.ts (shared shapes mirroring root CLAUDE.md data model)
└── styles/         # typography.css
```

### Routing

`/login` is public. All other routes nest under `AuthGuard` (redirects to `/login` when unauthenticated) and `AppShell` (header + bottom nav layout): `/` (library), `/study`, `/cards/new`, `/cards/:id/edit`. `CardFormPage` handles both create and edit.

### Mock mode (current state — no real backend calls yet)

The app currently runs entirely on mock data:

- `src/lib/mocks.ts` exports `mockApi`, an in-memory implementation of the full API (cards CRUD, due cards, review scheduling, user).
- Stores call `mockApi` directly; each call site has a `// TODO: Replace with api...` comment naming the real endpoint to swap in.
- `src/lib/api.ts` is a ready-to-use fetch client (`api.get/post/put/patch/del`) that sends `credentials: 'include'` and throws typed `ApiError` — use it when wiring the real backend.
- Auth is simulated: `authStore` gates on a `recall_authenticated` sessionStorage flag; "login" just loads the mock user.

When connecting the real server, replace the `mockApi` calls in the stores rather than changing components — components only talk to stores/hooks.

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
