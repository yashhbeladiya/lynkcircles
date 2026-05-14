import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { Clock, MapPin, Users, Wallet } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

import { UserAvatar, StatusBadge } from "@/components/ui";
import type { JobPost, JobStatus } from "@/types/jobPost";

interface Props {
  job: JobPost;
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
 * Marketplace job-board tile. Built for scanability: headline + budget
 * + location + how many people have already applied are all visible
 * above the fold so a Worker can decide "is this worth opening?" in
 * one glance. Whole card links to /works/:id detail.
 */
export const JobPostCard = ({ job }: Props) => {
  const applicantCount = job.applicants?.length ?? 0;

  return (
    <Box
      component={Link}
      to={`/works/${job._id}`}
      sx={(theme) => ({
        display: "block",
        textDecoration: "none",
        color: "inherit",
        p: { xs: 1.75, sm: 2.25 },
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        backgroundColor: theme.palette.background.paper,
        transition: "border-color 120ms ease, transform 120ms ease",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-1px)",
        },
      })}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 1 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              fontSize: "1rem",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {job.jobTitle}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.tertiary", fontSize: "0.6875rem" }}
          >
            Posted {formatDistanceToNowStrict(new Date(job.createdAt))} ago
          </Typography>
        </Box>
        <StatusBadge tone={statusTone(job.status)}>{job.status}</StatusBadge>
      </Box>

      {job.description ? (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontSize: "0.8125rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 1.5,
          }}
        >
          {job.description}
        </Typography>
      ) : null}

      {job.skillsRequired.length > 0 ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
          {job.skillsRequired.slice(0, 5).map((skill) => (
            <Chip
              key={skill}
              label={skill}
              size="small"
              sx={{ fontSize: "0.6875rem", height: 22 }}
            />
          ))}
          {job.skillsRequired.length > 5 ? (
            <Chip
              label={`+${job.skillsRequired.length - 5}`}
              size="small"
              sx={{ fontSize: "0.6875rem", height: 22 }}
            />
          ) : null}
        </Box>
      ) : null}

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          color: "text.secondary",
          fontSize: "0.75rem",
        }}
      >
        {job.budget ? (
          <MetaItem icon={<Wallet size={12} aria-hidden />} text={job.budget} />
        ) : null}
        {job.location ? (
          <MetaItem
            icon={<MapPin size={12} aria-hidden />}
            text={job.location}
          />
        ) : null}
        {job.deadline ? (
          <MetaItem
            icon={<Clock size={12} aria-hidden />}
            text={`Due ${formatDistanceToNowStrict(new Date(job.deadline))}`}
          />
        ) : null}
        <MetaItem
          icon={<Users size={12} aria-hidden />}
          text={`${applicantCount} ${applicantCount === 1 ? "applicant" : "applicants"}`}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mt: 1.5,
          pt: 1.25,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <UserAvatar user={job.author} size="sm" />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, fontSize: "0.75rem", display: "block" }}
          >
            {job.author.firstName} {job.author.lastName}
          </Typography>
          {job.author.headline ? (
            <Typography
              variant="caption"
              sx={{
                color: "text.tertiary",
                fontSize: "0.6875rem",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 240,
              }}
            >
              {job.author.headline}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

const MetaItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
    {icon}
    <span>{text}</span>
  </Box>
);
