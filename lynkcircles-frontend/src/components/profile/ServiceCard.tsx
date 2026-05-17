import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { Star, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { WorkDetail } from "@/types/workDetail";

interface Props {
  service: WorkDetail;
  canManage: boolean;
  onDelete?: (id: string) => void;
}

const ratingLabel = (s: WorkDetail) => {
  const count = s.reviews?.length ?? 0;
  if (!count) return "New · no reviews yet";
  const avg = s.ratings && !Number.isNaN(s.ratings) ? s.ratings : 0;
  return `${avg.toFixed(1)} · ${count} review${count === 1 ? "" : "s"}`;
};

export const ServiceCard = ({ service, canManage, onDelete }: Props) => {
  const hasReviews = (service.reviews?.length ?? 0) > 0;

  return (
    <Box
      sx={(theme) => ({
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        backgroundColor: theme.palette.background.paper,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
      })}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, lineHeight: 1.3 }}
          >
            {service.serviceOffered}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mt: 0.5,
              color: hasReviews ? "warning.main" : "text.tertiary",
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            <Star
              size={12}
              fill={hasReviews ? "currentColor" : "none"}
              aria-hidden
            />
            <span>{ratingLabel(service)}</span>
          </Box>
        </Box>
        {canManage && onDelete ? (
          <IconButton
            size="small"
            onClick={() => {
              if (window.confirm(`Remove "${service.serviceOffered}"?`)) {
                onDelete(service._id);
              }
            }}
            aria-label="Remove service"
            sx={{ color: "text.tertiary" }}
          >
            <Trash2 size={14} />
          </IconButton>
        ) : null}
      </Box>

      {service.description ? (
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
          {service.description}
        </Typography>
      ) : null}

      {service.hourlyRate ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            gap: 0.5,
            pt: 0.5,
            mt: "auto",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: "text.tertiary",
              fontSize: "0.625rem",
              letterSpacing: "0.06em",
            }}
          >
            from
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, fontSize: "0.9375rem" }}
          >
            {formatCurrency(service.hourlyRate, service.currency ?? "INR")}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.tertiary", fontSize: "0.6875rem" }}
          >
            / hr
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
};
