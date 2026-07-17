# STU-5: Fix Auth Flow

## Problem

The authentication flow is broken in multiple places:
- Backend destructures `session` from the JSON body instead of using `c.get("session")`, so sessions never persist
- Frontend doesn't call `login()` after successful API calls, so users never appear logged in
- No logout endpoint exists
- Session secret is hardcoded in source code
- Frontend sends unnecessary fields (`confirmPassword`) to the API
- No error feedback shown to users

## Requirements

### Backend

1. **Fix session handling** in `src/controllers/authController.ts`
   - Remove `session` from request body destructuring (lines 10, 33)
   - Use `c.get("session")` to access the Hono session middleware
   - Keep `session.set("userId", user.id)` calls (they'll now reference the correct session)

2. **Add logout endpoint**
   - Create `POST /api/auth/logout` route in `authController.ts`
   - Call `session.deleteSession()` to clear the session
   - Return `{ success: true }`

3. **Move session secret to environment**
   - Add `SESSION_SECRET: string` to `Env` interface in `src/env.ts`
   - Restructure session middleware in `src/index.ts` to read from `c.env.SESSION_SECRET`
   - Add `SESSION_SECRET` to `wrangler.jsonc` vars for local development
   - Remove hardcoded secret from source code

4. **Add session type safety**
   - Define typed session access where possible

### Frontend

5. **Update AuthPage.tsx**
   - Import and use `useAuth()` hook
   - Call `login(userId)` after successful login/signup
   - Display error messages from API responses
   - Validate `confirmPassword` client-side only (don't send to API)
   - Only send required fields: `email` + `password` for login, `name` + `email` + `password` for signup

6. **Update AuthProvider.tsx logout**
   - Call `POST /api/auth/logout` with `credentials: "include"` before clearing local state
   - Handle errors gracefully (clear local state even if API call fails)

## Files to Modify

| File | Changes |
|------|---------|
| `src/env.ts` | Add `SESSION_SECRET` to Env interface |
| `src/index.ts` | Restructure session middleware to read from env |
| `src/controllers/authController.ts` | Fix session access, add logout endpoint |
| `frontend/src/views/AuthPage.tsx` | Auth state management, error handling, validation |
| `frontend/src/AuthProvider.tsx` | Update logout to call backend |
| `wrangler.jsonc` | Add SESSION_SECRET to vars block |

## Success Criteria

- [ ] User can sign up and remain logged in
- [ ] User can log in and see authenticated state
- [ ] User can log out and session is cleared
- [ ] Error messages are displayed for failed login/signup
- [ ] Session secret is not hardcoded in source
- [ ] No unnecessary fields sent to API

## Linear Ticket

https://linear.app/stuart-calverley/issue/STU-5
