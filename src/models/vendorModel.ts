import { D1Database } from "@cloudflare/workers-types";

export interface VendorRow {
  id: number;
  company_id: number;
  name: string;
  service_type: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface VendorProfile {
  businessName: string;
  serviceType: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export class VendorModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getAllVendors(): Promise<VendorRow[]> {
    const result = await this.db
      .prepare("SELECT * FROM vendor")
      .all<VendorRow>();
    return result.results || [];
  }

  async getVendorById(id: number): Promise<VendorRow | null> {
    const result = await this.db
      .prepare("SELECT * FROM vendor WHERE id = ?")
      .bind(id)
      .first<VendorRow>();

    return result as VendorRow | null;
  }

  async createVendor(
    companyId: number,
    name: string,
    service_type: string,
    contact_phone: string,
    contact_email: string,
    contact_name: string,
  ): Promise<VendorRow | null> {
    const result = await this.db
      .prepare(
        "INSERT INTO vendor (company_id, name, service_type, contact_phone, contact_email, contact_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
      )
      .bind(
        companyId,
        name,
        service_type,
        contact_phone,
        contact_email,
        contact_name,
      )
      .run();

    if (!result.success) {
      throw new Error("Failed to create vendor");
    }

    const newVendorId = result.meta.last_row_id as number;
    return this.getVendorById(newVendorId);
  }

  async getVendorsByCompanyId(companyId: number): Promise<VendorRow[]> {
    const result = await this.db
      .prepare("SELECT * FROM vendor WHERE company_id = ?")
      .bind(companyId)
      .all<VendorRow>();

    return result.results || [];
  }
}
