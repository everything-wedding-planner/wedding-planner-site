import { CompanyServiceTypes } from "./companyModel";
import { D1Database } from "@cloudflare/workers-types";

export interface ImageRow {
  id: number;
  url: string;
  reference_type: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes];
  reference_id: number;
  alternative_text: string | null;
  extension: string;
  position: number;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export const IMAGE_FOLDER = "images/";

export class ImageModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getImagesByReference(
    referenceType: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes],
    referenceId: number,
  ): Promise<ImageRow[]> {
    const result = await this.db
      .prepare(
        "SELECT * FROM images WHERE reference_type = ? AND reference_id = ? AND deleted_at IS NULL",
      )
      .bind(referenceType, referenceId)
      .all<ImageRow>();
    return result.results || [];
  }

  async getImageById(id: number): Promise<ImageRow | null> {
    const result = await this.db
      .prepare("SELECT * FROM images WHERE id = ?")
      .bind(id)
      .first<ImageRow>();
    return result || null;
  }

  async createImage(
    url: string,
    referenceType: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes],
    referenceId: number,
    alternativeText: string | null,
    extension: string,
  ): Promise<boolean> {
    const result = await this.db
      .prepare(
        "INSERT INTO images (url, reference_type, reference_id, alternative_text, extension) VALUES (?, ?, ?, ?, ?) RETURNING *",
      )
      .bind(url, referenceType, referenceId, alternativeText, extension)
      .first<ImageRow>();
    if (!result) {
      throw new Error("Failed to create image");
    }
    return true;
  }

  async deleteImage(id: number): Promise<boolean> {
    const result = await this.db
      .prepare("UPDATE images SET deleted_at = datetime('now') WHERE id = ?")
      .bind(id)
      .run();
    return result.success;
  }
}
