import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "@/lib/axios";
import type { AppNotification } from "@/types/notification";

const NOTIFICATIONS_KEY = ["notifications"] as const;

export const useNotifications = () =>
  useQuery<AppNotification[]>({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: async () => {
      const { data } = await api.get<AppNotification[]>("/notifications");
      return data ?? [];
    },
    // Refetch on a slow interval so the badge stays roughly fresh even
    // before we wire a socket-driven push. Cheap query (small payload).
    refetchInterval: 60_000,
  });

/**
 * Derived unread count. Cheap because it just filters the list already
 * cached for the page itself — no second network call.
 */
export const useUnreadNotificationCount = () => {
  const { data } = useNotifications();
  return useMemo(
    () => (data ? data.filter((n) => !n.read).length : 0),
    [data]
  );
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notifications/${id}/read`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const previous = queryClient.getQueryData<AppNotification[]>(NOTIFICATIONS_KEY);
      queryClient.setQueryData<AppNotification[]>(NOTIFICATIONS_KEY, (old) =>
        old?.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      return { previous };
    },
    onError: (error, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(NOTIFICATIONS_KEY, ctx.previous);
      toast.error(apiErrorMessage(error));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const previous = queryClient.getQueryData<AppNotification[]>(NOTIFICATIONS_KEY);
      queryClient.setQueryData<AppNotification[]>(NOTIFICATIONS_KEY, (old) =>
        old?.filter((n) => n._id !== id)
      );
      return { previous };
    },
    onError: (error, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(NOTIFICATIONS_KEY, ctx.previous);
      toast.error(apiErrorMessage(error));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
};

/**
 * Mark every unread notification as read. Done client-side as a loop
 * over the per-id endpoint because the backend doesn't expose a bulk
 * route — keeps this a one-commit change without a server roundtrip
 * pattern shift.
 */
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { data } = useNotifications();
  return useMutation({
    mutationFn: async () => {
      const unread = (data ?? []).filter((n) => !n.read);
      await Promise.all(
        unread.map((n) => api.put(`/notifications/${n._id}/read`))
      );
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const previous = queryClient.getQueryData<AppNotification[]>(NOTIFICATIONS_KEY);
      queryClient.setQueryData<AppNotification[]>(NOTIFICATIONS_KEY, (old) =>
        old?.map((n) => ({ ...n, read: true }))
      );
      return { previous };
    },
    onError: (error, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(NOTIFICATIONS_KEY, ctx.previous);
      toast.error(apiErrorMessage(error));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
};
