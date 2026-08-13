import { useCallback, useEffect, useState } from "react";
import type { conversationResponseDTO } from "../../../src/DTO/Communication/conversationDTO";
import { useApi } from "./useApi";

export function useConversationsByReference(
  referenceType: string,
  referenceId: number | null,
) {
  const api = useApi();
  const [conversations, setConversations] = useState<conversationResponseDTO[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!referenceId) {
      setConversations([]);
      setIsLoading(false);
      return;
    }
    const { data, error } = await api.get<conversationResponseDTO[]>(
      `/api/conversations/reference/${referenceType}/${referenceId}`,
    );
    if (error) {
      setError("Failed to load conversations");
    } else {
      setConversations(data ?? []);
    }
    setIsLoading(false);
  }, [api, referenceType, referenceId]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setError(null);
    void fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    void Promise.resolve().then(reload);
  }, [reload]);

  return { conversations, isLoading, error, refetch: reload };
}
