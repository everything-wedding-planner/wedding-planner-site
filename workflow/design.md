# STU-13: Design Spec — Backend Test Suite

> **All tests run locally.** The test infrastructure uses `@cloudflare/vitest-pool-workers` with miniflare to create an **in-memory D1 database** on every test run. No remote databases, no network calls. Migrations are applied locally and test data is seeded fresh each time `npm test` runs.

## 1. Infrastructure

### 1.1 `vitest.config.ts` (new, project root)

```typescript
import path from "node:path";
import {
  cloudflareTest,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

export default defineConfig(async () => {
  const migrationsPath = path.join(__dirname, "database", "migrations");
  const migrations = await readD1Migrations(migrationsPath);

  return {
    plugins: [
      cloudflareTest({
        wrangler: {
          configPath: "./wrangler.jsonc",
        },
        miniflare: {
          bindings: {
            SESSION_SECRET: "test-secret-key-at-least-32-chars-long",
            TEST_MIGRATIONS: migrations,
          },
        },
      }),
    ],
    test: {
      poolOptions: {
        workers: {
          wrangler: { configPath: "./wrangler.jsonc" },
          miniflare: {
            bindings: {
              SESSION_SECRET: "test-secret-key-at-least-32-chars-long",
              TEST_MIGRATIONS: migrations,
            },
          },
        },
      },
    },
  };
});
```

**Notes:**
- `readD1Migrations` reads all SQL files from `database/migrations/` in order
- `TEST_MIGRATIONS` is a test-only binding passed to miniflare, applied in the setup file
- `SESSION_SECRET` is provided as a binding since it's defined as a `var` in wrangler.jsonc

### 1.2 `src/test/setup.ts` (new)

Shared test setup that applies migrations and seeds the database. Imported by all test files.

```typescript
import { applyD1Migrations } from "@cloudflare/vitest-pool-workers";
import { beforeAll } from "vitest";

declare module "vitest" {
  export interface TestContext {
    env: { DB: D1Database; SESSION_SECRET: string };
  }
}

beforeAll(async ({ env }) => {
  // Apply all migrations to the in-memory D1
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);

  // Seed test data
  await seedTestData(env.DB);
});

async function seedTestData(db: D1Database) {
  // Insert user types
  await db
    .prepare("INSERT INTO user_type (type_name, description) VALUES (?, ?)")
    .bind("vendor", "Wedding vendor")
    .run();
  await db
    .prepare("INSERT INTO user_type (type_name, description) VALUES (?, ?)")
    .bind("venue", "Wedding venue")
    .run();
  await db
    .prepare("INSERT INTO user_type (type_name, description) VALUES (?, ?)")
    .bind("client", "Wedding client")
    .run();

  // Insert test users (all with password: password123)
  const hash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
  await db
    .prepare(
      "INSERT INTO users (username, email, password_hash, is_active, completed_onboarding) VALUES (?, ?, ?, ?, ?)",
    )
    .bind("testvendor1", "testvendor1@example.com", hash, 1, 1)
    .run();
  await db
    .prepare(
      "INSERT INTO users (username, email, password_hash, is_active, completed_onboarding) VALUES (?, ?, ?, ?, ?)",
    )
    .bind("testvenue1", "testvenue1@example.com", hash, 1, 1)
    .run();
  await db
    .prepare(
      "INSERT INTO users (username, email, password_hash, is_active, completed_onboarding) VALUES (?, ?, ?, ?, ?)",
    )
    .bind("testclient1", "testclient1@example.com", hash, 1, 0)
    .run();
}
```

### 1.3 `src/test/helpers.ts` (new)

Reusable test utilities.

```typescript
import type { D1Database } from "@cloudflare/workers-types";
import app from "../index";
import bcrypt from "bcryptjs";

const TEST_PASSWORD = "password123";
const TEST_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

/** Create a user via the signup API and return the Set-Cookie header */
export async function signupUser(
  username: string,
  email: string,
  password: string = TEST_PASSWORD,
): Promise<{ response: Response; cookie: string }> {
  const res = await app.request("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: username, email, password }),
  });
  const cookie = res.headers.get("Set-Cookie") || "";
  return { response: res, cookie };
}

/** Login a user and return the Set-Cookie header */
export async function loginUser(
  email: string,
  password: string = TEST_PASSWORD,
): Promise<{ response: Response; cookie: string }> {
  const res = await app.request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const cookie = res.headers.get("Set-Cookie") || "";
  return { response: res, cookie };
}

/** Make an authenticated GET request */
export async function authGet(
  url: string,
  cookie: string,
): Promise<Response> {
  return app.request(`http://localhost${url}`, {
    method: "GET",
    headers: { Cookie: cookie },
  });
}

/** Make an authenticated POST request */
export async function authPost(
  url: string,
  cookie: string,
  body: unknown,
): Promise<Response> {
  return app.request(`http://localhost${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify(body),
  });
}

/** Make an unauthenticated POST request */
export async function unauthPost(
  url: string,
  body: unknown,
): Promise<Response> {
  return app.request(`http://localhost${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Directly seed a user into the DB (for model/service tests) */
export async function seedUser(
  db: D1Database,
  overrides: Partial<{
    username: string;
    email: string;
    password_hash: string;
    is_active: number;
    completed_onboarding: number;
  }> = {},
) {
  const defaults = {
    username: `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    email: `test_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`,
    password_hash: TEST_HASH,
    is_active: 1,
    completed_onboarding: 0,
    ...overrides,
  };
  const result = await db
    .prepare(
      "INSERT INTO users (username, email, password_hash, is_active, completed_onboarding) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(
      defaults.username,
      defaults.email,
      defaults.password_hash,
      defaults.is_active,
      defaults.completed_onboarding,
    )
    .run();
  return { id: result.meta.last_row_id as number, ...defaults };
}

/** Directly seed a company into the DB */
export async function seedCompany(
  db: D1Database,
  userId: number,
  overrides: Partial<{
    name: string;
    address: string;
    phone: string;
    email: string;
  }> = {},
) {
  const defaults = {
    name: `Company ${Date.now()}`,
    address: "123 Test St",
    phone: "555-0000",
    email: `company_${Date.now()}@example.com`,
    ...overrides,
  };
  const result = await db
    .prepare(
      "INSERT INTO company (user_id, name, address, phone, email) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(userId, defaults.name, defaults.address, defaults.phone, defaults.email)
    .run();
  return { id: result.meta.last_row_id as number, user_id: userId, ...defaults };
}
```

---

## 2. Model Tests

All model tests follow the same pattern: instantiate the model with `env.DB`, call methods, assert results.

### 2.1 `src/models/Users/userModel.test.ts`

| Test | What it verifies |
|------|------------------|
| `findUserById` — returns user for valid ID | Row exists, correct fields |
| `findUserById` — returns null for invalid ID | Returns null |
| `findUserByEmail` — returns user for valid email | Row exists, correct fields |
| `findUserByEmail` — returns null for invalid email | Returns null |
| `createUser` — creates and returns true | Result is true, user queryable |
| `createUser` — throws on duplicate email | Throws "already exists" |
| `completedOnBoarding` — sets flag to 1 | `completed_onboarding` is 1 |

### 2.2 `src/models/Users/userTyleModel.test.ts`

| Test | What it verifies |
|------|------------------|
| `getAllUserTypes` — returns seeded types | Array with 3 types |
| `getUserTypeById` — returns type for valid ID | Correct type_name |
| `getUserTypeById` — returns null for invalid ID | Returns null |
| `getUserTypeByType` — returns type for valid name | Correct row |
| `getUsersAssociatedToType` — returns users for type | Correct users array |
| `getUsersAssociatedToType` — throws for unknown type | Throws "not found" |

### 2.3 `src/models/companyModel.test.ts`

| Test | What it verifies |
|------|------------------|
| `getAllCompanies` — returns all companies | Array of companies |
| `getCompanyById` — returns company for valid ID | Correct fields |
| `getCompanyById` — returns null for invalid ID | Returns null |
| `getCompanyByUserId` — returns company for user | Correct company |
| `createCompany` — creates and returns row | Row returned with ID |
| `updateCompany` — updates fields | Fields changed |
| `deleteCompany` — removes row | `getCompanyById` returns null |

### 2.4 `src/models/vendorModel.test.ts`

| Test | What it verifies |
|------|------------------|
| `getAllVendors` — returns all vendors | Array of vendors |
| `getVendorById` — returns vendor for valid ID | Correct fields |
| `getVendorById` — returns null for invalid ID | Returns null |
| `createVendor` — creates and returns row | Row returned with ID |
| `getVendorByCompanyId` — returns vendors for company | Correct vendors |

### 2.5 `src/models/venueModel.test.ts`

| Test | What it verifies |
|------|------------------|
| `getAllVenues` — returns all venues | Array of venues |
| `getVenueById` — returns venue for valid ID | Correct fields |
| `getVenueById` — returns null for invalid ID | Returns null |
| `createVenue` — creates and returns row | Row returned with ID |
| `getVenuesByCompanyId` — returns venues for company | Correct venues |

### 2.6 `src/models/bookingModel.test.ts`

| Test | What it verifies |
|------|------------------|
| `getAllBookingsByCompanyId` — returns bookings | Array of bookings |
| `getAllBookingsByServiceId` — returns bookings by service | Filtered correctly |
| `createBooking` — creates and returns true | Result is true |
| `getBookingsByClientId` — returns bookings for client | Correct bookings |
| `updateBookingStatus` — changes status | Status updated |

### 2.7 `src/models/inquiryModel.test.ts`

| Test | What it verifies |
|------|------------------|
| `getAllInquiriesByServiceId` — returns inquiries | Filtered correctly |
| `createInquiry` — creates and returns true | Result is true |
| `getInquiriesByClientId` — returns inquiries for client | Correct inquiries |
| `updateInquiryStatus` — changes status | Status updated |

---

## 3. Service Tests

### 3.1 `src/services/bookingService.test.ts`

| Test | What it verifies |
|------|------------------|
| `getAllBookingsByUserId` — returns bookings for user with company | Array of bookings |
| `getAllBookingsByUserId` — returns Error if no company | Error returned |
| `createBooking` — creates booking for vendor service | Returns true |
| `createBooking` — creates booking for venue service | Returns true |
| `createBooking` — returns Error for invalid service type | Error returned |
| `createBooking` — returns Error for nonexistent vendor | Error returned |

### 3.2 `src/services/inquiryService.test.ts`

| Test | What it verifies |
|------|------------------|
| `getAllInquiriesForAccountUser` — returns inquiries across services | Array of inquiries |
| `getAllInquiriesForAccountUser` — returns Error if no company | Error returned |
| `createInquiry` — creates inquiry | Returns true |

---

## 4. Route Integration Tests

All route tests use `app.request()` which returns real HTTP responses. Cookie-based session testing extracts `Set-Cookie` and forwards it.

### 4.1 `src/controllers/authController.test.ts`

| Test | Method | Path | Expected |
|------|--------|------|----------|
| Successful signup | POST | `/api/auth/signup` | 200, `{ success: true, userId }`, session cookie set |
| Duplicate email signup | POST | `/api/auth/signup` | 400, `{ error: "User with this email already exists" }` |
| Successful login | POST | `/api/auth/login` | 200, `{ message: "Login successful", userId }`, session cookie set |
| Wrong password login | POST | `/api/auth/login` | 401, `{ error: "Invalid password" }` |
| Nonexistent user login | POST | `/api/auth/login` | 404, `{ error: "User not found" }` |
| Logout clears session | POST | `/api/auth/logout` | 200, `{ success: true }` |

### 4.2 `src/controllers/vendorController.test.ts`

| Test | Method | Path | Expected |
|------|--------|------|----------|
| List vendors (empty) | GET | `/api/vendors` | 200, `{ vendors: [] }` |
| List vendors (with data) | GET | `/api/vendors` | 200, `{ vendors: [...] }` |
| Create vendor | POST | `/api/vendors/create` | 200, `{ vendor: {...} }` |

### 4.3 `src/controllers/companyController.test.ts`

| Test | Method | Path | Expected |
|------|--------|------|----------|
| List companies (empty) | GET | `/api/companies` | 200, `{ companies: [] }` |
| List companies (with data) | GET | `/api/companies` | 200, `{ companies: [...] }` |
| Create company | POST | `/api/companies/create` | 200, `{ company: {...} }` |

### 4.4 `src/controllers/venueController.test.ts`

| Test | Method | Path | Expected |
|------|--------|------|----------|
| List venues (empty) | GET | `/api/venues` | 200, `{ venues: [] }` |
| List venues (with data) | GET | `/api/venues` | 200, `{ venues: [...] }` |
| Create venue | POST | `/api/venues/create` | 200, `{ venue: {...} }` |

### 4.5 `src/controllers/onboardingController.test.ts`

| Test | Method | Path | Expected |
|------|--------|------|----------|
| Successful onboarding (vendor) | POST | `/api/onboarding/submit` | 200, `{ success: true }`, `completed_onboarding` set |
| Successful onboarding (venue) | POST | `/api/onboarding/submit` | 200, `{ success: true }` |
| Unauthorized (no session) | POST | `/api/onboarding/submit` | 401, `{ error: "Unauthorized" }` |
| Missing company data | POST | `/api/onboarding/submit` | 400, `{ error: "Company data is required" }` |
| Missing vendor AND venue | POST | `/api/onboarding/submit` | 400, `{ error: "No vendor or venue provided" }` |

### 4.6 `src/controllers/dashboardController.test.ts`

| Test | Method | Path | Expected |
|------|--------|------|----------|
| Dashboard (authenticated, onboarded) | GET | `/api/dashboard` | 200, `{ success: true, data: { user, company, vendors, venues } }` |
| Dashboard (authenticated, not onboarded) | GET | `/api/dashboard` | 200, `{ success: true }` (no data) |
| Dashboard (unauthenticated) | GET | `/api/dashboard` | 401, `{ error: "Unauthorized" }` |

### 4.7 `src/index.test.ts` (replaced)

| Test | Method | Path | Expected |
|------|--------|------|----------|
| GET /api/me (authenticated) | GET | `/api/me` | 200, `{ id, user }` |
| GET /api/me (unauthenticated) | GET | `/api/me` | 401, `{ error: "Unauthorized" }` |

---

## 5. Auth/Middleware Tests

### 5.1 `src/test/auth.test.ts`

| Test | What it verifies |
|------|------------------|
| Session created on signup | `Set-Cookie` header contains session cookie |
| Session created on login | `Set-Cookie` header contains session cookie |
| Session persists across requests | Login → GET /api/me returns user data |
| Protected route rejects unauthenticated | GET /api/dashboard returns 401 |
| Logout clears session | Logout → GET /api/me returns 401 |
| CORS headers present | OPTIONS request returns CORS headers |

---

## 6. File Structure

```
src/
├── test/
│   ├── setup.ts              # Migration + seed setup
│   ├── helpers.ts            # Reusable test utilities
│   ├── auth.test.ts          # Auth/middleware tests
├── models/
│   ├── Users/
│   │   ├── userModel.test.ts
│   │   └── userTyleModel.test.ts
│   ├── companyModel.test.ts
│   ├── vendorModel.test.ts
│   ├── venueModel.test.ts
│   ├── bookingModel.test.ts
│   └── inquiryModel.test.ts
├── services/
│   ├── bookingService.test.ts
│   └── inquiryService.test.ts
├── controllers/
│   ├── authController.test.ts
│   ├── vendorController.test.ts
│   ├── companyController.test.ts
│   ├── venueController.test.ts
│   ├── onboardingController.test.ts
│   └── dashboardController.test.ts
├── index.test.ts              # /api/me tests (replaces stale file)
vitest.config.ts              # Vitest + Workers pool config
```

**Total: 17 test files, ~75 test cases**

---

## 7. Dependency Fix

Remove `@cloudflare/vitest-pool-workers` from `dependencies` in `package.json` (v0.8.0). Keep only the `devDependencies` version (v0.18.0).

```diff
 "dependencies": {
-  "@cloudflare/vitest-pool-workers": "^0.8.0",
   "@cloudflare/workers-types": "^4.2025010.0",
```

---

## 8. Execution Order

1. Fix dependency conflict in `package.json`
2. Create `vitest.config.ts`
3. Create `src/test/setup.ts` and `src/test/helpers.ts`
4. Delete stale `src/index.test.ts`
5. Write model tests (7 files) — run after each to verify
6. Write service tests (2 files)
7. Write route tests (7 files)
8. Write auth/middleware tests
9. Run full suite: `npm test`
10. Fix any issues, iterate

## 9. Known Bugs to Document (Not Fix in This Ticket)

These bugs exist in the current codebase and will surface during testing. They should be noted but not fixed as part of STU-13:

- **`vendorController.ts`**: `POST /create` destructures wrong fields and calls `createVendor` with wrong arg count
- **`companyController.ts`**: `POST /create` calls `createCompany` with 4 args instead of 5 (missing `userId`)
- **`venueController.ts`**: `POST /create` calls `createVenue` with 3 args instead of 7
- **`dashboardController.ts`**: Uses `getCompanyById(userId)` instead of `getCompanyByUserId(userId)`
- **`bookingModel.ts`**: `createBooking` INSERT has 7 columns but binds 5 values (missing `company_id`)

Tests should be written to match the **actual code behavior**, not the intended behavior. Document these as known issues in test comments.

---

## Linear Ticket

[STU-13](https://linear.app/stuart-calverley/issue/STU-13/add-comprehensive-backend-test-suite)
