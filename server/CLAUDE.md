# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with nodemon (http://localhost:3001)
npm run build    # Compile TypeScript to dist/
npm run start    # Run compiled output
```

## Stack

- Node.js + TypeScript (Express.js)
- PostgreSQL (`pg` driver)
- JWT (HTTP-only cookie) for auth sessions
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

## Structure

```
src/
└── index.ts    # Express app entry point
```

Routes, middleware, and DB logic will be added under `src/` as the project grows.
