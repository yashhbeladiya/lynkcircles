import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { Message } from "@/types/message";

export const useMessages = (peerId: string | undefined) =>
  useQuery<Message[]>({
    queryKey: ["messages", peerId],
    queryFn: async () => {
      if (!peerId) return [];
      const { data } = await api.get<Message[]>(`/messages/${peerId}`);
      return data;
    },
    enabled: !!peerId,
    staleTime: 30_000,
  });
