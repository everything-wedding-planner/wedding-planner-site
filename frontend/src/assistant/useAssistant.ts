import { createContext, useContext } from "react";
import type { RefObject } from "react";
import type { ChatMessage } from "./types";

export interface AssistantContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  messages: ChatMessage[];
  showSuggestions: boolean;
  isTyping: boolean;
  sendMessage: (text: string) => void;
  launcherRef: RefObject<HTMLButtonElement | null>;
}

export const AssistantContext = createContext<AssistantContextType | undefined>(
  undefined,
);

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context)
    throw new Error("useAssistant must be used within an AssistantProvider");
  return context;
};
