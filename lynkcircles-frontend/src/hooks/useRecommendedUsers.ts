import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { UserSummary } from "@/types/user";

export const useRecommendedUsers = () =>
  useQuery<UserSummary[]>({
    queryKey: ["users", "suggestions"],
    queryFn: async () => {
      const { data } = await api.get<UserSummary[]>("/users/suggestions");
      return data ?? [];
    },
    staleTime: 5 * 60_000,
  });
