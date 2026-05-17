import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

interface CriterionStatus {
  met: boolean;
  have: number;
  need: number;
}

export interface VerificationStatus {
  criteria: {
    portfolio: CriterionStatus;
    completedJobs: CriterionStatus;
    reviewCount: CriterionStatus;
    avgRating: CriterionStatus;
  };
  allMet: boolean;
}

/**
 * Verification progress for the requesting user. Refreshes on
 * window focus so a Worker who just received a review sees the
 * checklist update without manual refresh.
 */
export const useMyVerification = (enabled = true) =>
  useQuery<VerificationStatus>({
    queryKey: ["verification", "me"],
    queryFn: async () => {
      const { data } = await api.get<VerificationStatus>(
        "/users/me/verification"
      );
      return data;
    },
    enabled,
    refetchOnWindowFocus: true,
  });
