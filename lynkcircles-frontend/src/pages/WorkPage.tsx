import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  useHireApplicant,
  useJobApplicants,
  useJobPost,
  useMarkJobComplete,
  useUpdateJobPost,
  useWithdrawApplication,
} from "@/hooks/useJobPosts";
import { JobReviewDialog } from "@/components/works/JobReviewDialog";
import type { JobStatus } from "@/types/jobPost";
import type { UserSummary } from "@/types/user";

import { Award, HandCoins, Sparkles } from "lucide-react";

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

const isUserSummary = (
  v: string | UserSummary | null | undefined
): v is UserSummary =>
  !!v && typeof v === "object" && "_id" in v && "username" in v;

const WorkPage = () => {
  const { t } = useTranslation();
  const { workPostId } = useParams<{ workPostId: string }>();
  const navigate = useNavigate();
  const { data: authUser } = useAuthUser();
  const { data: job, isLoading } = useJobPost(workPostId);
  const apply = useApplyForJob();
  const withdraw = useWithdrawApplication();
  const updateJob = useUpdateJobPost();
  const deleteJob = useDeleteJobPost();
  const hireApplicantMut = useHireApplicant();
  const markComplete = useMarkJobComplete();
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const isOwner = !!job && authUser?._id === job.author._id;
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
  const hired = isUserSummary(job.hiredWorker) ? job.hiredWorker : null;
  const viewerIsHired =
    !!authUser && hired?._id === authUser._id;

  const handleStatusChange = (status: JobStatus) => {
    setStatusAnchor(null);
    if (job.status === status) return;
    updateJob.mutate({ id: job._id, status });
  };

  const handleDelete = () => {
    if (!window.confirm(t("workPage.confirm.deleteJob"))) return;
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
        {t("workPage.backToJobs")}
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
              {t("workPage.postedAgo", { time: formatDistanceToNowStrict(new Date(job.createdAt)) })}
            </Typography>
          </Box>

          {isOwner ? (
            <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 0.75 }, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {job.status === "In Progress" ? (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CheckCircle size={14} />}
                  onClick={() => markComplete.mutate(job._id)}
                  disabled={markComplete.isPending}
                >
                  {t("workPage.actions.markComplete")}
                </Button>
              ) : null}
              {job.status === "Completed" && !job.reviewed ? (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Award size={14} />}
                  onClick={() => setReviewOpen(true)}
                >
                  {t("workPage.actions.leaveReview")}
                </Button>
              ) : null}
              {job.status === "Completed" && job.reviewed ? (
                <Chip
                  icon={<Award size={12} />}
                  label={t("workPage.actions.reviewed")}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              ) : null}
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => setStatusAnchor(e.currentTarget)}
              >
                {t("workPage.actions.status")}
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
              {viewerIsHired ? (
                <Chip
                  icon={<Sparkles size={12} />}
                  label={t("workPage.actions.youWereHired")}
                  size="small"
                  color="primary"
                  variant="filled"
                  sx={{ fontWeight: 600 }}
                />
              ) : hasApplied ? (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<XCircle size={14} />}
                  onClick={() => withdraw.mutate(job._id)}
                  disabled={withdraw.isPending || closed}
                >
                  {closed ? t("workPage.actions.positionFilled") : t("workPage.actions.withdrawApplication")}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CheckCircle size={14} />}
                  onClick={() => apply.mutate(job._id)}
                  disabled={apply.isPending || closed}
                >
                  {closed ? t("workPage.actions.closed") : t("workPage.actions.apply")}
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
          <MetaTile
            icon={<Wallet size={14} aria-hidden />}
            label={
              job.jobType === "employment"
                ? t("workPage.meta.salary")
                : job.jobType === "recurring"
                  ? t("workPage.meta.pay")
                  : t("workPage.meta.budget")
            }
            value={job.budget}
          />
          <MetaTile icon={<MapPin size={14} aria-hidden />} label={t("workPage.meta.location")} value={job.location} />
          {job.jobType === "recurring" && job.frequency ? (
            <MetaTile
              icon={<Calendar size={14} aria-hidden />}
              label={t("workPage.meta.frequency")}
              value={job.frequency}
            />
          ) : null}
          {job.jobType === "employment" && job.schedule ? (
            <MetaTile
              icon={<Briefcase size={14} aria-hidden />}
              label={t("workPage.meta.schedule")}
              value={job.schedule}
            />
          ) : null}
          {job.jobType === "employment" && typeof job.experienceMinYears === "number" ? (
            <MetaTile
              icon={<Briefcase size={14} aria-hidden />}
              label={t("workPage.meta.experience")}
              value={`${job.experienceMinYears}+ yrs`}
            />
          ) : null}
          {job.requiredOn ? (
            <MetaTile
              icon={<Calendar size={14} aria-hidden />}
              label={
                job.jobType === "gig" || !job.jobType ? t("workPage.meta.neededBy") : t("workPage.meta.startDate")
              }
              value={format(new Date(job.requiredOn), "MMM d, yyyy")}
            />
          ) : null}
          {job.deadline ? (
            <MetaTile
              icon={<Clock size={14} aria-hidden />}
              label={t("workPage.meta.applicationsClose")}
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
              {job.author.headline ?? t("workPage.sections.postedThisJob")}
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
          {t("workPage.sections.jobDescription")}
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
              {t("workPage.sections.skillsNeeded")}
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

      {hired ? (
        <Box
          sx={(theme) => ({
            p: { xs: 2, md: 2.5 },
            borderRadius: 2,
            border: 1,
            borderColor: "primary.main",
            backgroundColor: theme.palette.mode === "dark"
              ? "rgba(99, 102, 241, 0.08)"
              : "rgba(99, 102, 241, 0.05)",
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          })}
        >
          <HandCoins size={20} color="var(--mui-palette-primary-main)" aria-hidden />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{ color: "primary.main", display: "block", fontSize: "0.625rem" }}
            >
              {t("workPage.sections.hiredWorker")}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
              <Box
                component={Link}
                to={`/profile/${hired.username}`}
                sx={{ display: "flex", textDecoration: "none" }}
              >
                <UserAvatar user={hired} size="sm" verified={hired.verified} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component={Link}
                  to={`/profile/${hired.username}`}
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {hired.firstName} {hired.lastName}
                </Typography>
                {hired.headline ? (
                  <Typography
                    variant="caption"
                    sx={{ display: "block", color: "text.tertiary", fontSize: "0.6875rem" }}
                  >
                    {hired.headline}
                  </Typography>
                ) : null}
              </Box>
            </Box>
          </Box>
          <Button
            component={Link}
            to={`/messages/${hired._id}`}
            size="small"
            variant="outlined"
            startIcon={<MessageSquare size={13} />}
          >
            {t("workPage.actions.message")}
          </Button>
        </Box>
      ) : null}

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
              {t("workPage.sections.applicants", { count: applicants?.length ?? 0 })}
            </Typography>
            <MoreHorizontal size={14} aria-hidden style={{ opacity: 0 }} />
          </Box>
          {!applicants || applicants.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t("workPage.empty.noApplicants.title")}
              description={t("workPage.empty.noApplicants.description")}
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
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      component={Link}
                      to={`/messages/${applicant._id}`}
                      size="small"
                      variant="outlined"
                      startIcon={<MessageSquare size={13} />}
                    >
                      {t("workPage.actions.message")}
                    </Button>
                    {job.status === "Open" ? (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<HandCoins size={13} />}
                        onClick={() => {
                          if (
                            window.confirm(
                              t("workPage.confirm.hireWorker", { name: applicant.firstName })
                            )
                          ) {
                            hireApplicantMut.mutate({
                              jobId: job._id,
                              workerId: applicant._id,
                            });
                          }
                        }}
                        disabled={hireApplicantMut.isPending}
                      >
                        {t("workPage.actions.hire")}
                      </Button>
                    ) : null}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ) : null}

      <JobReviewDialog
        jobId={job._id}
        jobTitle={job.jobTitle}
        hiredWorkerName={
          hired ? `${hired.firstName} ${hired.lastName}` : undefined
        }
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
      />
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
