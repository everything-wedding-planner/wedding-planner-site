import { D1Database } from "@cloudflare/workers-types";

export interface conversationRow {
  id: number;
  client_id: number;
  reference_id: number;
  reference_type: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export class ConversationModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getConversationById(id: number): Promise<conversationRow | null> {
    const result = await this.db
      .prepare("SELECT * FROM conversations WHERE id = ?")
      .bind(id)
      .first<conversationRow>();
    return result || null;
  }

  async getConversationsByReference(
    reference_id: number,
    reference_type: string,
  ): Promise<conversationRow[]> {
    const result = await this.db
      .prepare(
        "SELECT * FROM conversations WHERE reference_id = ? AND reference_type = ?",
      )
      .bind(reference_id, reference_type)
      .all<conversationRow>();
    return result.results;
  }

  async getConversationsByClientId(
    client_id: number,
  ): Promise<conversationRow[]> {
    const results = await this.db
      .prepare("SELECT * FROM conversations WHERE client_id = ?")
      .bind(client_id)
      .all<conversationRow>();
    return results.results;
  }

  async createConversation(
    client_id: number,
    reference_id: number,
    reference_type: string,
  ): Promise<Boolean> {
    const result = await this.db
      .prepare(
        "INSERT INTO conversations (client_id, reference_id, reference_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      )
      .bind(client_id, reference_id, reference_type, new Date(), new Date())
      .run();
    return result.success;
  }

  async updateConversationStatus(
    conversationId: number,
    newStatus: string,
  ): Promise<boolean> {
    const result = await this.db
      .prepare(
        "UPDATE conversations SET status = ?, updated_at = ? WHERE id = ?",
      )
      .bind(newStatus, new Date(), conversationId)
      .run();
    return result.success;
  }
}
