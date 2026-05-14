import { useMemo } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Star, MessageSquareQuote } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

import { UserAvatar, EmptyState } from "@/components/ui";
import { useWorkDetails } from "@/hooks/useWorkDetails";
import type { ServiceReview } from "@/types/workDetail";

interface FlatReview extends ServiceReview {
  serviceName: string;
  serviceId: string;
}

interface Props {
  username: string;
  isOwn: boolean;
}

/**
 * Aggregates reviews across every service this Worker offers. Reviews
 * are the strongest trust signal a marketplace has — they go above the
 * fold-of-the-fold (right after the services list), with the most
 * recent first.
 */
export const ReviewsSection = ({ username, isOwn }: Props) => {
  const { data: services, isLoading } = useWorkDetails(username);

  const reviews: FlatReview[] = useMemo(() => {
    if (!services) return [];
    const all = services.flatMap((s) =>
      (s.reviews ?? []).map((r) => ({
        ...r,
        serviceName: s.serviceOffered,
        serviceId: s._id,
      }))
    );
    return all.sort((a, b) => {
      const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bt - at;
    });
  }, [services]);

  const summary = useMemo(() => {
    const count = reviews.length;
    if (!count) return null;
    const avg = reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / count;
    return { count, avg };
  }, [reviews]);

  if (isLoading) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
          px: 0.5,
        }}
      >
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          Reviews
        </Typography>
        {summary ? (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              color: "warning.main",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            <Star size={12} fill="currentColor" aria-hidden />
            <span>
              {summary.avg.toFixed(1)} · {summary.count} review
              {summary.count === 1 ? "" : "s"}
            </span>
          </Box>
        ) : null}
      </Box>

      {reviews.length === 0 ? (
        <Box
          sx={(theme) => ({
            p: 4,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <EmptyState
            icon={MessageSquareQuote}
            title={isOwn ? "No reviews yet" : "This Worker has no reviews"}
            description={
              isOwn
                ? "After you complete a job, clients can leave a review. They'll show up here."
                : "Once a client reviews this Worker, you'll see it here."
            }
          />
        </Box>
      ) : (
        <Box sx={{ display: "grid", gap: 1.5 }}>
          {reviews.slice(0, 6).map((r, i) => (
            <ReviewRow key={`${r.serviceId}-${r._id ?? i}`} review={r} />
          ))}
        </Box>
      )}
    </Box>
  );
};

const ReviewRow = ({ review }: { review: FlatReview }) => (
  <Box
    sx={(theme) => ({
      p: 2,
      borderRadius: 2,
      border: 1,
      borderColor: "divider",
      backgroundColor: theme.palette.background.paper,
    })}
  >
    <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
      {review.reviewer ? (
        <Box
          component={Link}
          to={`/profile/${review.reviewer.username}`}
          sx={{ textDecoration: "none", display: "flex" }}
        >
          <UserAvatar user={review.reviewer} size="sm" />
        </Box>
      ) : null}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {review.reviewer ? (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, fontSize: "0.8125rem" }}
          >
            {review.reviewer.firstName} {review.reviewer.lastName}
          </Typography>
        ) : null}
        <Typography
          variant="caption"
          sx={{ color: "text.tertiary", fontSize: "0.6875rem" }}
        >
          {review.serviceName}
          {review.createdAt
            ? ` · ${formatDistanceToNowStrict(new Date(review.createdAt))} ago`
            : ""}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.25,
          color: "warning.main",
          fontWeight: 600,
          fontSize: "0.75rem",
        }}
      >
        <Star size={12} fill="currentColor" aria-hidden />
        <span>{(review.rating ?? 0).toFixed(1)}</span>
      </Box>
    </Box>
    {review.review ? (
      <Typography
        variant="body2"
        sx={{
          mt: 1.25,
          fontSize: "0.875rem",
          color: "text.primary",
          whiteSpace: "pre-wrap",
        }}
      >
        {review.review}
      </Typography>
    ) : null}
  </Box>
);
