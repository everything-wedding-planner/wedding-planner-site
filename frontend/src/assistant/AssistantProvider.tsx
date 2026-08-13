import React, { useCallback, useRef, useState } from "react";
import { getAssistantResponse } from "./assistantService";
import { AssistantContext } from "./useAssistant";
import type { AssistantReply, ChatMessage } from "./types";

let messageSeq = 0;
function createMessageId() {
  messageSeq += 1;
  return `assistant-msg-${messageSeq}`;
}

function replyToText(reply: AssistantReply): string {
  return reply.blocks
    .map((block) => {
      if (block.type === "bullets") return block.items?.join("\n") ?? "";
      return block.text ?? "";
    })
    .join("\n\n");
}

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const isTypingRef = useRef(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    launcherRef.current?.focus();
  }, []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const sendMessage = useCallback((text: string) => {
    const content = text.trim();
    if (!content || isTypingRef.current) return;
    isTypingRef.current = true;
    setIsTyping(true);
    setMessages((prev) => [
      ...prev,
      {
        id: createMessageId(),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      },
    ]);
    setShowSuggestions(false);
    void getAssistantResponse(content)
      .then((reply) => {
        setMessages((prev) => [
          ...prev,
          {
            id: createMessageId(),
            role: "assistant",
            content: replyToText(reply),
            blocks: reply.blocks,
            createdAt: new Date().toISOString(),
          },
        ]);
      })
      .finally(() => {
        isTypingRef.current = false;
        setIsTyping(false);
      });
  }, []);

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        open,
        close,
        toggle,
        messages,
        showSuggestions,
        isTyping,
        sendMessage,
        launcherRef,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};
