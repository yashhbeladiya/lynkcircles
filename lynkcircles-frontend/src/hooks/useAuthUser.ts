import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { api } from "@/lib/axios";
import type { AuthUser } from "@/types/user";

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

/**
 * Resolves the current authenticated user. Returns `null` (not undefined)
 * on 401 so consumers can distinguish "not logged in" from "still
 * loading". Any other error bubbles up as a query error.
 */
export const useAuthUser = () =>
  useQuery<AuthUser | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        const { data } = await api.get<AuthUser>("/auth/me");
        return data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    // Auth state is the foundation of every page — keep it fresh.
    staleTime: 60_000,
  });

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: ["feed"] });
      queryClient.removeQueries({ queryKey: ["conversations"] });
      queryClient.removeQueries({ queryKey: ["messages"] });
    },
  });
};
