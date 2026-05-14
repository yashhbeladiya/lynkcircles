import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { UserSummary } from "@/types/user";

/**
 * Current user's accepted connections — used in Messages to surface
 * people you can start a new chat with even if no conversation exists yet.
 */
export const useConnections = () =>
  useQuery<UserSummary[]>({
    queryKey: ["connections"],
    queryFn: async () => {
      const { data } = await api.get<UserSummary[]>("/connections");
      return data;
    },
    staleTime: 60_000,
  });
