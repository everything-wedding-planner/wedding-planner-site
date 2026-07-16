# MEMORY.md — wedding-planner-site

Project context for future coding sessions.

## Overview

Monorepo: Cloudflare Worker (Hono.js) backend + React SPA (Vite + Tailwind v4) frontend.
Backend serves `/api/*` routes, falls through to `ASSETS` binding for the SPA build.

## Auth system

Frontend (`frontend/src/`) and backend (`src/`) both exist.

### Cached IDs (project-specific)

| Project              | Team ID                                | Project ID                             |
| -------------------- | -------------------------------------- | -------------------------------------- |
| Wedding Planner Site | `8b59041f-2cbe-4b59-b281-f9e66d7531ec` | `eaa524d3-5939-4f97-a830-b1340b024c39` |

## Known quirks

- Frontend tsconfig has `noUnusedLocals` / `noUnusedParameters: true` — unused imports/params fail `tsc --noEmit`.
- `@cloudflare/vitest-pool-workers` appears in both `dependencies` (v0.8.0) and `devDependencies` (v0.18.0) — keep the devDeps version.
- `frontend/package.json` pins `@types/react` + `@types/react-dom` via `overrides` — don't remove.
- Hono JSX uses `hono/jsx` import source for server-rendered HTML.
