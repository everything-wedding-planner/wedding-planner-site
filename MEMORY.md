# MEMORY.md — wedding-planner-site

Project context for future coding sessions.

## Overview

Monorepo: Cloudflare Worker (Hono.js) backend + React SPA (Vite + Tailwind v4) frontend.
Backend serves `/api/*` routes, falls through to `ASSETS` binding for the SPA build.

## Auth system

Frontend (`frontend/src/`) and backend (`src/`) both exist.

## Known quirks

- Frontend tsconfig has `noUnusedLocals` / `noUnusedParameters: true` — unused imports/params fail `tsc --noEmit`.
- `@cloudflare/vitest-pool-workers` appears in both `dependencies` (v0.8.0) and `devDependencies` (v0.18.0) — keep the devDeps version.
- `frontend/package.json` pins `@types/react` + `@types/react-dom` via `overrides` — don't remove.
- Hono JSX uses `hono/jsx` import source for server-rendered HTML.
