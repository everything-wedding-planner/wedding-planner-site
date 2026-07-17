# STU-5: Fix Auth Flow — Proposal

## Problem

The authentication system is non-functional. Users cannot log in, sign up, or log out because:
1. The backend session middleware is bypassed (session destructured from request body instead of Hono context)
2. The frontend never updates auth state after successful API calls
3. No logout endpoint exists
4. Session secret is hardcoded in source code (security risk)

## Proposed Solution

### Backend Changes

**Session Handling Fix** (`src/controllers/authController.ts`)
- Replace `const { ..., session } = await c.req.json()` with `const session = c.get("session")`
- This ensures `session.set("userId", user.id)` writes to the actual Hono session cookie, not a throwaway object

**Logout Endpoint** (`src/controllers/authController.ts`)
- Add `POST /api/auth/logout` that calls `session.deleteSession()` and returns `{ success: true }`
- Mounted automatically via existing `app.route("/api/auth", authRoute)` in `src/index.ts`

**Environment Variables** (`src/index.ts`, `src/env.ts`, `wrangler.jsonc`)
- Move `SESSION_SECRET` from hardcoded constant to `c.env.SESSION_SECRET`
- Restructure session middleware to read env at request time (Cloudflare Workers pattern)
- Add `SESSION_SECRET` to `wrangler.jsonc` vars for local dev

**Type Safety** (`src/env.ts`)
- Add `SESSION_SECRET: string` to `Env` interface
- Consider adding a `SessionData` interface for typed session access

### Frontend Changes

**AuthPage.tsx**
- Import `useAuth()` hook and call `login(userId)` after successful API response
- Add error state to display API errors to users
- Filter request payloads: only send required fields per endpoint
- Add client-side `confirmPassword` validation

**AuthProvider.tsx**
- Update `logout()` to be async, call `POST /api/auth/logout` before clearing state
- Handle errors gracefully (clear state even if API fails)

## Key Architecture Decisions

### 1. Session Middleware Restructuring

The `sessionMiddleware` from `hono-sessions` is currently configured at module level with a hardcoded secret. In Cloudflare Workers, `env` is per-request, not per-module.

**Option A: Per-request middleware instantiation**
```typescript
app.use("/api/*", async (c, next) => {
  const middleware = sessionMiddleware({
    store: new CookieStore(),
    encryptionKey: c.env.SESSION_SECRET,
    // ...
  });
  return middleware(c, next);
});
```
Creates a new middleware instance per request. Clean but slightly more overhead.

**Option B: Keep module-level, use env fallback**
Keep the current structure but read from `process.env` or a global. Less clean but simpler.

**Decision:** Option A — per-request middleware instantiation. It's the correct Cloudflare Workers pattern and the overhead is negligible for cookie-based sessions.

### 2. Session Storage Strategy

**Decision:** Keep `CookieStore` (encrypted cookie). Session payload is minimal (`userId` only), no DB roundtrip needed. Can migrate to D1-backed sessions later if server-side revocation or larger session data is required.

### 2. Error Response Format

Standardize backend error responses:
```json
{ "error": "Human-readable message" }
```
Frontend will check `res.ok` and display `error` field from JSON.

### 3. Frontend Auth State Flow

```
AuthPage submit → fetch API → on success → login(userId) → AuthProvider updates state → App re-renders
```

No redirect needed — React re-render handles the UI update.

## Success Criteria

- [ ] User can sign up and remain logged in
- [ ] User can log in and see authenticated state
- [ ] User can log out and session is cleared
- [ ] Error messages are displayed for failed login/signup
- [ ] Session secret is not hardcoded in source
- [ ] No unnecessary fields sent to API

## Linear Ticket

https://linear.app/stuart-calverley/issue/STU-5
