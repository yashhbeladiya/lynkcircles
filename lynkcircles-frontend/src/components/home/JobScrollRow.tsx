import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { MapPin, Users, Wallet } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

import { StatusBadge } from "@/components/ui";
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

/**
 * Compact horizontal-scroll row of job tiles for the Home dashboard.
 * Different from JobPostCard (the full list-view card) — this one is
 * sized for a dashboard preview, sticks to a fixed width so 3-4
 * tiles fit on a typical viewport, and scrolls horizontally on
 * narrow screens.
 */
export const JobScrollRow = ({ jobs }: Props) => {
  if (!jobs.length) return null;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        overflowX: "auto",
        // Edge fade so users sense there's more on the right when
        // content overflows.
        scrollSnapType: "x mandatory",
        pb: 0.5,
        mx: -0.5,
        px: 0.5,
        // Hide scrollbar visually but keep it accessible by keyboard.
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
            <StatusBadge tone={statusTone(job.status)}>{job.status}</StatusBadge>
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
          {job.skillsRequired.length > 0 ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {job.skillsRequired.slice(0, 3).map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  sx={{ fontSize: "0.625rem", height: 18 }}
                />
              ))}
              {job.skillsRequired.length > 3 ? (
                <Chip
                  label={`+${job.skillsRequired.length - 3}`}
                  size="small"
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
              <Meta icon={<MapPin size={11} aria-hidden />} text={job.location} />
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
