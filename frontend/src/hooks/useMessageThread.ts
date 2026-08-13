import { useCallback, useEffect, useRef, useState } from "react";
import type { messageResponseDTO } from "../../../src/DTO/Communication/messageDTO";
import { useApi } from "./useApi";
import { useAuth } from "../AuthProvider";

export interface UseMessageThreadOptions {
  enabled: boolean;
}

const POLL_INTERVAL_MS = 6000;

function mergeMessages(
  prev: messageResponseDTO[],
  incoming: messageResponseDTO[],
): messageResponseDTO[] {
  const merged = [...prev];
  for (const message of incoming) {
    if (!merged.some((m) => m.id === message.id)) {
      merged.push(message);
    }
  }
  merged.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  return merged;
}

export function useMessageThread(
  conversationId: number,
  { enabled }: UseMessageThreadOptions,
) {
  const api = useApi();
  const { userId } = useAuth();
  const currentUserId = userId ? Number(userId) : null;
  const [messages, setMessages] = useState<messageResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const lastCreatedAtRef = useRef<string | null>(null);

  const fetchSince = useCallback(
    async (since?: string) => {
      const url = since
        ? `/api/conversations/${conversationId}/messages?since=${encodeURIComponent(since)}`
        : `/api/conversations/${conversationId}/messages`;
      const { data, error } = await api.get<{ messages: messageResponseDTO[] }>(
        url,
      );
      if (error) throw new Error(error);

      return data?.messages ?? [];
    },
    [api, conversationId],
  );

  /** Full reload — used on mount, conversation switch, and retry. */
  const load = useCallback(async () => {
    try {
      const fresh = await fetchSince();
      setMessages(fresh);

      lastCreatedAtRef.current =
        fresh.length > 0 ? fresh[fresh.length - 1].created_at.toString() : null;
    } catch (err) {
      setError("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [fetchSince]);

  /** Reset + reload, deferred so no state is set synchronously in an effect. */
  const reload = useCallback(() => {
    setMessages([]);
    lastCreatedAtRef.current = null;
    setIsLoading(true);
    setError(null);
    void load();
  }, [load]);

  // Initial load, reset whenever the conversation or enabled flag changes.
  useEffect(() => {
    if (!enabled) return;
    void Promise.resolve().then(reload);
  }, [enabled, reload]);

  // Lightweight polling: only new messages after the latest timestamp.
  useEffect(() => {
    if (!enabled) return;
    const tick = async () => {
      // Pause when the tab is hidden.
      if (document.hidden) return;
      try {
        const fresh = await fetchSince(lastCreatedAtRef.current ?? undefined);
        if (fresh.length > 0) {
          lastCreatedAtRef.current =
            fresh[fresh.length - 1].created_at.toString();
          setMessages((prev) => mergeMessages(prev, fresh));
        }
        setIsPolling(true);
      } catch {
        // Keep previous messages visible; the indicator disappears until the
        // next successful poll.
        setIsPolling(false);
      }
    };

    void tick();
    const intervalId = setInterval(() => void tick(), POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [enabled, conversationId, fetchSince]);

  /**
   * Send a message. Deliberately NOT optimistic — the server response is
   * fetched immediately (and the poll confirms it) so the list stays the
   * single source of truth.
   */
  const send = useCallback(
    async (content: string): Promise<void> => {
      if (currentUserId === null) throw new Error("Not signed in");
      const { error } = await api.post("/api/messages", {
        conversation_id: conversationId,
        sender_id: currentUserId,
        content,
      });
      if (error) throw new Error(error);
      try {
        const fresh = await fetchSince(lastCreatedAtRef.current ?? undefined);
        if (fresh.length > 0) {
          lastCreatedAtRef.current =
            fresh[fresh.length - 1].created_at.toString();
          setMessages((prev) => mergeMessages(prev, fresh));
        }
      } catch {
        // The next poll tick will pick it up; not a send failure.
      }
    },
    [api, conversationId, currentUserId, fetchSince],
  );

  /** Fire-and-forget: mark the newest unread message from the other party read. */
  const markRead = useCallback(() => {
    if (currentUserId === null) return;
    let newestUnread: messageResponseDTO | null = null;
    for (const message of messages) {
      if (message.sender_id !== currentUserId && message.read_at === null) {
        newestUnread = message;
      }
    }
    if (!newestUnread) return;
    void api
      .put<{ success: boolean }>(`/api/messages/${newestUnread.id}/read`, {})
      .then(({ data }) => {
        if (data?.success) {
          const id = newestUnread.id;
          setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, read_at: new Date() } : m)),
          );
        }
      });
  }, [api, currentUserId, messages]);

  return {
    messages,
    isLoading,
    error,
    isPolling,
    refetch: reload,
    send,
    markRead,
  };
}
