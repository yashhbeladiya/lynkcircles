import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ExternalLink, Newspaper } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import type { NewsArticle } from "@/types/news";

interface Props {
  article: NewsArticle;
}

/**
 * Single news card. Cover image fills the top with a soft fallback
 * for articles that ship no image. The whole tile is a target so a
 * keyboard user lands once and tabs through cleanly.
 */
export const ArticleCard = ({ article }: Props) => {
  const source = article.source?.name ?? "Source";
  const published = article.publishedAt
    ? formatDistanceToNowStrict(new Date(article.publishedAt))
    : null;

  return (
    <Box
      component="a"
      href={article.url}
      target="_blank"
      rel="noreferrer noopener"
      sx={(theme) => ({
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        borderRadius: 2,
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
        backgroundColor: theme.palette.background.paper,
        transition: "transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: 1,
          transform: "translateY(-1px)",
        },
      })}
    >
      <Box
        sx={{
          width: "100%",
          paddingTop: "56%",
          position: "relative",
          backgroundColor: "action.hover",
        }}
      >
        {article.urlToImage ? (
          <Box
            component="img"
            src={article.urlToImage}
            alt=""
            loading="lazy"
            onError={(event) => {
              const img = event.currentTarget as HTMLImageElement;
              img.style.display = "none";
            }}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.tertiary",
            }}
          >
            <Newspaper size={28} aria-hidden />
          </Box>
        )}
      </Box>

      <Box
        sx={{
          p: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0.75,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            color: "text.tertiary",
            fontSize: "0.6875rem",
          }}
        >
          <Box
            component="span"
            sx={{
              fontWeight: 600,
              color: "primary.main",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "60%",
            }}
          >
            {source}
          </Box>
          {published ? <span>{published} ago</span> : null}
        </Box>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            fontSize: "0.9375rem",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </Typography>
        {article.description ? (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.8125rem",
              color: "text.secondary",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {article.description}
          </Typography>
        ) : null}
        <Box
          sx={{
            mt: "auto",
            pt: 1,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            color: "primary.main",
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          Read article
          <ExternalLink size={12} aria-hidden />
        </Box>
      </Box>
    </Box>
  );
};
