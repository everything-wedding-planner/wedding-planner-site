import { Bot } from "lucide-react";
import type { ChatMessage } from "./types";
import AssistantMessageBubble from "./AssistantMessageBubble";
import TypingIndicator from "./TypingIndicator";

interface AssistantMessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

const HINTS = [
  "Summarize your recent conversations",
  "Surface upcoming deadlines and follow-ups",
  "Explain how your listings are performing",
];

export default function AssistantMessageList({
  messages,
  isTyping,
}: AssistantMessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 overflow-y-auto px-4 py-3 text-center">
        <Bot size={32} className="text-stone-300" aria-hidden="true" />
        <p className="text-sm font-medium text-stone-900">
          How can I help you today?
        </p>
        <ul className="space-y-1 text-xs text-stone-500">
          {HINTS.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      role="log"
      aria-live="polite"
      aria-busy={isTyping}
      className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
    >
      {messages.map((message) => (
        <AssistantMessageBubble key={message.id} message={message} />
      ))}
      {isTyping && <TypingIndicator />}
    </div>
  );
}
