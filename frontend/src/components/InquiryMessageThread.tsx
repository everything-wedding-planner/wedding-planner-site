import { useConversationsByReference } from "../hooks/useConversationsByReference";
import MessageThread from "./MessageThread";

interface InquiryMessageThreadProps {
  inquiryId: number;
  referenceType: "vendor" | "venue";
  referenceId: number;
  clientName?: string;
}

/**
 * Resolves the conversation for a given inquiry (matched by inquiry id) from
 * the reference's conversation list, then renders the shared MessageThread.
 */
export default function InquiryMessageThread({
  inquiryId,
  referenceType,
  referenceId,
  clientName,
}: InquiryMessageThreadProps) {
  const { conversations, isLoading } = useConversationsByReference(
    referenceType,
    referenceId,
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin h-5 w-5 border-2 border-rose-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const conversation = conversations.find((c) => c.inquiry === inquiryId);

  if (!conversation) {
    return (
      <p className="text-sm text-stone-400 italic">
        No conversation for this inquiry
      </p>
    );
  }

  return (
    <MessageThread
      conversationId={conversation.id}
      clientName={clientName}
      maxHeightClass="max-h-[200px] sm:max-h-[260px]"
    />
  );
}
