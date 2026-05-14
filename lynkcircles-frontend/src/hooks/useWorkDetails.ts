import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "@/lib/axios";
import type { CreateWorkDetailInput, WorkDetail } from "@/types/workDetail";

const workDetailsKey = (username: string | undefined) =>
  ["workDetails", username] as const;

export const useWorkDetails = (username: string | undefined) =>
  useQuery<WorkDetail[]>({
    queryKey: workDetailsKey(username),
    queryFn: async () => {
      if (!username) return [];
      const { data } = await api.get<WorkDetail[]>(`/workdetails/${username}`);
      return data ?? [];
    },
    enabled: !!username,
  });

export const useCreateWorkDetail = (username: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateWorkDetailInput) => {
      await api.post("/workdetails", input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workDetailsKey(username) });
      toast.success("Service added");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
};

export const useDeleteWorkDetail = (username: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/workdetails/delete/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workDetailsKey(username) });
      toast.success("Service removed");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
};
