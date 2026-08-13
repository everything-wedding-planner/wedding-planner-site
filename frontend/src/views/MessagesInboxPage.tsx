import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import MessageThread from "../components/MessageThread";
import { useConversationsByReference } from "../hooks/useConversationsByReference";
import { useDashboardData } from "../components/DashboardDataProvider";
import { useAuth } from "../AuthProvider";
import type { conversationResponseDTO } from "../../../src/DTO/Communication/conversationDTO";

type ReferenceType = "vendor" | "venue";

const LIST_REFRESH_MS = 30000;

export default function MessagesInboxPage() {
  const { vendors, venues } = useDashboardData();
  const { userId } = useAuth();
  const currentUserId = userId ? Number(userId) : null;
  const [searchParams, setSearchParams] = useSearchParams();

  const refType = (searchParams.get("ref_type") as ReferenceType) || "vendor";
  const refIdParam = searchParams.get("ref_id");
  const refId = refIdParam ? Number(refIdParam) : null;

  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);

  const references = refType === "vendor" ? vendors : venues;

  const { conversations, isLoading, refetch } = useConversationsByReference(
    refType,
    refId,
  );

  // Slower refresh cadence for the conversation list.
  useEffect(() => {
    if (!refId) return;
    const intervalId = setInterval(() => void refetch(), LIST_REFRESH_MS);
    return () => clearInterval(intervalId);
  }, [refId, refetch]);

  const setReference = (type: ReferenceType, id: number | null) => {
    const params = new URLSearchParams();
    params.set("ref_type", type);
    if (id) params.set("ref_id", String(id));
    setSearchParams(params, { replace: true });
    setActiveConversationId(null);
  };

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-stone-900">Messages</h1>

      <Card className="p-0 sm:p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">
          {/* Left pane: picker + conversation list */}
          <div className="border-b md:border-b-0 md:border-r border-stone-200">
            <div className="p-4 border-b border-stone-200">
              <ReferencePicker
                refType={refType}
                refId={refId}
                references={references ?? []}
                referenceLabel={refType === "vendor" ? "Vendor" : "Venue"}
                onTypeChange={(type) => setReference(type, null)}
                onReferenceChange={(id) => setReference(refType, id)}
              />
            </div>
            {refId === null ? (
              <p className="text-sm text-stone-400 italic p-4 text-center">
                Select a vendor or venue
              </p>
            ) : isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin h-5 w-5 border-2 border-rose-600 border-t-transparent rounded-full" />
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                currentUserId={currentUserId}
                activeConversationId={activeConversationId}
                onSelect={setActiveConversationId}
              />
            )}
          </div>

          {/* Right pane: active conversation */}
          <div className="h-[50vh] md:h-[60vh]">
            <ConversationPane
              conversation={activeConversation ?? null}
              onClose={() => setActiveConversationId(null)}
              onMessageSent={() => void refetch()}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

interface ReferencePickerProps {
  refType: ReferenceType;
  refId: number | null;
  references: { id: number; name: string }[];
  referenceLabel: string;
  onTypeChange: (type: ReferenceType) => void;
  onReferenceChange: (id: number | null) => void;
}

function ReferencePicker({
  refType,
  refId,
  references,
  referenceLabel,
  onTypeChange,
  onReferenceChange,
}: ReferencePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="ref-type"
            className="text-xs font-medium text-stone-500 uppercase tracking-wider"
          >
            Type
          </label>
          <select
            id="ref-type"
            value={refType}
            onChange={(e) => onTypeChange(e.target.value as ReferenceType)}
            className="border border-stone-200 rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="vendor">Vendor</option>
            <option value="venue">Venue</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="ref-select"
            className="text-xs font-medium text-stone-500 uppercase tracking-wider"
          >
            {referenceLabel}
          </label>
          <select
            id="ref-select"
            value={refId ?? ""}
            onChange={(e) =>
              onReferenceChange(e.target.value ? Number(e.target.value) : null)
            }
            className="border border-stone-200 rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="">Select {referenceLabel}</option>
            {references.map((ref) => (
              <option key={ref.id} value={ref.id}>
                {ref.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

interface ConversationListProps {
  conversations: conversationResponseDTO[];
  currentUserId: number | null;
  activeConversationId: number | null;
  onSelect: (id: number) => void;
}

function ConversationList({
  conversations,
  currentUserId,
  activeConversationId,
  onSelect,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <p className="text-sm text-stone-400 italic p-4 text-center">
        No conversations yet
      </p>
    );
  }

  const { unreadConversationsCount, updateUnreadConversationsCount } =
    useDashboardData();

  return (
    <ul className="divide-y divide-stone-100 overflow-y-auto max-h-[300px] md:max-h-[45vh]">
      {conversations.map((conversation) => {
        const lastMessage =
          conversation.messages[conversation.messages.length - 1];
        const isActive = conversation.id === activeConversationId;
        const [hasUnread, setHasUnread] = useState(
          lastMessage !== undefined &&
            currentUserId !== null &&
            lastMessage.sender_id !== currentUserId &&
            lastMessage.read_at === null,
        );

        return (
          <li key={conversation.id}>
            <button
              type="button"
              onClick={() => {
                if (hasUnread) {
                  updateUnreadConversationsCount(unreadConversationsCount - 1);
                  setHasUnread(false); // Update the local state to prevent double decrement
                }
                onSelect(conversation.id);
              }}
              className={`w-full text-left px-4 py-3 flex items-start gap-2 hover:bg-stone-50 ${
                isActive ? "bg-rose-50" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-stone-900 truncate">
                    {conversation.client?.username ?? "Client"}
                  </p>
                  <Badge variant={conversation.status}>
                    {conversation.status}
                  </Badge>
                </div>
                <p className="text-xs text-stone-500 truncate mt-0.5">
                  {lastMessage?.content ?? "No messages yet"}
                </p>
              </div>
              {hasUnread && (
                <span
                  className="mt-1.5 h-2 w-2 rounded-full bg-rose-600 shrink-0"
                  aria-label="Unread"
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

interface ConversationPaneProps {
  conversation: conversationResponseDTO | null;
  onClose: () => void;
  onMessageSent: () => void;
}

function ConversationPane({
  conversation,
  onClose,
  onMessageSent,
}: ConversationPaneProps) {
  if (!conversation) {
    return (
      <p className="text-sm text-stone-400 italic py-12 text-center">
        Select a conversation
      </p>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-900 truncate">
            {conversation.client?.username ?? "Client"}
          </p>
          <p className="text-xs text-stone-500 truncate">
            {conversation.reference_object?.name ?? ""}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={conversation.status}>{conversation.status}</Badge>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close conversation"
            className="text-stone-400 hover:text-stone-600"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 px-3 pt-3 flex flex-col">
        <MessageThread
          conversationId={conversation.id}
          clientName={conversation.client?.username}
          maxHeightClass="flex-1 min-h-0"
          onConversationClosed={onClose}
          onMessageSent={onMessageSent}
        />
      </div>
    </div>
  );
}
