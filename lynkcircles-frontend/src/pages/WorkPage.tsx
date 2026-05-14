import { Link, useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { format, formatDistanceToNowStrict } from "date-fns";

import { EmptyState, StatusBadge, UserAvatar } from "@/components/ui";
import { useAuthUser } from "@/hooks/useAuthUser";
import {
  useApplyForJob,
  useDeleteJobPost,
  useJobApplicants,
  useJobPost,
  useUpdateJobPost,
  useWithdrawApplication,
} from "@/hooks/useJobPosts";
import type { JobStatus } from "@/types/jobPost";

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

const WorkPage = () => {
  const { workPostId } = useParams<{ workPostId: string }>();
  const navigate = useNavigate();
  const { data: authUser } = useAuthUser();
  const { data: job, isLoading } = useJobPost(workPostId);
  const apply = useApplyForJob();
  const withdraw = useWithdrawApplication();
  const updateJob = useUpdateJobPost();
  const deleteJob = useDeleteJobPost();
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);

  const isOwner = !!job && authUser?._id === job.author._id;
  // Applicants endpoint requires owner permission server-side; only
  // fetch it for the owner to avoid spurious 403s on Worker views.
  const { data: applicants } = useJobApplicants(workPostId, isOwner);

  if (isLoading || !job) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  const hasApplied = !!authUser && job.applicants.some((a) => {
    if (typeof a === "string") return a === authUser._id;
    return a._id === authUser._id;
  });

  const closed = job.status !== "Open";

  const handleStatusChange = (status: JobStatus) => {
    setStatusAnchor(null);
    if (job.status === status) return;
    updateJob.mutate({ id: job._id, status });
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this job post? This can't be undone.")) return;
    deleteJob.mutate(job._id, {
      onSuccess: () => navigate("/works"),
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, md: 3 } }}>
      <Button
        component={Link}
        to="/works"
        size="small"
        startIcon={<ArrowLeft size={14} />}
        sx={{ mb: 1.5, color: "text.secondary" }}
      >
        Back to jobs
      </Button>

      {/* Header card */}
      <Box
        sx={(theme) => ({
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          backgroundColor: theme.palette.background.paper,
          mb: 2,
        })}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 1 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <StatusBadge tone={statusTone(job.status)}>{job.status}</StatusBadge>
            <Typography
              variant="h4"
              sx={{ fontWeight: 600, letterSpacing: "-0.02em", mt: 1 }}
            >
              {job.jobTitle}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.tertiary", fontSize: "0.75rem" }}
            >
              Posted {formatDistanceToNowStrict(new Date(job.createdAt))} ago
            </Typography>
          </Box>

          {isOwner ? (
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => setStatusAnchor(e.currentTarget)}
              >
                Status
              </Button>
              <IconButton size="small" onClick={handleDelete} aria-label="Delete job">
                <Trash2 size={14} />
              </IconButton>
              <Menu
                anchorEl={statusAnchor}
                open={!!statusAnchor}
                onClose={() => setStatusAnchor(null)}
              >
                {(["Open", "In Progress", "Completed", "Canceled"] as JobStatus[]).map((s) => (
                  <MenuItem
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    selected={job.status === s}
                    sx={{ fontSize: "0.875rem" }}
                  >
                    {s}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          ) : (
            <Box>
              {hasApplied ? (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<XCircle size={14} />}
                  onClick={() => withdraw.mutate(job._id)}
                  disabled={withdraw.isPending}
                >
                  Withdraw application
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CheckCircle size={14} />}
                  onClick={() => apply.mutate(job._id)}
                  disabled={apply.isPending || closed}
                >
                  {closed ? "Closed" : "Apply"}
                </Button>
              )}
            </Box>
          )}
        </Box>

        {/* Meta grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(4, minmax(0, 1fr))",
            },
            gap: 1.5,
            mt: 2,
            pt: 2,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <MetaTile icon={<Wallet size={14} aria-hidden />} label="Budget" value={job.budget} />
          <MetaTile icon={<MapPin size={14} aria-hidden />} label="Location" value={job.location} />
          {job.requiredOn ? (
            <MetaTile
              icon={<Calendar size={14} aria-hidden />}
              label="Needed by"
              value={format(new Date(job.requiredOn), "MMM d, yyyy")}
            />
          ) : null}
          {job.deadline ? (
            <MetaTile
              icon={<Clock size={14} aria-hidden />}
              label="Applications close"
              value={format(new Date(job.deadline), "MMM d, yyyy")}
            />
          ) : null}
        </Box>

        {/* Author */}
        <Box
          component={Link}
          to={`/profile/${job.author.username}`}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            mt: 2,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <UserAvatar user={job.author} size="md" verified={job.author.verified} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {job.author.firstName} {job.author.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.tertiary" }}>
              {job.author.headline ?? "Posted this job"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Description */}
      <Box
        sx={(theme) => ({
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          backgroundColor: theme.palette.background.paper,
          mb: 2,
        })}
      >
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
          Job description
        </Typography>
        <Typography
          variant="body2"
          sx={{ whiteSpace: "pre-wrap", fontSize: "0.9375rem", lineHeight: 1.6 }}
        >
          {job.description}
        </Typography>
        {job.skillsRequired.length > 0 ? (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="overline"
              sx={{ color: "text.secondary", display: "block", mb: 1 }}
            >
              Skills needed
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {job.skillsRequired.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  icon={<Briefcase size={11} aria-hidden />}
                  sx={{ fontSize: "0.75rem" }}
                />
              ))}
            </Box>
          </>
        ) : null}
      </Box>

      {/* Applicants — owner only */}
      {isOwner ? (
        <Box
          sx={(theme) => ({
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
            }}
          >
            <Typography variant="overline" sx={{ color: "text.secondary" }}>
              Applicants ({applicants?.length ?? 0})
            </Typography>
            <MoreHorizontal size={14} aria-hidden style={{ opacity: 0 }} />
          </Box>
          {!applicants || applicants.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No applicants yet"
              description="As Workers apply, they'll appear here with a link to their profile and a Message button."
            />
          ) : (
            <Box sx={{ display: "grid", gap: 1 }}>
              {applicants.map((applicant) => (
                <Box
                  key={applicant._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    p: 1.25,
                    borderRadius: 1.5,
                    border: 1,
                    borderColor: "divider",
                  }}
                >
                  <Box
                    component={Link}
                    to={`/profile/${applicant.username}`}
                    sx={{ display: "flex", textDecoration: "none" }}
                  >
                    <UserAvatar
                      user={applicant}
                      size="md"
                      verified={applicant.verified}
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      component={Link}
                      to={`/profile/${applicant.username}`}
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {applicant.firstName} {applicant.lastName}
                    </Typography>
                    {applicant.headline ? (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          color: "text.secondary",
                          fontSize: "0.6875rem",
                        }}
                      >
                        {applicant.headline}
                      </Typography>
                    ) : null}
                  </Box>
                  <Button
                    component={Link}
                    to={`/messages/${applicant._id}`}
                    size="small"
                    variant="outlined"
                    startIcon={<MessageSquare size={13} />}
                  >
                    Message
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ) : null}
    </Container>
  );
};

const MetaTile = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <Box>
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        color: "text.tertiary",
        fontSize: "0.6875rem",
        mb: 0.25,
      }}
    >
      {icon}
      <span>{label}</span>
    </Box>
    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
      {value}
    </Typography>
  </Box>
);

export default WorkPage;
