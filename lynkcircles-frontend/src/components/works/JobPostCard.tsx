import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { Clock, MapPin, Sparkles, Users, Wallet } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

import { UserAvatar, StatusBadge } from "@/components/ui";
import { serviceLabel } from "@/data/serviceCatalog";
import { formatDistance } from "@/lib/geo";
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

const TYPE_LABEL: Record<NonNullable<JobPost["jobType"]>, string> = {
  gig: "Gig",
  recurring: "Recurring",
  employment: "Hiring",
};

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
          {job.jobType ? (
            <Chip
              label={TYPE_LABEL[job.jobType]}
              size="small"
              color={job.jobType === "employment" ? "secondary" : "default"}
              variant="outlined"
              sx={{
                fontSize: "0.625rem",
                height: 18,
                mb: 0.5,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            />
          ) : null}
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
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
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
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
              aria-label={`Matches ${job.match.matchedKeys.length} of your services`}
            >
              <Sparkles size={10} aria-hidden />
              <span>
                Matches {job.match.matchedKeys.length}/{job.match.totalKeys || job.match.matchedKeys.length}
              </span>
            </Box>
          ) : null}
        </Box>
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

      {/* Service chips from the canonical catalog. Matched services
          (the ones in this Worker's offered list) get tinted to flag
          why the job surfaced for them. */}
      {job.serviceKeys && job.serviceKeys.length > 0 ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.25 }}>
          {job.serviceKeys.slice(0, 5).map((key) => {
            const matched = job.match?.matchedKeys?.includes(key);
            return (
              <Chip
                key={key}
                label={serviceLabel(key)}
                size="small"
                color={matched ? "primary" : "default"}
                variant={matched ? "filled" : "outlined"}
                sx={{ fontSize: "0.6875rem", height: 22 }}
              />
            );
          })}
          {job.serviceKeys.length > 5 ? (
            <Chip
              label={`+${job.serviceKeys.length - 5}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.6875rem", height: 22 }}
            />
          ) : null}
        </Box>
      ) : null}

      {/* Free-text additional requirements (must speak X, brand
          familiarity, etc.) sit underneath the service chips so a
          Worker can tell the catalog tags apart from the extras. */}
      {job.skillsRequired.length > 0 ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
          {job.skillsRequired.slice(0, 4).map((skill) => (
            <Chip
              key={skill}
              label={skill}
              size="small"
              variant="outlined"
              sx={{
                fontSize: "0.625rem",
                height: 20,
                borderStyle: "dashed",
                color: "text.secondary",
              }}
            />
          ))}
          {job.skillsRequired.length > 4 ? (
            <Chip
              label={`+${job.skillsRequired.length - 4}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.625rem", height: 20 }}
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
            text={
              formatDistance(job.distanceKm)
                ? `${job.location} · ${formatDistance(job.distanceKm)}`
                : job.location
            }
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
