import type { AssistantReplyBlock, ChatMessage } from "./types";

interface AssistantMessageBubbleProps {
  message: ChatMessage;
}

function renderBlock(block: AssistantReplyBlock, key: number) {
  switch (block.type) {
    case "heading":
      return (
        <p key={key} className="font-semibold text-stone-900">
          {block.text}
        </p>
      );
    case "bullets":
      return (
        <ul key={key} className="list-disc space-y-0.5 pl-4 text-stone-700">
          {block.items?.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    default:
      return (
        <p key={key} className="text-stone-700">
          {block.text}
        </p>
      );
  }
}

export default function AssistantMessageBubble({
  message,
}: AssistantMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[85%] space-y-1.5 px-3 py-1.5 text-sm ${
          isUser
            ? "bg-rose-600 text-white rounded-2xl rounded-br-sm"
            : "bg-white border border-stone-200 text-stone-900 rounded-2xl rounded-bl-sm"
        }`}
      >
        {isUser || !message.blocks
          ? message.content
          : message.blocks.map((block, index) =>
              renderBlock(block, index),
            )}
      </div>
      <span
        className={`text-[10px] text-stone-400 mt-0.5 ${
          isUser ? "text-right" : "text-left"
        }`}
      >
        {new Date(message.createdAt).toLocaleString()}
      </span>
    </div>
  );
}
