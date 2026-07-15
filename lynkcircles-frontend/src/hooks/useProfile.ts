import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "@/lib/axios";
import { AUTH_QUERY_KEY } from "@/hooks/useAuthUser";
import type { UserProfile, UserSummary } from "@/types/user";

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

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  username?: string;
  headline?: string;
  bio?: string;
  profilePicture?: string;
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
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error));
    },
  });
};

export type { UserProfile, UserSummary };
