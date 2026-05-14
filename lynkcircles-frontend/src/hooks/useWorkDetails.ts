import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "@/lib/axios";
import type {
  AddPortfolioReviewInput,
  CreatePortfolioInput,
  CreateWorkDetailInput,
  JobPortfolio,
  WorkDetail,
} from "@/types/workDetail";

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

/* -------- Portfolio (completed jobs) -------- */

const portfolioKey = (username: string | undefined) =>
  ["portfolio", username] as const;

export const useUserPortfolio = (username: string | undefined) =>
  useQuery<JobPortfolio[]>({
    queryKey: portfolioKey(username),
    queryFn: async () => {
      if (!username) return [];
      const { data } = await api.get<JobPortfolio[]>(
        `/workdetails/portfolio/user/${username}`
      );
      return data ?? [];
    },
    enabled: !!username,
  });

export const useCreatePortfolio = (username: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePortfolioInput) => {
      const { data } = await api.post<JobPortfolio>("/workdetails/jobportfolio", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKey(username) });
      toast.success("Portfolio entry added");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
};

export const useDeletePortfolio = (username: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/workdetails/jobportfolio/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKey(username) });
      toast.success("Portfolio entry removed");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
};

export const useAddPortfolioReview = (username: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ portfolioId, ...rest }: AddPortfolioReviewInput) => {
      const { data } = await api.post<JobPortfolio>(
        `/workdetails/jobportfolio/${portfolioId}/review`,
        rest
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKey(username) });
      toast.success("Review posted");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
};
