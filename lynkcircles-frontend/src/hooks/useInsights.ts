import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface WorkerInsights {
  role: "Worker";
  totals: {
    saves: number;
    reviews: number;
    avgRating: number;
    completedJobs: number;
    applications: number;
    hires: number;
    hireRate: number;
  };
  messageVolume: { date: string; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
}

export interface ClientInsights {
  role: "Client";
  totals: {
    posts: number;
    open: number;
    inProgress: number;
    completed: number;
    applicants: number;
    hires: number;
    hireRate: number;
  };
  postsByStatus: { status: string; count: number }[];
  postsByDay: { date: string; count: number }[];
}

export type Insights = WorkerInsights | ClientInsights;

export const useInsights = () =>
  useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      const { data } = await api.get<Insights>("/insights");
      return data;
    },
    staleTime: 60_000,
  });
