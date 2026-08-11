import type { messageRow } from "../../models/Communication/messageModel";

export interface messageResponseDTO {
  id: number;
  conversation_id: number;
  message_role: string;
  content: string;
  read_at: Date | null;
  created_at: Date;
}

export function toMessageResponseDTO(message: messageRow): messageResponseDTO {
  return {
    id: message.id,
    conversation_id: message.conversation_id,
    message_role: message.message_role,
    content: message.content,
    read_at: message.read_at ? new Date(message.read_at) : null,
    created_at: new Date(message.created_at),
  };
}
