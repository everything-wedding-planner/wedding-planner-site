import type { D1Database } from "@cloudflare/workers-types";
import { user_userTypeRow } from "./pivot/user_userTypeModel";
import { UserTypeRow } from "./userTyleModel";

export interface UserRow {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  completed_onboarding: boolean;
  created_at: string;
  updated_at: string;
}

export class UserModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async findUserById(id: number): Promise<UserRow | null> {
    const result = await this.db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(id)
      .first<UserRow>();
    return result || null;
  }

  async findUserByEmail(email: string): Promise<UserRow | null> {
    const result = await this.db
      .prepare("SELECT * FROM users WHERE email = ?")
      .bind(email)
      .first<UserRow>();
    return result || null;
  }

  async createUser(
    username: string,
    email: string,
    passwordHash: string,
  ): Promise<boolean> {
    const user = await this.findUserByEmail(email);
    if (user) {
      throw new Error("User with this email already exists");
    }

    const result = await this.db
      .prepare(
        "INSERT INTO users (username, email, password_hash, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))",
      )
      .bind(username, email, passwordHash, true)
      .run();

    return result.success;
  }

  async completedOnBoarding(userId: number): Promise<void> {
    await this.db
      .prepare("UPDATE users SET completed_onboarding = 1 WHERE id = ?")
      .bind(userId)
      .run();
  }

  async getUserTypes(userId: number): Promise<UserTypeRow[]> {
    const result = await this.db
      .prepare(
        "SELECT ut.* FROM user_types AS ut INNER JOIN user_userType AS uut ON ut.id = uut.userType_id WHERE uut.user_id = ?",
      )
      .bind(userId)
      .all<UserTypeRow>();
    return result.results || [];
  }
}
