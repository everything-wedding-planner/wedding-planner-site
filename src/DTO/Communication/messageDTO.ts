import type { messageRow } from "../../models/Communication/messageModel";
import { UserModel } from "../../models/Users/userModel";

export interface messageResponseDTO {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  read_at: Date | null;
  created_at: Date;
}

export function toMessageResponseDTO(message: messageRow): messageResponseDTO {
  return {
    id: message.id,
    conversation_id: message.conversation_id,
    sender_id: message.sender_id,
    content: message.content,
    read_at: message.read_at ? new Date(message.read_at) : null,
    created_at: new Date(message.created_at),
  };
}
