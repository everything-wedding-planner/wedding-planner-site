import type { D1Database } from "@cloudflare/workers-types";

export interface VenueRow {
  id: number;
  company_id: number;
  name: string;
  address: string;
  capacity: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface VenueProfile {
  venueName: string;
  address: string;
  capacity: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export class VenueModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getAllVenues(): Promise<VenueRow[]> {
    const results = await this.db
      .prepare("SELECT * FROM venue")
      .all<VenueRow>();
    return results.results || [];
  }

  async getVenueById(id: number): Promise<VenueRow | null> {
    const results = await this.db
      .prepare("SELECT * FROM venue WHERE id = ?")
      .bind(id)
      .first<VenueRow>();
    return results || null;
  }

  async createVenue(
    company_id: number,
    name: string,
    address: string,
    capacity: number,
    contact_name: string,
    contact_email: string,
    contact_phone: string,
  ): Promise<VenueRow | null | Error> {
    const result = await this.db
      .prepare(
        "INSERT INTO venue (company_id, name, address, capacity, contact_name, contact_email, contact_phone) VALUES (?,?,?,?,?,?,?)",
      )
      .bind(
        company_id,
        name,
        address,
        capacity,
        contact_name,
        contact_email,
        contact_phone,
      )
      .run();

    if (result.success) {
      const newVenueId = result.meta.last_row_id;
      return this.getVenueById(newVenueId);
    } else {
      return new Error("Failed to create venue");
    }
  }
}
