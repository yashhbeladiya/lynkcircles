import { QueryClient } from "@tanstack/react-query";

/**
 * Sensible defaults for a social app:
 * - staleTime: 30s — most reads (feed, profile) are fresh enough for
 *   half a minute; cuts refetch storms on tab focus.
 * - gcTime: 5min — cache persists across short navigations without
 *   hoarding memory.
 * - retry: 1 — retry once on transient failures, but don't blast the
 *   server on a real outage.
 * - refetchOnWindowFocus: false — quiet UX; let the user pull-to-
 *   refresh or wait for the next mutation invalidation.
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
