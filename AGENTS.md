# AGENTS.md — wedding-planner-admin-site

## Project structure

Monorepo with two packages: **root** = Cloudflare Worker (Hono.js backend), **`frontend/`** = React SPA (Vite + Tailwind v4).

- **Entry**: `src/index.ts` — Hono app, routes under `/api/*`, falls through to `ASSETS` for SPA
- **Bindings**: `DB` (D1), `ASSETS` (frontend build), `session` (cookie-based via hono-sessions)
- **Database**: Cloudflare D1, migrations in `database/migrations/`
- **Auth**: bcryptjs + hono-sessions CookieStore (encrypted cookie, no server-side session store)

## CRITICAL WORKFLOW.

- All work must be linked to a Linear ticket. No unbilled changes. If asked to create a feature, you must check to see if a Linear ticket exists, and if not then follow the linear skill command to create one.
- Before exploring the code base, first check if a Linear ticket for said ask exists.
- **Before switching branches**: Run `git status` to check for uncommitted changes. If changes exist, alert the user and wait for instructions (commit, stash, or discard) before switching.
- **After implementation**: Delete the `workflow/` directory and commit the deletion separately: `chore: remove workflow docs after [TICKET-ID] implementation`

## Commands

| Command                          | What                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| `npm run dev`                    | Backend dev server (wrangler, `:8787`)                       |
| `npm run deploy`                 | Deploy worker with minification                              |
| `npm test`                       | Backend tests (vitest)                                       |
| `npm run cf-typegen`             | Regenerate `CloudflareBindings` types                        |
| `npm run views:dev`              | Frontend Vite dev server (`:5173`, proxies `/api` → `:8787`) |
| `npm run views:build`            | Build frontend to `frontend/dist/`                           |
| `npm --prefix frontend run test` | Frontend tests (vitest with Playwright)                      |
| `npm --prefix frontend run lint` | Frontend ESLint                                              |

## Critical order

1. `npm run views:build` must run before `npm run dev` or `npm run deploy` — the Worker serves the frontend build via the `ASSETS` binding
2. For local full-stack: run `npm run dev` (backend :8787) + `npm run views:dev` (frontend :5173) concurrently. The Vite proxy sends `/api/*` to :8787.

## Test quirks

- Backend tests use `@cloudflare/vitest-pool-workers` (simulates Workers runtime)
- Frontend tests require Playwright browsers installed (`npx playwright install chromium`)
- `src/index.test.ts` tests a `/api/v1/books` endpoint that **does not exist** in the app — stale/placeholder
- Frontend tsconfig uses `noUnusedLocals` / `noUnusedParameters: true` — unused imports/params will fail `tsc --noEmit`

## Framework & deployment specifics

- Cloudflare Workers + Hono + D1 + Assets (static frontend hosting)
- `wrangler.jsonc` configures SPA fallback + `run_worker_first: true`
- `compatibility_date: 2026-07-07` — keep this current when deploying
- `@cloudflare/vitest-pool-workers` appears in both `dependencies` (v0.8.0) and `devDependencies` (v0.18.0) — resolve conflicts by keeping the devDeps version
- `frontend/package.json` pins `@types/react` + `@types/react-dom` via `overrides` — don't remove
- Hono JSX is configured (root tsconfig has `"jsx": "react-jsx"` with `"jsxImportSource": "hono/jsx"`) — for Worker-rendered HTML if needed

## Dead code / cleanup notes

- `landingController` is defined but never imported in `src/index.ts` — it's unused
- `src/index.test.ts` is a placeholder referencing a `/api/v1/books` route that doesn't exist
