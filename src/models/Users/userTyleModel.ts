import { D1Database } from "@cloudflare/workers-types";
import type { UserRow } from "./userModel";

export interface UserTypeRow {
  id: number;
  type: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export class UserTypeModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getAllUserTypes(): Promise<UserTypeRow[]> {
    const result = await this.db
      .prepare("SELECT * FROM user_types")
      .all<UserTypeRow>();
    return result.results || [];
  }

  async getUserTypeById(id: number): Promise<UserTypeRow | null> {
    const result = await this.db
      .prepare("SELECT * FROM user_types WHERE id = ?")
      .bind(id)
      .first<UserTypeRow>();
    return result || null;
  }

  async getUserTypeByType(type: string): Promise<UserTypeRow | null> {
    const result = await this.db
      .prepare("SELECT * FROM user_types WHERE type = ?")
      .bind(type)
      .first<UserTypeRow>();
    return result || null;
  }

  async getUsersAssociatedToType(type: string): Promise<UserRow[] | Error> {
    const typeId = await this.getUserTypeByType(type);
    if (!typeId) {
      throw new Error(`User type "${type}" not found`);
    }
    const result = await this.db
      .prepare(
        "SELECT u.* FROM users AS u INNER JOIN user_userType AS uut ON u.id = uut.user_id WHERE uut.userType_id = ?",
      )
      .bind(typeId.id)
      .all<UserRow>();
    return result.results || [];
  }
}
