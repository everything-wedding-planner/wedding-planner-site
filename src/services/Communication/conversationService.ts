import { D1Database } from "@cloudflare/workers-types";
import {
  ConversationModel,
  conversationRow,
} from "../../models/Communication/conversationModel";
import { messageResponseDTO } from "../../DTO/Communication/messageDTO";
import {
  toConversationResponseDTO,
  conversationResponseDTO,
} from "../../DTO/Communication/conversationDTO";

import { MessageService } from "./messageService";

export class ConversationService {
  private conversationModel: ConversationModel;
  private db: D1Database;

  constructor(db: D1Database) {
    this.conversationModel = new ConversationModel(db);
    this.db = db;
  }

  async getConversationById(
    id: number,
  ): Promise<conversationResponseDTO | null> {
    const conversation = await this.conversationModel.getConversationById(id);
    const messageService = new MessageService(this.db);
    if (!conversation) {
      return null;
    }

    const messages: messageResponseDTO[] =
      await messageService.getMessagesByConversationId(conversation.id);

    return toConversationResponseDTO(conversation, messages, this.db);
  }

  async getConversationsByReference(
    reference_id: number,
    reference_type: string,
  ): Promise<conversationResponseDTO[]> {
    const conversations =
      await this.conversationModel.getConversationsByReference(
        reference_id,
        reference_type,
      );
    const messageService = new MessageService(this.db);

    const conversationDTOs: conversationResponseDTO[] = [];
    for (const conversation of conversations) {
      const messages: messageResponseDTO[] =
        await messageService.getMessagesByConversationId(conversation.id);
      const conversationDTO = await toConversationResponseDTO(
        conversation,
        messages,
        this.db,
      );
      conversationDTOs.push(conversationDTO);
    }

    return conversationDTOs;
  }

  async createConversation(
    client_id: number,
    reference_id: number,
    reference_type: string,
  ): Promise<Boolean> {
    return this.conversationModel.createConversation(
      client_id,
      reference_id,
      reference_type,
    );
  }

  async updateConversationStatus(
    conversationId: number,
    newStatus: string,
  ): Promise<boolean> {
    return this.conversationModel.updateConversationStatus(
      conversationId,
      newStatus,
    );
  }
}
