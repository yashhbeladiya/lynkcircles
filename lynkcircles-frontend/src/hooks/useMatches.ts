import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { JobPost } from "@/types/jobPost";
import type { UserProfile } from "@/types/user";

export interface JobMatch {
  kind: "job";
  score: number;
  matchedTerms: string[];
  job: JobPost & { author: Pick<UserProfile, "firstName" | "lastName" | "username" | "profilePicture" | "verified"> };
}

export interface WorkerMatch {
  kind: "worker";
  score: number;
  matchedTerms: string[];
  worker: UserProfile;
}

export interface MatchResponse {
  role: "Worker" | "Client";
  anchor?: JobPost | null;
  matches: (JobMatch | WorkerMatch)[];
}

export const useMatches = () =>
  useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data } = await api.get<MatchResponse>("/matches");
      return data;
    },
    staleTime: 5 * 60_000,
  });
