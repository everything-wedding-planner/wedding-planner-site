import { D1Database } from "@cloudflare/workers-types";

export interface messageRow {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  read_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

// export type MessageRoles = "client" | "vendor" | "venue";

export class MessageModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getMessagesByConversationId(
    conversation_id: number,
  ): Promise<messageRow[]> {
    const results = await this.db
      .prepare(
        "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
      )
      .bind(conversation_id)
      .all<messageRow>();
    return results.results;
  }

  async getMessagesByConversationIdSince(
    conversation_id: number,
    since: string,
  ): Promise<messageRow[]> {
    const results = await this.db
      .prepare(
        "SELECT * FROM messages WHERE conversation_id = ? AND created_at > ? ORDER BY created_at ASC",
      )
      .bind(conversation_id, since)
      .all<messageRow>();
    return results.results;
  }

  async getMessageById(id: number): Promise<messageRow | null> {
    const result = await this.db
      .prepare("SELECT * FROM messages WHERE id = ?")
      .bind(id)
      .first<messageRow>();
    return result || null;
  }

  async createMessage(
    conversation_id: number,
    sender_id: number,
    content: string,
  ): Promise<Boolean> {
    const result = await this.db
      .prepare(
        "INSERT INTO messages (conversation_id, sender_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      )
      .bind(
        conversation_id,
        sender_id,
        content,
        new Date().toISOString(),
        new Date().toISOString(),
      )
      .run();
    return result.success;
  }

  async markMessageAsRead(message_id: number): Promise<Boolean> {
    const result = await this.db
      .prepare("UPDATE messages SET read_at = ? WHERE id = ?")
      .bind(new Date().toISOString(), message_id)
      .run();
    return result.success;
  }
}
