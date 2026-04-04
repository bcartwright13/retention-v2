# Project Recall: Spaced Repetition System (SRS) Spec Sheet

## 1. Project Overview

**Recall** is a minimalist web/mobile application designed for "lifestyle learning." It allows users to capture and retain information—such as Java functions, book quotes, and vocabulary—using a simplified spaced repetition algorithm.

- **Goal:** Bridge the gap between casual note-taking and intensive academic study.
- **Tech Stack:** React (TSX) Frontend, Node.js (TypeScript) Backend.
- **Primary Principle:** Atomic learning (one card = one idea).

---

## 2. Technical Architecture

- **Frontend:** React 19 + TypeScript.
  - *Styling:* Tailwind CSS.
  - *State Management:* Zustand or React Context.
- **Backend:** Node.js + TypeScript (Express.js).
- **Database:** PostgreSQL (Relational data for Card/User mapping).
- **Platform:** Responsive Web (PWA / Mobile-first).

---

## 3. Data Model (TypeScript)

```typescript
interface User {
  id: string;          // UUID
  email: string;
  displayName: string;
  createdAt: Date;
}

interface Card {
  id: string;          // UUID
  userId: string;      // Foreign Key -> User.id
  title: string;       // Front (e.g., "Java: String to Int")
  category: string;    // Label (e.g., "Programming", "Quotes")
  content: string;     // Back (The answer/detail)

  // Scheduling Logic
  level: number;       // Current bucket (0-5)
  nextReview: Date;    // Filter for "Retention Area"
  lastReviewed: Date;  // History tracking
  createdAt: Date;
  updatedAt: Date;     // Tracks content edits
}
```

> **Auth:** OAuth 2.0 with Google Sign-In. On successful authentication, the backend creates or retrieves the `User` record by matching the Google-provided email. A JWT session token is issued and sent as an HTTP-only cookie for subsequent API requests. The `:userId` in API routes is validated against the authenticated session.

---

## 4. Functional Requirements (MVP)

### 4.1 Card Management

- **Create:** Form with Title, Category, and Content.
- **Read:** "Library" view to see all cards, searchable by title.
- **Update/Delete:** Standard CRUD for managing content.

### 4.2 The Retention Engine (The Scheduler)

The system uses a **Linear Multiplier** based on self-assessment. When a user reviews a card, they select their performance level:

| Performance | Level Shift       | Interval              |
|-------------|-------------------|-----------------------|
| Forgot      | Reset to 0        | 1 day                 |
| Struggled   | No change         | 3 days                |
| Got it!     | Level + 1         | Based on level (see below) |
| Mastered    | Level + 2 (max 5) | 30 days               |

**Level-to-interval mapping** (used for "Got it!"):

| Level | Interval |
|-------|----------|
| 0     | 1 day    |
| 1     | 3 days   |
| 2     | 7 days   |
| 3     | 14 days  |
| 4     | 21 days  |
| 5     | 30 days  |

> **Note:** "Struggled" keeps the card at its current level to avoid rewarding uncertain recall. "Mastered" is reserved for cards the user feels fully confident on and jumps ahead aggressively.

### 4.3 The "Retention Area" (Study UI)

- **Queue:** Fetches only cards where `nextReview <= now`.
- **Step 1 (Prompt):** Display Category and Title.
- **Step 2 (Reveal):** User clicks "Show Answer" to reveal Content.
- **Step 3 (Feedback):** User selects "Forgot", "Struggled", "Got it!", or "Mastered".
- **Empty State:** When no cards are due, display a "You're all caught up!" message with a count of total cards and next upcoming review date.

---

## 5. API Endpoints (Node/TS)

All card endpoints are scoped to the authenticated user (`userId` is derived from the session/token, not passed as a parameter).

| Method | Endpoint                            | Description                                        |
|--------|-------------------------------------|----------------------------------------------------|
| GET    | `/api/users/:userId/cards`          | Fetch all cards for the user's library.            |
| GET    | `/api/users/:userId/cards/due`      | Fetch the user's cards ready for review.           |
| POST   | `/api/users/:userId/cards`          | Create a new card for the user.                    |
| PUT    | `/api/users/:userId/cards/:id`      | Update card content (title, category, content).    |
| PATCH  | `/api/users/:userId/cards/:id/review` | Submit a review (updates `level` & `nextReview`). |
| DELETE | `/api/users/:userId/cards/:id`      | Remove a card.                                     |

---

## 6. UI/UX Design Goals

- **Frictionless Entry:** Adding a card should take < 10 seconds.
- **Clean Contrast:** High readability for code and long text.
- **Progress Tracking:** Simple "Cards Remaining" counter during sessions.

---

## 7. Future Roadmap

- **Markdown Support:** Syntax highlighting for Java/TS.
- **Tags:** Multi-tag system instead of single category.
- **Notifications:** Daily reminders for due cards.
