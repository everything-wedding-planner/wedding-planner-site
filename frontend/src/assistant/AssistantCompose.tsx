import { useRef, useState } from "react";
import { Send } from "lucide-react";

interface AssistantComposeProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function AssistantCompose({
  onSend,
  disabled = false,
}: AssistantComposeProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 36), 80)}px`;
  };

  const handleSend = () => {
    const content = value.trim();
    if (!content || disabled) return;
    onSend(content);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "";
    }
    textareaRef.current?.focus();
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          resize();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        rows={1}
        placeholder="Ask about your dashboard..."
        aria-label="Message input"
        disabled={disabled}
        className="min-h-[36px] max-h-[80px] flex-1 resize-none rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:bg-stone-50"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        aria-label="Send message"
        className="flex items-center justify-center rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        <Send size={16} />
      </button>
    </div>
  );
}
