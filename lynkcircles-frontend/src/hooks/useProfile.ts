import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "@/lib/axios";
import { AUTH_QUERY_KEY } from "@/hooks/useAuthUser";
import type {
  ConnectionRequest,
  ConnectionStatus,
  UserProfile,
  UserSummary,
} from "@/types/user";
import type { Post, FeedResponse } from "@/types/post";

export const useConnectionRequests = () =>
  useQuery<ConnectionRequest[]>({
    queryKey: ["connections", "requests"],
    queryFn: async () => {
      const { data } = await api.get<ConnectionRequest[]>("/connections/requests");
      return data ?? [];
    },
  });

export const profileKey = (username: string | undefined) =>
  ["profile", username] as const;

export const useProfile = (username: string | undefined) =>
  useQuery<UserProfile>({
    queryKey: profileKey(username),
    queryFn: async () => {
      if (!username) throw new Error("missing username");
      const { data } = await api.get<UserProfile>(`/users/profile/${username}`);
      return data;
    },
    enabled: !!username,
  });

export const useUserPosts = (username: string | undefined) =>
  useQuery<Post[]>({
    queryKey: ["userPosts", username],
    queryFn: async () => {
      if (!username) return [];
      const { data } = await api.get<FeedResponse>(`/feed/user/${username}`);
      return data.posts ?? [];
    },
    enabled: !!username,
  });

/**
 * Edit-profile mutation. The backend's updateProfile takes a partial
 * payload (only changed fields), runs base64 → cloudinary for the
 * image fields, and returns the updated user. We mirror the result
 * into both the per-username profile cache and the auth-user cache so
 * the avatar/banner update everywhere instantly.
 */
export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  username?: string;
  headline?: string;
  bio?: string;
  /** Base64 data URI from a FileReader read. */
  profilePicture?: string;
  /** Base64 data URI from a FileReader read. */
  bannerImage?: string;
  socialLinks?: UserProfile["socialLinks"];
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateProfileInput) => {
      const { data } = await api.put<UserProfile>("/users/profile", payload);
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, updated);
      queryClient.setQueryData(profileKey(updated.username), updated);
      // If the username changed, the old cache key is now orphaned.
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error));
    },
  });
};

export const useConnectionStatus = (userId: string | undefined, enabled = true) =>
  useQuery<ConnectionStatus>({
    queryKey: ["connectionStatus", userId],
    queryFn: async () => {
      if (!userId) throw new Error("missing userId");
      const { data } = await api.get<ConnectionStatus>(
        `/connections/status/${userId}`
      );
      return data;
    },
    enabled: enabled && !!userId,
  });

const invalidateConnectionState = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["connectionStatus"] });
  queryClient.invalidateQueries({ queryKey: ["users"] });
  queryClient.invalidateQueries({ queryKey: ["profile"] });
  queryClient.invalidateQueries({ queryKey: ["connections"] });
  queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
};

export const useSendConnectionRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.post(`/connections/request/${userId}`);
    },
    onSuccess: () => {
      toast.success("Connection request sent");
      invalidateConnectionState(queryClient);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
};

export const useAcceptConnectionRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      await api.put(`/connections/requests/${requestId}/accept`);
    },
    onSuccess: () => {
      toast.success("Connection accepted");
      invalidateConnectionState(queryClient);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
};

export const useRejectConnectionRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      await api.put(`/connections/requests/${requestId}/reject`);
    },
    onSuccess: () => {
      toast.success("Request rejected");
      invalidateConnectionState(queryClient);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
};

export const useDisconnect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      await api.delete(`/users/disconnect/${username}`);
    },
    onSuccess: () => {
      toast.success("Removed connection");
      invalidateConnectionState(queryClient);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
};

export type { UserProfile, UserSummary };
