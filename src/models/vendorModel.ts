import { D1Database } from "@cloudflare/workers-types";

export interface VendorRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export class VendorModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getAllVendors(): Promise<VendorRow[]> {
    const result = await this.db
      .prepare("SELECT * FROM vendors")
      .all<VendorRow>();
    return result.results || [];
  }

  async getVendorById(id: number): Promise<VendorRow | null> {
    const result = await this.db
      .prepare("SELECT * FROM vendors WHERE id = ?")
      .bind(id)
      .first<VendorRow>();

    return result as VendorRow | null;
  }

  async createVendor(
    name: string,
    email: string,
    phone: string,
    address: string,
  ): Promise<VendorRow | null> {
    const result = await this.db
      .prepare(
        "INSERT INTO vendors (name, email, phone, address, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))",
      )
      .bind(name, email, phone, address)
      .run();

    if (!result.success) {
      throw new Error("Failed to create vendor");
    }

    const newVendorId = result.meta.last_row_id as number;
    return this.getVendorById(newVendorId);
  }
}
