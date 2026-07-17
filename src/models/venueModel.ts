import type { D1Database } from "@cloudflare/workers-types";

export interface VenueRow {
  id: number;
  name: string;
  address: string;
  capacity: number;
  created_at: string;
  updated_at: string;
}

export class VenueModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getAllVenues(): Promise<VenueRow[]> {
    const results = await this.db
      .prepare("SELECT * FROM venues")
      .all<VenueRow>();
    return results.results || [];
  }

  async getVenueById(id: number): Promise<VenueRow | null> {
    const results = await this.db
      .prepare("SELECT * FROM venues WHERE id = ?")
      .bind(id)
      .first<VenueRow>();
    return results || null;
  }

  async createVenue(
    name: string,
    address: string,
    capacity: number,
  ): Promise<VenueRow | null | Error> {
    const result = await this.db
      .prepare("INSERT INTO venues (name, address, capacity) VALUES (?,?,?)")
      .bind(name, address, capacity)
      .run();

    if (result.success) {
      const newVenueId = result.meta.last_row_id;
      return this.getVenueById(newVenueId);
    } else {
      return new Error("Failed to create venue");
    }
  }
}
