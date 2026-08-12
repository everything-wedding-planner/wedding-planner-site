interface MessageBubbleProps {
  content: string;
  self: boolean;
  senderLabel?: string;
  createdAt: string;
}

export default function MessageBubble({
  content,
  self,
  senderLabel,
  createdAt,
}: MessageBubbleProps) {
  return (
    <div className={`flex flex-col ${self ? "items-end" : "items-start"}`}>
      {senderLabel && (
        <span className="text-xs font-medium text-stone-600 mb-0.5">
          {senderLabel}
        </span>
      )}
      <div
        className={`max-w-[75%] px-3 py-1.5 text-sm ${
          self
            ? "bg-rose-600 text-white rounded-2xl rounded-br-sm"
            : "bg-white border border-stone-200 text-stone-900 rounded-2xl rounded-bl-sm"
        }`}
      >
        {content}
      </div>
      <span
        className={`text-[10px] text-stone-400 mt-0.5 ${
          self ? "text-right" : "text-left"
        }`}
      >
        {new Date(createdAt).toLocaleString()}
      </span>
    </div>
  );
}
