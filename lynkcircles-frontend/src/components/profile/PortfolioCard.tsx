import { useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Star, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { JobPortfolio } from "@/types/workDetail";

interface Props {
  entry: JobPortfolio;
  canManage: boolean;
  onOpen: () => void;
  onDelete?: () => void;
}

const serviceName = (entry: JobPortfolio): string | null => {
  if (typeof entry.service === "string") return null;
  return entry.service?.serviceOffered ?? null;
};

const reviewSummary = (entry: JobPortfolio) => {
  const count = entry.reviews?.length ?? 0;
  if (!count) return null;
  const avg = entry.reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / count;
  return { avg, count };
};

/**
 * Square-ish portfolio tile. Image carousel up top (arrows on hover,
 * dot indicators along the bottom), text body below. Whole card is
 * clickable to open the detail dialog.
 */
export const PortfolioCard = ({ entry, canManage, onOpen, onDelete }: Props) => {
  const [index, setIndex] = useState(0);
  const images = entry.images ?? [];
  const total = images.length;
  const summary = reviewSummary(entry);
  const service = serviceName(entry);

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!total) return;
    setIndex((i) => (i + 1) % total);
  };
  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!total) return;
    setIndex((i) => (i - 1 + total) % total);
  };

  return (
    <Box
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      sx={(theme) => ({
        cursor: "pointer",
        borderRadius: 2,
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
        backgroundColor: theme.palette.background.paper,
        display: "flex",
        flexDirection: "column",
        transition: "transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: 1,
          transform: "translateY(-1px)",
          "& .portfolio-arrow": { opacity: 1 },
        },
      })}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: "62%",
          bgcolor: "action.hover",
        }}
      >
        {total > 0 ? (
          <>
            <Box
              component="img"
              src={images[index]}
              alt={entry.jobTitle ?? "Portfolio image"}
              loading="lazy"
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {total > 1 ? (
              <>
                <IconButton
                  className="portfolio-arrow"
                  size="small"
                  onClick={prev}
                  aria-label="Previous image"
                  sx={{
                    position: "absolute",
                    left: 6,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(0,0,0,0.5)",
                    color: "#fff",
                    opacity: { xs: 1, md: 0 },
                    transition: "opacity 120ms ease",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                  }}
                >
                  <ChevronLeft size={14} />
                </IconButton>
                <IconButton
                  className="portfolio-arrow"
                  size="small"
                  onClick={next}
                  aria-label="Next image"
                  sx={{
                    position: "absolute",
                    right: 6,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(0,0,0,0.5)",
                    color: "#fff",
                    opacity: { xs: 1, md: 0 },
                    transition: "opacity 120ms ease",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                  }}
                >
                  <ChevronRight size={14} />
                </IconButton>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 6,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: 0.5,
                  }}
                >
                  {images.map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        bgcolor: i === index ? "#fff" : "rgba(255,255,255,0.5)",
                      }}
                    />
                  ))}
                </Box>
              </>
            ) : null}
          </>
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
            <ImageIcon size={28} aria-hidden />
          </Box>
        )}
      </Box>

      <Box sx={{ p: 1.75, flex: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: "0.875rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {entry.jobTitle || "Completed job"}
            </Typography>
            {service ? (
              <Typography
                variant="caption"
                sx={{ color: "text.tertiary", fontSize: "0.6875rem" }}
              >
                {service}
                {entry.dateCompleted
                  ? ` · ${format(new Date(entry.dateCompleted), "MMM yyyy")}`
                  : ""}
              </Typography>
            ) : null}
          </Box>
          {canManage && onDelete ? (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Remove this portfolio entry?")) onDelete();
              }}
              aria-label="Remove entry"
              sx={{ color: "text.tertiary" }}
            >
              <Trash2 size={13} />
            </IconButton>
          ) : null}
        </Box>

        {summary ? (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              color: "warning.main",
              fontSize: "0.6875rem",
              fontWeight: 600,
            }}
          >
            <Star size={11} fill="currentColor" aria-hidden />
            <span>
              {summary.avg.toFixed(1)} · {summary.count} review
              {summary.count === 1 ? "" : "s"}
            </span>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};
