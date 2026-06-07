import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { MapPin, Sparkles, Users, Wallet } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

import { StatusBadge } from "@/components/ui";
import { serviceLabel } from "@/data/serviceCatalog";
import { formatDistance } from "@/lib/geo";
import type { JobPost, JobStatus } from "@/types/jobPost";

interface Props {
  jobs: JobPost[];
}

const statusTone = (status: JobStatus): "trust" | "info" | "warning" | "neutral" => {
  switch (status) {
    case "Open":
      return "trust";
    case "In Progress":
      return "info";
    case "Completed":
      return "neutral";
    case "Canceled":
      return "warning";
  }
};

export const JobScrollRow = ({ jobs }: Props) => {
  if (!jobs.length) return null;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        pb: 0.5,
        scrollbarWidth: "thin",
        "&::-webkit-scrollbar": { height: 6 },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "action.hover",
          borderRadius: 3,
        },
      }}
    >
      {jobs.map((job) => (
        <Box
          key={job._id}
          component={Link}
          to={`/works/${job._id}`}
          sx={(theme) => ({
            scrollSnapAlign: "start",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            flex: "0 0 280px",
            p: 1.75,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            backgroundColor: theme.palette.background.paper,
            textDecoration: "none",
            color: "inherit",
            transition: "border-color 120ms ease, transform 120ms ease",
            "&:hover": {
              borderColor: "primary.main",
              transform: "translateY(-1px)",
            },
          })}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <StatusBadge tone={statusTone(job.status)}>{job.status}</StatusBadge>
              {job.match?.hasMatch ? (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.25,
                    color: "primary.main",
                    fontSize: "0.625rem",
                    fontWeight: 600,
                  }}
                  aria-label={`Matches ${job.match.matchedKeys.length} of your services`}
                >
                  <Sparkles size={10} aria-hidden />
                  <span>Match</span>
                </Box>
              ) : null}
            </Box>
            <Typography
              variant="caption"
              sx={{ color: "text.tertiary", fontSize: "0.625rem" }}
            >
              {formatDistanceToNowStrict(new Date(job.createdAt))} ago
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: "0.875rem",
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {job.jobTitle}
          </Typography>
          {job.serviceKeys && job.serviceKeys.length > 0 ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {job.serviceKeys.slice(0, 3).map((key) => {
                const matched = job.match?.matchedKeys?.includes(key);
                return (
                  <Chip
                    key={key}
                    label={serviceLabel(key)}
                    size="small"
                    color={matched ? "primary" : "default"}
                    variant={matched ? "filled" : "outlined"}
                    sx={{ fontSize: "0.625rem", height: 18 }}
                  />
                );
              })}
              {job.serviceKeys.length > 3 ? (
                <Chip
                  label={`+${job.serviceKeys.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.625rem", height: 18 }}
                />
              ) : null}
            </Box>
          ) : null}
          <Box
            sx={{
              mt: "auto",
              pt: 1,
              display: "flex",
              flexWrap: "wrap",
              gap: 1.25,
              color: "text.secondary",
              fontSize: "0.6875rem",
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            {job.budget ? (
              <Meta icon={<Wallet size={11} aria-hidden />} text={job.budget} />
            ) : null}
            {job.location ? (
              <Meta
                icon={<MapPin size={11} aria-hidden />}
                text={
                  formatDistance(job.distanceKm) ??
                  job.location.split(",")[0] ??
                  job.location
                }
              />
            ) : null}
            <Meta
              icon={<Users size={11} aria-hidden />}
              text={`${job.applicants.length}`}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

const Meta = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.375 }}>
    {icon}
    <span>{text}</span>
  </Box>
);
