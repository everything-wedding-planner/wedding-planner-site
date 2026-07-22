import type { D1Database } from "@cloudflare/workers-types";
import { SELF } from "cloudflare:test";

const TEST_PASSWORD = "password123";
const TEST_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

/** Create a user via the signup API and return the Set-Cookie header */
export async function signupUser(
  username: string,
  email: string,
  password: string = TEST_PASSWORD,
): Promise<{ response: Response; cookie: string }> {
  const res = await SELF.fetch("http://localhost/api/auth/signup", {
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
  const res = await SELF.fetch("http://localhost/api/auth/login", {
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
  return SELF.fetch(`http://localhost${url}`, {
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
  return SELF.fetch(`http://localhost${url}`, {
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
  return SELF.fetch(`http://localhost${url}`, {
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

/** Directly seed a vendor into the DB */
export async function seedVendor(
  db: D1Database,
  companyId: number,
  overrides: Partial<{
    name: string;
    service_type: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
  }> = {},
) {
  const defaults = {
    name: `Vendor ${Date.now()}`,
    service_type: "photography",
    contact_name: "Test Contact",
    contact_email: `vendor_${Date.now()}@example.com`,
    contact_phone: "555-1111",
    ...overrides,
  };
  const result = await db
    .prepare(
      "INSERT INTO vendor (company_id, name, service_type, contact_name, contact_email, contact_phone) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(
      companyId,
      defaults.name,
      defaults.service_type,
      defaults.contact_name,
      defaults.contact_email,
      defaults.contact_phone,
    )
    .run();
  return { id: result.meta.last_row_id as number, company_id: companyId, ...defaults };
}

/** Directly seed a venue into the DB */
export async function seedVenue(
  db: D1Database,
  companyId: number,
  overrides: Partial<{
    name: string;
    address: string;
    capacity: number;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
  }> = {},
) {
  const defaults = {
    name: `Venue ${Date.now()}`,
    address: "456 Venue Rd",
    capacity: 100,
    contact_name: "Venue Contact",
    contact_email: `venue_${Date.now()}@example.com`,
    contact_phone: "555-2222",
    ...overrides,
  };
  const result = await db
    .prepare(
      "INSERT INTO venue (company_id, name, address, capacity, contact_name, contact_email, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      companyId,
      defaults.name,
      defaults.address,
      defaults.capacity,
      defaults.contact_name,
      defaults.contact_email,
      defaults.contact_phone,
    )
    .run();
  return { id: result.meta.last_row_id as number, company_id: companyId, ...defaults };
}
