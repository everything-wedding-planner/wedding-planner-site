import { test } from "vitest";
import { applyD1Migrations, env } from "cloudflare:test";

test.beforeAll(async () => {
  // Apply all migrations to the in-memory D1
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);

  // Seed test data
  await seedTestData(env.DB);
});

async function seedTestData(db: D1Database) {
  // Insert user types (table name is 'user_type' per migration 0001)
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
  // Bcrypt hash of 'password123':
  const hash = "$2b$10$jjl2zt6BaJrEZX/9mcUYR.Xh8KnEgykNIyIhCdFyFTcT80v8gjcyq";
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
