import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { JobPost } from "@/types/jobPost";
import type { UserSummary } from "@/types/user";

export interface SearchResults {
  workers: UserSummary[];
  jobs: JobPost[];
  services: Array<{ key: string; label: string }>;
}

const useDebounced = <T,>(value: T, delay = 250): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

export const useSearch = (query: string) => {
  const debounced = useDebounced(query.trim(), 250);
  const enabled = debounced.length >= 2;

  const queryResult = useQuery<SearchResults>({
    queryKey: ["search", debounced],
    queryFn: async () => {
      const { data } = await api.get<SearchResults>("/search", {
        params: { q: debounced },
      });
      return data;
    },
    enabled,
    staleTime: 30_000,
  });

  return { ...queryResult, debouncedQuery: debounced, enabled };
};
