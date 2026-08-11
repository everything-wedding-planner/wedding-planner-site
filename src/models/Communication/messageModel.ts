import { D1Database } from "@cloudflare/workers-types";

export interface messageRow {
  id: number;
  conversation_id: number;
  message_role: string;
  content: string;
  read_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

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

  async createMessage(
    conversation_id: number,
    message_role: string,
    content: string,
  ): Promise<Boolean> {
    const result = await this.db
      .prepare(
        "INSERT INTO messages (conversation_id, message_role, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      )
      .bind(conversation_id, message_role, content, new Date(), new Date())
      .run();
    return result.success;
  }

  async markMessageAsRead(message_id: number): Promise<Boolean> {
    const result = await this.db
      .prepare("UPDATE messages SET read_at = ? WHERE id = ?")
      .bind(new Date(), message_id)
      .run();
    return result.success;
  }
}
