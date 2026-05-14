import { useState } from "react";
import { Link } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { ChevronLeft, ChevronRight, MessageSquarePlus, Star, X } from "lucide-react";
import { format, formatDistanceToNowStrict } from "date-fns";

import { UserAvatar } from "@/components/ui";
import type { JobPortfolio } from "@/types/workDetail";
import { AddPortfolioReviewDialog } from "./AddPortfolioReviewDialog";

interface Props {
  entry: JobPortfolio | null;
  username: string;
  /** True if the viewer is the portfolio owner (Worker) — hides the
   *  "Leave a review" CTA, since you can't review your own work. */
  isOwn: boolean;
  open: boolean;
  onClose: () => void;
}

const serviceName = (entry: JobPortfolio): string | null => {
  if (typeof entry.service === "string") return null;
  return entry.service?.serviceOffered ?? null;
};

/**
 * Lightbox-style detail view for a portfolio entry. Surfaces the full
 * description, client info, every photo, and the reviews list. The
 * "Leave a review" affordance shows only when the viewer isn't the
 * Worker themselves.
 */
export const PortfolioDetailDialog = ({
  entry,
  username,
  isOwn,
  open,
  onClose,
}: Props) => {
  const [index, setIndex] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);

  if (!entry) return null;
  const images = entry.images ?? [];
  const total = images.length;
  const service = serviceName(entry);

  const next = () => total && setIndex((i) => (i + 1) % total);
  const prev = () => total && setIndex((i) => (i - 1 + total) % total);

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" }, minHeight: { md: 480 } }}>
            {/* Media side */}
            <Box
              sx={{
                position: "relative",
                bgcolor: "#0a0a0b",
                minHeight: { xs: 240, md: "unset" },
              }}
            >
              {total > 0 ? (
                <Box
                  component="img"
                  src={images[index]}
                  alt={entry.jobTitle ?? "Portfolio image"}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "0.8125rem",
                  }}
                >
                  No photos for this entry
                </Box>
              )}
              {total > 1 ? (
                <>
                  <IconButton
                    size="small"
                    onClick={prev}
                    aria-label="Previous"
                    sx={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      bgcolor: "rgba(0,0,0,0.55)",
                      color: "#fff",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                    }}
                  >
                    <ChevronLeft size={16} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={next}
                    aria-label="Next"
                    sx={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      bgcolor: "rgba(0,0,0,0.55)",
                      color: "#fff",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                    }}
                  >
                    <ChevronRight size={16} />
                  </IconButton>
                </>
              ) : null}
              <IconButton
                size="small"
                onClick={onClose}
                aria-label="Close"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  bgcolor: "rgba(0,0,0,0.55)",
                  color: "#fff",
                  display: { xs: "inline-flex", md: "none" },
                }}
              >
                <X size={14} />
              </IconButton>
            </Box>

            {/* Text side */}
            <Box
              sx={{
                p: { xs: 2, md: 3 },
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                overflow: "auto",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {entry.jobTitle || "Completed job"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.tertiary" }}>
                    {service ? `${service}` : ""}
                    {entry.dateCompleted ? ` · ${format(new Date(entry.dateCompleted), "MMM d, yyyy")}` : ""}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={onClose}
                  aria-label="Close"
                  sx={{ display: { xs: "none", md: "inline-flex" } }}
                >
                  <X size={16} />
                </IconButton>
              </Box>

              {entry.description ? (
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
                  {entry.description}
                </Typography>
              ) : null}

              {entry.clientName || entry.clientUsername ? (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Client:{" "}
                  {entry.clientUsername ? (
                    <Box
                      component={Link}
                      to={`/profile/${entry.clientUsername}`}
                      sx={{ color: "primary.main", textDecoration: "none", fontWeight: 500 }}
                    >
                      @{entry.clientUsername}
                    </Box>
                  ) : (
                    entry.clientName
                  )}
                </Typography>
              ) : null}

              {/* Reviews */}
              <Box sx={{ mt: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{ color: "text.secondary" }}
                  >
                    Reviews ({entry.reviews.length})
                  </Typography>
                  {!isOwn ? (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<MessageSquarePlus size={14} />}
                      onClick={() => setReviewOpen(true)}
                    >
                      Leave a review
                    </Button>
                  ) : null}
                </Box>

                {entry.reviews.length === 0 ? (
                  <Typography variant="caption" sx={{ color: "text.tertiary" }}>
                    No reviews on this job yet.
                  </Typography>
                ) : (
                  <Box sx={{ display: "grid", gap: 1.25 }}>
                    {entry.reviews.map((r, i) => (
                      <Box
                        key={r._id ?? i}
                        sx={(theme) => ({
                          p: 1.5,
                          borderRadius: 1.5,
                          border: 1,
                          borderColor: "divider",
                          backgroundColor: theme.palette.action.hover,
                        })}
                      >
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                          {r.reviewer ? <UserAvatar user={r.reviewer} size="sm" /> : null}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            {r.reviewer ? (
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                                {r.reviewer.firstName} {r.reviewer.lastName}
                              </Typography>
                            ) : null}
                            {r.createdAt ? (
                              <Typography variant="caption" sx={{ color: "text.tertiary", fontSize: "0.6875rem" }}>
                                {formatDistanceToNowStrict(new Date(r.createdAt))} ago
                              </Typography>
                            ) : null}
                          </Box>
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.25,
                              color: "warning.main",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            <Star size={12} fill="currentColor" aria-hidden />
                            <span>{(r.rating ?? 0).toFixed(1)}</span>
                          </Box>
                        </Box>
                        {r.review ? (
                          <Typography
                            variant="body2"
                            sx={{ mt: 1, fontSize: "0.8125rem", whiteSpace: "pre-wrap" }}
                          >
                            {r.review}
                          </Typography>
                        ) : null}
                        {r.images && r.images.length > 0 ? (
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3, 1fr)",
                              gap: 0.75,
                              mt: 1,
                            }}
                          >
                            {r.images.map((src, j) => (
                              <Box
                                key={j}
                                component="img"
                                src={src}
                                alt={`Proof ${j + 1}`}
                                loading="lazy"
                                sx={{
                                  width: "100%",
                                  aspectRatio: "1 / 1",
                                  objectFit: "cover",
                                  borderRadius: 1,
                                  border: 1,
                                  borderColor: "divider",
                                }}
                              />
                            ))}
                          </Box>
                        ) : null}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <AddPortfolioReviewDialog
        username={username}
        portfolioId={entry._id}
        jobTitle={entry.jobTitle}
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
      />
    </>
  );
};
