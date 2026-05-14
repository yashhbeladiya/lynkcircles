import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { Conversation } from "@/types/message";

export const useConversations = (enabled = true) =>
  useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data } = await api.get<Conversation[]>("/messages/conversations");
      return data;
    },
    enabled,
    staleTime: 15_000,
  });
