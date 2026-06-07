import { useState, useMemo, type KeyboardEvent } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { AlertCircle, Newspaper, Search, X } from "lucide-react";

import { EmptyState } from "@/components/ui";
import { ArticleCard } from "@/components/news/ArticleCard";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useNews } from "@/hooks/useNews";

const TOPICS: { key: string; label: string; query: string }[] = [
  { key: "latest", label: "Latest", query: "latest" },
  { key: "construction", label: "Construction", query: "construction industry" },
  { key: "home", label: "Home services", query: "home services trades" },
  { key: "small-business", label: "Small business", query: "small business owners" },
  { key: "trade-skills", label: "Trade skills", query: "skilled trades workforce" },
  { key: "real-estate", label: "Real estate", query: "real estate housing market" },
];

const News = () => {
  const { data: authUser } = useAuthUser();
  const [topic, setTopic] = useState<string>("latest");
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState<string | null>(null);

  const effectiveKeyword = useMemo(() => {
    if (activeQuery) return activeQuery;
    return TOPICS.find((t) => t.key === topic)?.query ?? "latest";
  }, [topic, activeQuery]);

  const { data: articles, isLoading, error } = useNews({
    keyword: effectiveKeyword,
  });

  const handleSearch = () => {
    const next = searchInput.trim();
    if (!next) {
      setActiveQuery(null);
      return;
    }
    setActiveQuery(next);
  };

  const handleSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    } else if (event.key === "Escape") {
      setSearchInput("");
      setActiveQuery(null);
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setActiveQuery(null);
  };

  const greeting = authUser?.firstName ? `${authUser.firstName}, ` : "";

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, letterSpacing: "-0.02em" }}>
          News for your trade
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {greeting}headlines from the industries that matter on LynkCircles —
          construction, home services, skilled trades, and the small businesses
          that drive them.
        </Typography>
      </Box>

      <Box
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 0.75,
          borderRadius: 999,
          border: 1,
          borderColor: "divider",
          backgroundColor: theme.palette.background.paper,
          mb: 2,
          maxWidth: 520,
        })}
      >
        <Search size={14} aria-hidden />
        <InputBase
          fullWidth
          placeholder="Search news topics (try: kitchen remodel, contractor pricing)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKey}
          inputProps={{ "aria-label": "Search news" }}
          sx={{ fontSize: "0.875rem" }}
        />
        {activeQuery ? (
          <IconButton
            size="small"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X size={14} />
          </IconButton>
        ) : null}
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 3 }}>
        {TOPICS.map((t) => (
          <Chip
            key={t.key}
            label={t.label}
            clickable
            onClick={() => {
              setActiveQuery(null);
              setTopic(t.key);
            }}
            variant={!activeQuery && topic === t.key ? "filled" : "outlined"}
            color={!activeQuery && topic === t.key ? "primary" : "default"}
            sx={{ fontSize: "0.75rem", height: 28 }}
          />
        ))}
        {activeQuery ? (
          <Chip
            label={`"${activeQuery}"`}
            onDelete={clearSearch}
            color="primary"
            sx={{ fontSize: "0.75rem", height: 28 }}
          />
        ) : null}
      </Box>

      {isLoading ? (
        <ArticlesSkeleton />
      ) : error ? (
        <EmptyShell
          icon={AlertCircle}
          title="Couldn't load news right now"
          description="The news service might be down or rate-limited. Try a different topic or check back in a few minutes."
        />
      ) : !articles || articles.length === 0 ? (
        <EmptyShell
          icon={Newspaper}
          title="No articles for this topic"
          description="Try one of the other chips above, or search for something specific."
        />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {articles.map((article) => (
            <ArticleCard key={article.url} article={article} />
          ))}
        </Box>
      )}
    </Container>
  );
};

const EmptyShell = ({
  icon,
  title,
  description,
}: {
  icon: typeof Newspaper;
  title: string;
  description: string;
}) => (
  <Box
    sx={(theme) => ({
      p: 4,
      borderRadius: 2,
      border: 1,
      borderColor: "divider",
      backgroundColor: theme.palette.background.paper,
    })}
  >
    <EmptyState icon={icon} title={title} description={description} />
  </Box>
);

const ArticlesSkeleton = () => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "1fr",
        sm: "repeat(2, minmax(0, 1fr))",
        md: "repeat(3, minmax(0, 1fr))",
      },
      gap: 2,
    }}
  >
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <Box
        key={i}
        sx={(theme) => ({
          borderRadius: 2,
          overflow: "hidden",
          border: 1,
          borderColor: "divider",
          backgroundColor: theme.palette.background.paper,
        })}
      >
        <Skeleton variant="rectangular" width="100%" sx={{ paddingTop: "56%" }} />
        <Box sx={{ p: 2 }}>
          <Skeleton width="40%" height={11} />
          <Skeleton width="100%" height={18} sx={{ mt: 1 }} />
          <Skeleton width="85%" height={18} />
          <Skeleton width="100%" height={12} sx={{ mt: 1 }} />
          <Skeleton width="70%" height={12} />
        </Box>
      </Box>
    ))}
  </Box>
);

export default News;
