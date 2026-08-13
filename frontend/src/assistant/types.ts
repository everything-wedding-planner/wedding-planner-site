export interface AssistantReplyBlock {
  type: "heading" | "paragraph" | "bullets";
  text?: string;
  items?: string[];
}

export interface AssistantReply {
  blocks: AssistantReplyBlock[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  blocks?: AssistantReplyBlock[];
}
