import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAssistant } from "./useAssistant";
import AssistantMessageList from "./AssistantMessageList";
import AssistantSuggestionChips from "./AssistantSuggestionChips";
import AssistantCompose from "./AssistantCompose";

export default function AssistantPanel() {
  const { isOpen, close, messages, isTyping, sendMessage, showSuggestions } =
    useAssistant();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label="AI assistant"
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={`fixed top-0 right-0 z-50 flex h-dvh w-[90vw] max-w-[384px] flex-col border-l border-stone-200 bg-white shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none md:w-96 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <header className="flex items-center justify-between border-b border-stone-200 bg-stone-50 p-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-stone-900">Assistant</h2>
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
              AI (mock)
            </span>
          </div>
          <p className="mt-0.5 text-xs text-stone-500">
            Mock responses — real AI coming soon
          </p>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={close}
          aria-label="Close AI assistant"
          className="rounded-md p-1 text-stone-400 hover:text-stone-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1"
        >
          <X size={18} />
        </button>
      </header>

      <AssistantMessageList messages={messages} isTyping={isTyping} />

      {showSuggestions && <AssistantSuggestionChips onSelect={sendMessage} />}

      <div className="border-t border-stone-200 p-4">
        <AssistantCompose onSend={sendMessage} disabled={isTyping} />
      </div>
    </aside>
  );
}
