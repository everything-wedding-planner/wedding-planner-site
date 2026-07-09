import type { D1Database } from "@cloudflare/workers-types";

export interface UserRow {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const findUserByEmail = async (
  db: D1Database,
  email: string,
): Promise<UserRow | null> => {
  const result = await db
    .prepare(
      "SELECT id, email, password_hash, is_active FROM users WHERE email = ?",
    )
    .bind(email)
    .first<UserRow>();
  return result || null;
};

export const createUser = async (
  db: D1Database,
  username: string,
  email: string,
  passwordHash: string,
) => {
  const user = await findUserByEmail(db, email);
  if (user) {
    throw new Error("User with this email already exists");
  }

  const result = await db
    .prepare(
      "INSERT INTO users (username, email, password_hash, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))",
    )
    .bind(username, email, passwordHash, true)
    .run();

  return result.success;
};
