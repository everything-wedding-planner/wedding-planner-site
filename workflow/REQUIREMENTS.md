# STU-13: Add Comprehensive Backend Test Suite

## Problem

The backend has zero functional tests. The only existing test file (`src/index.test.ts`) is a stale placeholder that tests a non-existent `/api/v1/books` endpoint. There is no `vitest.config.ts`, so tests cannot run in the Cloudflare Workers runtime with D1. This means regressions ship undetected and there is no safety net for refactoring.

## Desired Outcome

A comprehensive backend test suite that runs via `npm test` using `@cloudflare/vitest-pool-workers` to simulate the Workers runtime with an in-memory D1 database. All mounted API routes, models, and services are covered with happy-path and error-case tests. Auth flows (signup, login, logout, session restore) are tested end-to-end. The stale placeholder test file is removed.

## Scope

### In Scope

1. **Test infrastructure setup**
   - Create `vitest.config.ts` with `@cloudflare/vitest-pool-workers` pool configuration
   - Create a test setup/helper file that provisions an in-memory D1 database with schema and seed data
   - Fix the `@cloudflare/vitest-pool-workers` dependency conflict (remove v0.8.0 from `dependencies`, keep v0.18.0 in `devDependencies`)
   - Delete stale `src/index.test.ts`

2. **Route integration tests** (happy path + at least one error/edge case each)
   - `POST /api/auth/signup` — success + duplicate email/username
   - `POST /api/auth/login` — success + wrong password + nonexistent user
   - `POST /api/auth/logout` — clears session
   - `GET /api/vendors` — lists vendors + empty state
   - `POST /api/vendors/create` — creates vendor + missing required fields
   - `GET /api/companies` — lists companies + empty state
   - `POST /api/companies/create` — creates company + missing required fields
   - `GET /api/venues` — lists venues + empty state
   - `POST /api/venues/create` — creates venue + missing required fields
   - `POST /api/onboarding/submit` — full onboarding flow + incomplete data
   - `GET /api/dashboard` — returns authenticated user data + unauthenticated redirect/error
   - `GET /api/me` — returns current user + unauthenticated response

3. **Model unit tests**
   - `UserModel` — CRUD + `findUserByEmail`, `completedOnBoarding`, `getUserTypes`
   - `UserTypeModel` — `getAllUserTypes`, `getUserTypeById`, `getUserTypeByType`, `getUsersAssociatedToType`
   - `CompanyModel` — CRUD + `getCompanyByUserId`
   - `VendorModel` — CRUD + `getVendorByCompanyId`
   - `VenueModel` — CRUD + `getVenuesByCompanyId`
   - `BookingModel` — CRUD + `getAllBookingsByCompanyId`, `getAllBookingsByServiceId`, `getBookingsByClientId`, `updateBookingStatus`
   - `InquiryModel` — CRUD + `getAllInquiriesByServiceId`, `getInquiriesByClientId`, `updateInquiryStatus`

4. **Service unit tests**
   - `BookingService` — `getAllBookingsByUserId`, `createBooking`
   - `InquiryService` — `getAllInquiriesForAccountUser`, `createInquiry`

5. **Auth/middleware tests**
   - Session creation on login/signup
   - Session persistence across requests
   - Protected routes reject unauthenticated requests
   - Logout clears session

### Out of Scope

- Frontend tests (separate ticket)
- E2E / Playwright browser tests
- Performance / load testing
- Tests for unmounted controllers (`bookingController`, `inquiryController`, `landingController`)

## Acceptance Criteria

- `npm test` passes with all tests green
- All mounted API routes have at least happy-path + one error-case test
- All model classes have unit tests covering their public methods
- Auth flows (signup, login, logout, session restore) are tested end-to-end
- Stale `src/index.test.ts` placeholder is deleted
- No regressions to existing functionality

## Linear Ticket

[STU-13](https://linear.app/stuart-calverley/issue/STU-13/add-comprehensive-backend-test-suite)
