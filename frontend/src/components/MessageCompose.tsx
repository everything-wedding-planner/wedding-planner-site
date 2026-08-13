import { useRef, useState } from "react";
import { Send } from "lucide-react";

interface MessageComposeProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export default function MessageCompose({
  onSend,
  disabled = false,
}: MessageComposeProps) {
  const [value, setValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 36), 80)}px`;
  };

  const handleSend = async () => {
    const content = value.trim();
    if (!content || isSending || disabled) return;
    setIsSending(true);
    setError(null);
    try {
      await onSend(content);
      setValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "";
      }
      textareaRef.current?.focus();
    } catch {
      setError("Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  const canSend = value.trim().length > 0 && !isSending && !disabled;

  return (
    <div>
      <div className="flex gap-2 items-end mt-2 pt-2 border-t border-stone-200">
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
              void handleSend();
            }
          }}
          rows={1}
          placeholder="Type a message..."
          aria-label="Message input"
          className="flex-1 resize-none border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 min-h-[36px] max-h-[80px]"
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!canSend}
          aria-label="Send message"
          className="px-3 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
