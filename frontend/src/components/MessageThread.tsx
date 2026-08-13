import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { messageResponseDTO } from "../../../src/DTO/Communication/messageDTO";
import { useMessageThread } from "../hooks/useMessageThread";
import { useAuth } from "../AuthProvider";
import MessageBubble from "./MessageBubble";
import MessageCompose from "./MessageCompose";

export interface MessageThreadProps {
  conversationId: number;
  clientName?: string;
  /** Class for the scrollable list. Defaults to the inline thread height. */
  maxHeightClass?: string;
  /** When provided (inbox pane), renders a close button. */
  onConversationClosed?: () => void;
  /** Fired after a message is successfully sent (inbox refreshes the list). */
  onMessageSent?: () => void;
}

const SENDER_GAP_MS = 5 * 60 * 1000;

export default function MessageThread({
  conversationId,
  clientName,
  maxHeightClass = "max-h-[260px]",
  onConversationClosed,
  onMessageSent,
}: MessageThreadProps) {
  const { userId } = useAuth();
  const currentUserId = userId ? Number(userId) : null;
  const { messages, isLoading, error, isPolling, refetch, send, markRead } =
    useMessageThread(conversationId, { enabled: true });

  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  // Mark newest unread other-party messages as read once they render.
  useEffect(() => {
    markRead();
  }, [messages, markRead]);

  // Auto-scroll to bottom on load and on new messages — only if already at
  // the bottom so we don't yank the user away from history.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && isNearBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    isNearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 48;
  };

  const showSenderLabel = (index: number) => {
    const message = messages[index];
    const prev = messages[index - 1];
    if (!prev) return true;
    if (prev.sender_id !== message.sender_id) return true;
    const gap =
      new Date(message.created_at).getTime() -
      new Date(prev.created_at).getTime();
    return gap > SENDER_GAP_MS;
  };

  const isSelf = (message: messageResponseDTO) =>
    currentUserId !== null && message.sender_id === currentUserId;

  const senderLabel = (message: messageResponseDTO) =>
    isSelf(message) ? "You" : clientName || "Client";

  const handleSend = async (content: string) => {
    await send(content);
    onMessageSent?.();
  };

  return (
    <div className="flex flex-col h-full bg-stone-100 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2 min-h-[20px]">
        {isPolling && (
          <span
            className="flex items-center gap-1 text-[10px] text-stone-500"
            aria-live="polite"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            Live
          </span>
        )}
        {onConversationClosed && (
          <button
            type="button"
            onClick={onConversationClosed}
            aria-label="Close conversation"
            className="text-stone-400 hover:text-stone-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin h-5 w-5 border-2 border-rose-600 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="py-6 text-center">
          <p className="text-sm text-red-600">Failed to load messages</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="text-xs text-rose-600 hover:underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : messages.length === 0 ? (
        <p className="text-sm text-stone-400 italic py-6 text-center">
          No messages yet. Send the first message.
        </p>
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
          className={`flex-1 overflow-y-auto space-y-2 pr-1 ${maxHeightClass}`}
        >
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              self={isSelf(message)}
              senderLabel={
                showSenderLabel(index) ? senderLabel(message) : undefined
              }
              createdAt={message.created_at.toString()}
            />
          ))}
        </div>
      )}

      <MessageCompose onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
