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
        "SELECT * FROM images WHERE reference_type = ? AND reference_id = ? AND deleted_at IS NULL ORDER BY position ASC",
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
        "INSERT INTO images (url, reference_type, reference_id, alternative_text, extension, position) VALUES (?, ?, ?, ?, ?, (SELECT COALESCE(MAX(position),0) + 1 FROM images WHERE reference_type = ? AND reference_id = ? AND deleted_at IS NULL)) RETURNING *",
      )
      .bind(
        url,
        referenceType,
        referenceId,
        alternativeText,
        extension,
        referenceType,
        referenceId,
      )
      .first<ImageRow>();
    if (!result) {
      throw new Error("Failed to create image");
    }
    return true;
  }

  async updateImagePosition(id: number, newPosition: number): Promise<boolean> {
    const result = await this.db
      .prepare("UPDATE images SET position = ? WHERE id = ?")
      .bind(newPosition, id)
      .run();
    return result.success;
  }

  async reorderImages(
    referenceType: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes],
    referenceId: number,
    items: { id: number; display_order: number }[],
  ): Promise<boolean> {
    let batchList = [];
    for (const item of items) {
      batchList.push(
        this.db
          .prepare(
            "UPDATE images SET position = ? WHERE id = ? AND reference_type = ? AND reference_id = ?",
          )
          .bind(item.display_order, item.id, referenceType, referenceId),
      );
    }
    const result = await this.db.batch(batchList);
    return result.every((r) => r.success);
  }

  async deleteImage(id: number): Promise<boolean> {
    const result = await this.db
      .prepare("UPDATE images SET deleted_at = datetime('now') WHERE id = ?")
      .bind(id)
      .run();
    return result.success;
  }
}
