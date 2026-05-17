import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { NewsArticle, NewsResponse } from "@/types/news";

interface NewsQuery {
  keyword: string;
  place?: string;
}

/**
 * Hits the backend's /news endpoint which proxies NewsAPI.org. The
 * proxy hides the API key and lets us strip out de-duplicated articles
 * server-side in a later iteration. For now the FE handles dedup.
 */
export const useNews = ({ keyword, place }: NewsQuery) =>
  useQuery<NewsArticle[]>({
    queryKey: ["news", keyword, place ?? "us"],
    queryFn: async () => {
      const { data } = await api.get<NewsResponse>("/news", {
        params: {
          keyword,
          place: place ?? "United States",
          // ISO timestamp from 14 days ago — backend uses it as the
          // /everything endpoint's `from`. /top-headlines ignores it.
          datePublished: new Date(
            Date.now() - 14 * 24 * 60 * 60 * 1000
          ).toISOString(),
          language: "English",
        },
      });
      const articles = data.articles ?? [];
      // De-dupe by URL — NewsAPI occasionally returns the same article
      // twice across sources, which makes the grid feel broken.
      const seen = new Set<string>();
      return articles.filter((a) => {
        if (!a.url || seen.has(a.url)) return false;
        seen.add(a.url);
        return true;
      });
    },
    // News doesn't change minute-to-minute; cache aggressively to keep
    // the page snappy on tab returns.
    staleTime: 5 * 60_000,
  });
