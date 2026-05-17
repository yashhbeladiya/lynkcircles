import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "@/lib/axios";
import { AUTH_QUERY_KEY } from "@/hooks/useAuthUser";
import type { AuthUser, UserSummary } from "@/types/user";

const SAVED_KEY = ["users", "saved"] as const;

/**
 * The current user's saved-Workers list, populated. Used by the
 * Network page's Saved tab and by ProfileHeader to determine the
 * Save button's flipped state.
 */
export const useSavedWorkers = (enabled = true) =>
  useQuery<UserSummary[]>({
    queryKey: SAVED_KEY,
    queryFn: async () => {
      const { data } = await api.get<UserSummary[]>("/users/saved");
      return data ?? [];
    },
    enabled,
  });

/**
 * Cheap "is this user saved?" helper that reads from the auth user
 * cache instead of triggering the saved-list query. Use this on
 * profile headers so the button doesn't wait on a separate fetch.
 */
export const useIsSaved = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMemo(() => {
    if (!userId) return false;
    const me = queryClient.getQueryData<AuthUser | null>(AUTH_QUERY_KEY);
    return me?.savedWorkers?.includes(userId) ?? false;
  }, [queryClient, userId]);
};

/**
 * Toggle save state. Optimistic on the auth-user cache (so the
 * button flips immediately) and the saved-list cache (so the
 * Network page Saved tab updates without a refetch).
 */
export const useToggleSaveWorker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.post<{ saved: boolean }>(
        `/users/save/${userId}`
      );
      return data;
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: AUTH_QUERY_KEY });
      const previousAuth = queryClient.getQueryData<AuthUser | null>(AUTH_QUERY_KEY);
      const previousSaved = queryClient.getQueryData<UserSummary[]>(SAVED_KEY);

      // Flip the auth user's savedWorkers list immediately.
      queryClient.setQueryData<AuthUser | null>(AUTH_QUERY_KEY, (old) => {
        if (!old) return old;
        const existing = old.savedWorkers ?? [];
        const had = existing.includes(userId);
        return {
          ...old,
          savedWorkers: had
            ? existing.filter((id) => id !== userId)
            : [...existing, userId],
        };
      });

      return { previousAuth, previousSaved };
    },
    onError: (error, _id, ctx) => {
      if (ctx?.previousAuth !== undefined)
        queryClient.setQueryData(AUTH_QUERY_KEY, ctx.previousAuth);
      if (ctx?.previousSaved !== undefined)
        queryClient.setQueryData(SAVED_KEY, ctx.previousSaved);
      toast.error(apiErrorMessage(error));
    },
    onSuccess: (data) => {
      toast.success(data.saved ? "Saved" : "Removed from saved");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_KEY });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
};
