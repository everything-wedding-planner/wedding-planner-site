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

  async createMessage(
    conversation_id: number,
    message_role: string,
    content: string,
  ): Promise<Boolean> {
    return this.messageModel.createMessage(
      conversation_id,
      message_role,
      content,
    );
  }

  async markMessageAsRead(message_id: number): Promise<Boolean> {
    return this.messageModel.markMessageAsRead(message_id);
  }
}
