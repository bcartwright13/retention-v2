# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with nodemon + ts-node (http://localhost:3001)
npm run build    # Compile TypeScript to dist/
npm run start    # Run compiled output (node dist/index.js)
```

There are no tests yet.

## Stack

- Node.js + TypeScript (Express 4)
- PostgreSQL (`pg` driver — not yet wired up)
- `jsonwebtoken` for JWT auth sessions (HTTP-only cookie)
- `cors` (configured with `credentials: true` for the client origin) + `cookie-parser`
- `dotenv` for environment config

## Environment Variables

Create a `.env` file in `server/`:

```
PORT=3001
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgres://user:password@localhost:5432/recall
JWT_SECRET=your_secret_here
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Current State

The server is still a skeleton: `src/index.ts` sets up Express with CORS, JSON parsing, and cookie parsing, and exposes a single `GET /health` endpoint. No routes, database access, auth, or scheduler logic exist yet.

The client currently runs entirely on mock data (`client/src/lib/mocks.ts`) and expects this server to eventually implement the API shape and retention engine defined in the root `CLAUDE.md`. Cookies must work cross-origin in dev (client on 5173, server on 3001), hence the `credentials: true` CORS config — keep it when adding auth.

## Implementation Notes

- All card endpoints are user-scoped; derive `userId` from the authenticated session (JWT cookie), never from client input, even though it appears in the URL path.
- The review endpoint (`PATCH .../cards/:id/review`) owns the retention engine — level shifts and `nextReview` calculation happen here, server-side. The client only displays interval hints.
- Structure routes, middleware, and DB logic under `src/` as they're added (e.g. `src/routes/`, `src/middleware/`, `src/db/`).
