# STU-13: Proposal — Comprehensive Backend Test Suite

## Problem

The backend has zero functional tests. The only test file (`src/index.test.ts`) is a stale placeholder targeting a non-existent `/api/v1/books` endpoint. There is no `vitest.config.ts`, so tests never run in the Cloudflare Workers runtime with D1. Regressions ship undetected.

## Proposed Solution

Set up a complete backend testing infrastructure using `@cloudflare/vitest-pool-workers` v0.18.0 to run tests **entirely locally** inside a simulated Workers runtime with an **in-memory D1 database** (via miniflare). No remote databases, no network calls — all test data is seeded fresh for each test run. Tests are organized into three tiers:

1. **Model unit tests** — Direct D1 queries via model classes against a seeded test database
2. **Service unit tests** — Business logic orchestration with real D1 (no mocking)
3. **Route integration tests** — Full HTTP request/response cycle via Hono's `app.request()`, exercising middleware, auth, and response formatting

All tests share a common setup that applies migrations and seeds data, giving each test file a clean, predictable database state.

## Key Changes

| Change | Files |
|--------|-------|
| Vitest config with Workers pool | `vitest.config.ts` (new) |
| Test DB setup helper | `src/test/setup.ts` (new) |
| Test utilities (auth helpers, factories) | `src/test/helpers.ts` (new) |
| Model tests (7 files) | `src/models/**/*.test.ts` (new) |
| Service tests (2 files) | `src/services/**/*.test.ts` (new) |
| Route tests (7 files) | `src/controllers/**/*.test.ts` (new) |
| Auth/middleware tests | `src/test/auth.test.ts` (new) |
| Delete stale placeholder | `src/index.test.ts` (deleted) |
| Fix dependency conflict | `package.json` (edit) |

## Architecture Decisions

### Why not mock D1?
The project uses `@cloudflare/vitest-pool-workers` which provides a real **local in-memory D1** via miniflare. Tests run entirely on your machine against actual SQLite, catching query syntax errors, constraint violations, and migration issues that mocks would hide. No external services or network calls are involved.

### Why three test tiers?
- **Models** are the foundation — test SQL correctness in isolation
- **Services** orchestrate models — test business logic with real data
- **Routes** are the API surface — test the full request lifecycle including middleware

### Session/cookie handling in tests
Hono's `app.request()` supports cookie forwarding. Route tests will extract `Set-Cookie` headers from responses and forward them in subsequent requests to simulate session persistence.

## Success Criteria

- `npm test` passes with all tests green
- All mounted API routes covered (happy path + error cases)
- All model classes covered
- Auth flows tested end-to-end
- Stale placeholder deleted
- Dependency conflict resolved

## Linear Ticket

[STU-13](https://linear.app/stuart-calverley/issue/STU-13/add-comprehensive-backend-test-suite)
