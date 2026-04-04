# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Recall** — a minimalist spaced repetition system (SRS) for "lifestyle learning" (vocab, code snippets, quotes, etc.). One card = one idea.

## Project Structure

```
retention-v2/
├── client/    # React 19 + TypeScript frontend (Vite)
└── server/    # Node.js + TypeScript backend (Express)
```

See `client/CLAUDE.md` and `server/CLAUDE.md` for stack-specific commands and conventions.

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
