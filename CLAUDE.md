# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Recall** — a minimalist spaced repetition system (SRS) for "lifestyle learning" (vocab, code snippets, quotes, etc.). One card = one idea.

## Project Structure

```
retention-v2/
├── client/    # React 19 + TypeScript frontend (Vite)
├── server/    # Node.js + TypeScript backend (Express)
└── spec.md    # Original product spec (source of truth for requirements)
```

See `client/CLAUDE.md` and `server/CLAUDE.md` for stack-specific commands and conventions.

## Running Locally

The full stack has three pieces; bring them up in order:

```bash
# 1. Postgres (auto-runs server/migrations/*.sql on first boot)
cd server/docker && docker compose up -d

# 2. Server (http://localhost:3001) — needs server/.env (see server/CLAUDE.md)
cd server && npm run dev

# 3. Client (http://localhost:5173) — Vite proxies /api → :3001
cd client && npm run dev
```

## Tech Stack

- **Frontend:** React 19 + TypeScript, Tailwind CSS, Zustand or React Context
- **Backend:** Node.js + TypeScript (Express.js)
- **Database:** PostgreSQL
- **Auth:** OAuth 2.0 (Google Sign-In) → JWT issued as HTTP-only cookie
- **Platform:** Responsive web / PWA (mobile-first)

## Data Model

```typescript
interface User {
  id: string;        // UUID
  email: string;
  displayName: string;
  createdAt: Date;
}

interface Card {
  id: string;
  userId: string;    // FK -> User.id
  title: string;     // Front of card
  category: string;
  content: string;   // Back of card
  level: number;     // 0–5 (scheduling bucket)
  nextReview: Date;
  lastReviewed: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Retention Engine (Scheduler Logic)

Linear multiplier algorithm based on self-assessment:

| Performance | Level Shift      | Interval |
|-------------|------------------|----------|
| Forgot      | Reset to 0       | 1 day    |
| Struggled   | No change        | 3 days   |
| Got it!     | Level + 1        | Level-based (see below) |
| Mastered    | Level + 2 (max 5)| 30 days  |

Level-to-interval for "Got it!": 0→1d, 1→3d, 2→7d, 3→14d, 4→21d, 5→30d

## API Shape

All endpoints scoped to authenticated user; `userId` derived from session, not client input.

```
GET    /api/users/:userId/cards
GET    /api/users/:userId/cards/due
POST   /api/users/:userId/cards
PUT    /api/users/:userId/cards/:id
PATCH  /api/users/:userId/cards/:id/review
DELETE /api/users/:userId/cards/:id
```

## Study UI Flow

Retention Area: fetch cards where `nextReview <= now` → show Title/Category → "Show Answer" → reveal Content → user picks Forgot / Struggled / Got it! / Mastered → update level + nextReview.

Empty state: show "You're all caught up!" with total card count and next upcoming review date.

## Cross-cutting Architecture

A few things span both `client/` and `server/` and are easy to miss:

- **Auth chain (server):** `authenticate` middleware reads the `token` HTTP-only cookie, verifies the JWT, loads the user, and sets `req.user`. `authorizeUser` then asserts that the `:userId` URL param matches `req.user.id`. The `:userId` in the URL is a sanity check — the session is the source of truth.
- **Nested card routes:** `cardRouter` is mounted at `/api/users/:userId/cards` and uses `Router({ mergeParams: true })` so `req.params.userId` is visible inside it.
- **Scheduler is duplicated:** authoritative logic lives in `server/src/services/retention.ts`; `client/src/lib/scheduler.ts` mirrors it for optimistic UI updates. Any change to the level/interval table must be applied to both files.
- **Dev proxy:** `client/vite.config.ts` proxies `/api` → `http://localhost:3001`, so the client always calls relative paths (e.g. `fetch('/api/users/...')`) and cookies just work.
- **DB schema:** snake_case in Postgres (`user_id`, `next_review`, …), camelCase in TypeScript. Mapping happens in `server/src/db/cards.ts` and `users.ts` — don't return raw rows from the pool.
