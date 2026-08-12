export interface FrontendMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface FrontendConversation {
  id: number;
  client: { id: number; username: string } | null;
  inquiry: number;
  reference_object: { id: number; name: string } | null;
  messages: FrontendMessage[];
  status: string;
  created_at: string;
  updated_at: string;
}
