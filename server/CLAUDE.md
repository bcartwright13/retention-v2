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
- PostgreSQL (`pg` driver) — fully wired up, see `src/db/`
- `jsonwebtoken` for JWT auth sessions (HTTP-only cookie), `google-auth-library` for verifying Google ID tokens
- `zod` for request body validation
- `helmet` + a hand-rolled CSP, `express-rate-limit`, `cors` (`credentials: true`), `cookie-parser`
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
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

`src/config.ts` enforces these at boot (fails fast rather than starting in a broken state):
- `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` are required — missing any throws.
- `JWT_SECRET` must be ≥32 chars with no whitespace (catches pasting the `openssl rand -base64 64` *command* instead of its output).
- `CLIENT_URL` must parse as a valid URL.
- `jwtIssuer` (`'recall'`) and `jwtAudience` (`'recall-web'`) are hardcoded, not env-configurable — JWTs are signed and verified against these plus a pinned `HS256` algorithm.

## Structure

```
src/
├── index.ts        # Express app entry — see "Request pipeline" below
├── config.ts        # env var loading + boot-time validation
├── routes/          # auth.ts, cards.ts
├── controllers/      # auth.controller.ts, cards.controller.ts
├── middleware/       # authenticate, authorizeUser, csrf, errorHandler, uuidParam, asyncHandler
├── db/               # pool.ts, migrate.ts, cards.ts, users.ts
└── services/          # retention.ts (scheduler engine)
```

## Request pipeline (`src/index.ts`)

In order: `trust proxy: 1` (correct `req.ip` behind Render's proxy) → `helmet({ contentSecurityPolicy: false })` → `cors({ origin: config.clientUrl, credentials: true })` → `express.json({ limit: '32kb', strict: true })` → `cookieParser()` → `csrfHeaderCheck` (requires `X-Requested-With: fetch` on mutating methods) → a manually-set CSP header (`default-src 'self'`, `connect-src 'self'`, `frame-ancestors 'none'`, etc. — helmet's own CSP is disabled above so this one wins) → `GET /health` → `authLimiter` (20/min) in front of `authRouter` at `/api/auth` → `apiLimiter` (120/min, keyed by `req.user?.id ?? req.ip`) in front of `cardRouter` at `/api/users/:userId/cards` → in production only, static-serves `client/dist` with a SPA catch-all for non-`/api` paths (this is what makes the single-origin deploy in the root CLAUDE.md work) → `errorHandler` last.

`main()` calls `await runMigrations()` (see below) before `app.listen`; a failed migration or listen aborts boot (`process.exit(1)`) rather than serving with an unknown schema.

## Routes

- `routes/auth.ts` (`/api/auth`): `GET /google` → `googleLogin`, `GET /google/callback` → `googleCallback`, `GET /me` (authenticated) → `getMe`, `POST /logout` (authenticated) → `logout`.
- `routes/cards.ts` (`/api/users/:userId/cards`, `Router({ mergeParams: true })`): validates `:userId`/`:id` as UUIDs via `uuidParam` before `authenticate` + `authorizeUser` run, then `GET /`, `GET /due`, `POST /`, `PUT /:id`, `DELETE /:id`, `PATCH /:id/review` — matches the API shape in the root CLAUDE.md.

## Database (`src/db/`)

- `pool.ts` — `pg.Pool` from `config.databaseUrl`, plus a `query<T>()` helper.
- `migrate.ts` — `runMigrations()`: creates `schema_migrations` if missing, applies any `server/migrations/*.sql` not yet recorded there (sorted filename order, each in its own transaction), and records it. Runs automatically at server boot (see above) — this is the **only** schema path; local Docker Postgres no longer seeds via `docker-entrypoint-initdb.d`.
- `cards.ts` / `users.ts` — parameterized queries mapping snake_case rows (`user_id`, `next_review`, …) to camelCase domain objects. Don't return raw `pg` rows from controllers — map through these.

## Retention engine (`src/services/retention.ts`)

`computeReview(currentLevel, performance)` implements the level/interval table from the root CLAUDE.md (`LEVEL_INTERVALS = [1, 3, 7, 14, 21, 30]` days for levels 0–5). Called from `cards.controller.ts`'s `reviewCard` — this endpoint owns all level/interval math server-side; the client only previews intervals.

## Auth flow (`controllers/auth.controller.ts`)

`googleLogin` sets a short-lived CSRF `state` in an `oauth_state` cookie (`sameSite: 'lax'` — required since Google's redirect back is a top-level cross-site GET) and redirects to Google. `googleCallback` validates `state`, exchanges the code, verifies the `id_token` via `OAuth2Client.verifyIdToken` (checks `email_verified`, cross-checks `sub` against the `access_token` userinfo response), upserts the user (`db/users.ts`'s `findOrCreateByGoogle`), signs a JWT (`HS256`, `issuer`/`audience` pinned), sets it as an `httpOnly`, `sameSite: 'strict'`, 7-day `token` cookie, and redirects **only** to `config.clientUrl` (never a request-derived URL — avoids open redirects).

## Middleware (`src/middleware/`)

- `authenticate` — verifies the `token` cookie JWT (pinned algorithm/issuer/audience), loads the user, sets `req.user`, else 401.
- `authorizeUser` — asserts `req.params.userId === req.user.id`; mismatch or missing returns **404** (not 403), so an attacker can't distinguish "not yours" from "doesn't exist."
- `uuidParam` — rejects non-UUID `:userId`/`:id` path params with 404 before they reach Postgres.
- `csrf.ts` (`csrfHeaderCheck`) — requires `X-Requested-With: fetch` on POST/PUT/PATCH/DELETE; the client's `api.ts` always sends it.
- `errorHandler` — masks 5xx messages as "Internal server error" (logs the real error server-side); passes through custom messages for non-5xx.
- `asyncHandler` — wraps async handlers so rejected promises reach `errorHandler` instead of hanging.

## Validation

`controllers/cards.controller.ts` uses `zod` schemas (`.strict()`, so unknown JSON keys are rejected) with length caps matching the body-size limit: title ≤200, category ≤50, content ≤10000. `performance` is validated against `['forgot', 'struggled', 'gotit', 'mastered']`.

## Implementation notes

- All card endpoints are user-scoped; `userId` comes from the authenticated session, never from client input, even though it also appears in the URL path (see `authorizeUser` above).
- Cookies must work cross-origin in dev (client on 5173, server on 3001), hence `cors({ credentials: true })` — keep it if auth changes.
- In production the server and client are same-origin (see root CLAUDE.md "Deployment"), which is what lets the `token` cookie stay `sameSite: 'strict'` and the CSP stay `connect-src 'self'`.
