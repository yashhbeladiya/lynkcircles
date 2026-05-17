import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "@/lib/axios";
import type {
  CreateJobPostInput,
  JobPost,
  UpdateJobPostInput,
} from "@/types/jobPost";
import type { UserSummary } from "@/types/user";

export const JOBS_KEYS = {
  open: ["jobs", "open"] as const,
  mine: ["jobs", "mine"] as const,
  applications: ["jobs", "applications"] as const,
  detail: (id: string | undefined) => ["jobs", "detail", id] as const,
  applicants: (id: string | undefined) => ["jobs", "applicants", id] as const,
};

const invalidateJobs = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["jobs"] });
};

/* -------- Lists -------- */

export const useOpenJobs = () =>
  useQuery<JobPost[]>({
    queryKey: JOBS_KEYS.open,
    queryFn: async () => {
      const { data } = await api.get<JobPost[]>("/works");
      return data ?? [];
    },
  });

export const useMyJobPosts = (enabled = true) =>
  useQuery<JobPost[]>({
    queryKey: JOBS_KEYS.mine,
    queryFn: async () => {
      const { data } = await api.get<JobPost[]>("/works/pastWork");
      return data ?? [];
    },
    enabled,
  });

export const useMyApplications = (enabled = true) =>
  useQuery<JobPost[]>({
    queryKey: JOBS_KEYS.applications,
    queryFn: async () => {
      const { data } = await api.get<JobPost[]>("/works/myapplications");
      return data ?? [];
    },
    enabled,
  });

export const useJobPost = (id: string | undefined) =>
  useQuery<JobPost>({
    queryKey: JOBS_KEYS.detail(id),
    queryFn: async () => {
      if (!id) throw new Error("missing job id");
      const { data } = await api.get<JobPost>(`/works/${id}`);
      return data;
    },
    enabled: !!id,
  });

export const useJobApplicants = (id: string | undefined, enabled = true) =>
  useQuery<UserSummary[]>({
    queryKey: JOBS_KEYS.applicants(id),
    queryFn: async () => {
      if (!id) return [];
      const { data } = await api.get<UserSummary[]>(`/works/${id}/applicants`);
      return data ?? [];
    },
    enabled: enabled && !!id,
  });

/* -------- Mutations -------- */

export const useCreateJobPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateJobPostInput) => {
      await api.post("/works/create", input);
    },
    onSuccess: () => {
      invalidateJobs(queryClient);
      toast.success("Job posted");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
};

export const useApplyForJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/works/${id}/apply`);
    },
    onSuccess: () => {
      invalidateJobs(queryClient);
      toast.success("Application sent");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
};

export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/works/${id}/withdraw`);
    },
    onSuccess: () => {
      invalidateJobs(queryClient);
      toast.success("Application withdrawn");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
};

export const useUpdateJobPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateJobPostInput & { id: string }) => {
      const { data } = await api.put<JobPost>(`/works/update/${id}`, input);
      return data;
    },
    onSuccess: () => {
      invalidateJobs(queryClient);
      toast.success("Job updated");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
};

export const useDeleteJobPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/works/delete/${id}`);
    },
    onSuccess: () => {
      invalidateJobs(queryClient);
      toast.success("Job removed");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
};

/* -------- Hiring flow -------- */

export const useHireApplicant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, workerId }: { jobId: string; workerId: string }) => {
      const { data } = await api.post<JobPost>(
        `/works/${jobId}/hire/${workerId}`
      );
      return data;
    },
    onSuccess: () => {
      invalidateJobs(queryClient);
      toast.success("Applicant hired — they've been notified.");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
};

export const useMarkJobComplete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await api.post<JobPost>(`/works/${jobId}/complete`);
      return data;
    },
    onSuccess: () => {
      invalidateJobs(queryClient);
      toast.success("Marked complete. Leave a review when you're ready.");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
};

export interface SubmitJobReviewInput {
  jobId: string;
  rating: number;
  review: string;
  /** Optional base64 data URIs uploaded to Cloudinary server-side. */
  images?: string[];
}

export const useSubmitJobReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, ...body }: SubmitJobReviewInput) => {
      const { data } = await api.post(`/works/${jobId}/review`, body);
      return data;
    },
    onSuccess: () => {
      invalidateJobs(queryClient);
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      toast.success("Review posted. Thanks for closing the loop.");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
};
