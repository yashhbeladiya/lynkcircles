import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface WorkerPin {
  id: string;
  kind: "worker";
  lat: number;
  lng: number;
  firstName: string;
  lastName: string;
  username: string;
  profilePicture?: string;
  headline?: string;
  verified?: boolean;
  city?: string;
}

export interface JobPin {
  id: string;
  kind: "job";
  lat: number;
  lng: number;
  jobTitle: string;
  serviceKeys: string[];
  serviceLabels: string[];
  jobType: "gig" | "recurring" | "employment";
  budget: string;
  location: string;
}

export interface MapData {
  workers: WorkerPin[];
  jobs: JobPin[];
}

export const useMapData = () =>
  useQuery({
    queryKey: ["discovery", "map"],
    queryFn: async () => {
      const { data } = await api.get<MapData>("/discovery/map");
      return data;
    },
    staleTime: 60_000,
  });
