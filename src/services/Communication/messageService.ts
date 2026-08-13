import { D1Database } from "@cloudflare/workers-types";
import {
  MessageModel,
  messageRow,
} from "../../models/Communication/messageModel";
import {
  messageResponseDTO,
  toMessageResponseDTO,
} from "../../DTO/Communication/messageDTO";

export class MessageService {
  private messageModel: MessageModel;

  constructor(db: D1Database) {
    this.messageModel = new MessageModel(db);
  }

  async getMessagesByConversationId(
    conversation_id: number,
  ): Promise<messageResponseDTO[]> {
    const messages =
      await this.messageModel.getMessagesByConversationId(conversation_id);

    let messageDTO: messageResponseDTO[];

    messageDTO = messages.map((message: messageRow) =>
      toMessageResponseDTO(message),
    );
    return messageDTO;
  }

  async getLastMessageByConversationId(
    conversation_id: number,
  ): Promise<messageResponseDTO | null> {
    console.log("Fetching last message for conversation_id:", conversation_id);
    const message =
      await this.messageModel.getLastMessageByConversationId(conversation_id);

    if (!message) {
      return null;
    }

    return toMessageResponseDTO(message);
  }

  async getMessagesByConversationIdSince(
    conversation_id: number,
    since: string,
  ): Promise<messageResponseDTO[]> {
    const messages = await this.messageModel.getMessagesByConversationIdSince(
      conversation_id,
      since,
    );

    return messages.map((message: messageRow) => toMessageResponseDTO(message));
  }

  async getMessageById(message_id: number): Promise<messageResponseDTO | null> {
    const message: messageRow | null =
      await this.messageModel.getMessageById(message_id);
    return message ? toMessageResponseDTO(message) : null;
  }

  async createMessage(
    conversation_id: number,
    sender_id: number,
    content: string,
  ): Promise<Boolean> {
    return this.messageModel.createMessage(conversation_id, sender_id, content);
  }

  async markMessageAsRead(message_id: number): Promise<Boolean> {
    return this.messageModel.markMessageAsRead(message_id);
  }
}
