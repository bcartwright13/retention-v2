# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Type-check and build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## Stack

- React 19 + TypeScript
- Vite (bundler)
- Tailwind CSS (styling)
- Zustand or React Context (state management — TBD)

## Backend

The backend dev server runs on `http://localhost:3001`. API requests should be proxied via Vite config to avoid CORS issues during development.
