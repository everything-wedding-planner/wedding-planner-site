import { D1Database } from "@cloudflare/workers-types";

export interface CompanyRow {
  id: number;
  user_id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export const CompanyServiceTypes = {
  vendor: "VENDOR",
  venue: "VENUE",
} as const;

export class CompanyModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getAllCompanies(): Promise<CompanyRow[]> {
    const result = await this.db
      .prepare("SELECT * FROM company")
      .all<CompanyRow>();
    return result.results || [];
  }

  async getCompanyById(id: number): Promise<CompanyRow | null> {
    const result = await this.db
      .prepare("SELECT * FROM company WHERE id = ?")
      .bind(id)
      .first<CompanyRow>();
    return result || null;
  }

  async getCompanyByUserId(userId: number): Promise<CompanyRow | null> {
    const result = await this.db
      .prepare("SELECT * FROM company WHERE user_id = ?")
      .bind(userId)
      .first<CompanyRow>();
    return result || null;
  }

  async createCompany(
    userId: number,
    name: string,
    email: string,
    phone: string,
    address: string,
  ): Promise<CompanyRow | null | Error> {
    const result = await this.db
      .prepare(
        "INSERT INTO company (user_id, name, email, phone, address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
      )
      .bind(userId, name, email, phone, address)
      .run();
    if (!result.success) {
      throw new Error("Failed to create company");
    }
    const newCompanyId = result.meta.last_row_id as number;
    return this.getCompanyById(newCompanyId);
  }

  async updateCompany(
    id: number,
    name: string,
    email: string,
    phone: string,
    address: string,
  ): Promise<boolean> {
    const result = await this.db
      .prepare(
        "UPDATE company SET name = ?, email = ?, phone = ?, address = ?, updated_at = datetime('now') WHERE id = ?",
      )
      .bind(name, email, phone, address, id)
      .run();
    return result.success;
  }

  async deleteCompany(id: number): Promise<boolean> {
    const result = await this.db
      .prepare("DELETE FROM company WHERE id = ?")
      .bind(id)
      .run();
    return result.success;
  }
}
