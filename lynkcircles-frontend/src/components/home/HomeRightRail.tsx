import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { ArrowRight, Briefcase, Map, Sparkles } from "lucide-react";

import { UserAvatar } from "@/components/ui";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useMatches, type JobMatch, type WorkerMatch } from "@/hooks/useMatches";
import { useMapData } from "@/hooks/useDiscovery";
import { SERVICE_CATALOG } from "@/data/serviceCatalog";

interface Props {
  onPostJob: () => void;
}

const RailCard = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      borderRadius: 2,
      border: 1,
      borderColor: "divider",
      backgroundColor: "background.paper",
      p: 2,
    }}
  >
    {children}
  </Box>
);

const RailLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography
    variant="caption"
    sx={{
      display: "block",
      fontWeight: 700,
      fontSize: "0.6875rem",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "text.tertiary",
      mb: 1.25,
    }}
  >
    {children}
  </Typography>
);

const TopMatch = () => {
  const { data: user } = useAuthUser();
  const { data, isLoading } = useMatches();

  if (isLoading) {
    return (
      <RailCard>
        <RailLabel>Top match for you</RailLabel>
        <Skeleton width="80%" height={18} />
        <Skeleton width="60%" height={14} sx={{ mt: 0.5 }} />
        <Skeleton width="100%" height={30} sx={{ mt: 1.5, borderRadius: 1 }} />
      </RailCard>
    );
  }
  if (!data?.matches.length) return null;

  const top = data.matches[0];
  const pct = Math.round(top.score * 100);

  if (top.kind === "job") {
    const j = (top as JobMatch).job;
    return (
      <RailCard>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          <Sparkles size={13} color="var(--mui-palette-primary-main)" aria-hidden />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              fontSize: "0.6875rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "primary.main",
            }}
          >
            Top match · {pct}%
          </Typography>
        </Box>
        <Typography
          component={RouterLink}
          to={`/works/${j._id}`}
          sx={{
            display: "block",
            fontWeight: 700,
            fontSize: "0.9375rem",
            lineHeight: 1.3,
            color: "text.primary",
            textDecoration: "none",
            "&:hover": { color: "primary.main" },
          }}
        >
          {j.jobTitle}
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", color: "text.secondary", mt: 0.25, fontSize: "0.75rem" }}
        >
          {j.location} · {j.budget}
        </Typography>
        {top.matchedTerms.length > 0 ? (
          <Typography
            variant="caption"
            sx={{ display: "block", color: "text.tertiary", mt: 0.75, fontSize: "0.7rem" }}
          >
            Matches: {top.matchedTerms.slice(0, 3).join(", ")}
          </Typography>
        ) : null}
        <Button
          component={RouterLink}
          to="/matches"
          fullWidth
          variant="text"
          size="small"
          endIcon={<ArrowRight size={14} />}
          sx={{ mt: 1.25, justifyContent: "space-between", fontWeight: 600 }}
        >
          See all matched jobs
        </Button>
      </RailCard>
    );
  }

  const w = (top as WorkerMatch).worker;
  return (
    <RailCard>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
        <Sparkles size={13} color="var(--mui-palette-primary-main)" aria-hidden />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: "0.6875rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "primary.main",
          }}
        >
          {user?.role === "Client" ? "Best match for your latest post" : "Top match"} · {pct}%
        </Typography>
      </Box>
      <Box
        component={RouterLink}
        to={`/profile/${w.username}`}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <UserAvatar user={w} size="md" verified={w.verified} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
            {w.firstName} {w.lastName}
          </Typography>
          {w.headline ? (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
                fontSize: "0.7rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {w.headline}
            </Typography>
          ) : null}
        </Box>
      </Box>
      <Button
        component={RouterLink}
        to="/matches"
        fullWidth
        variant="text"
        size="small"
        endIcon={<ArrowRight size={14} />}
        sx={{ mt: 1.5, justifyContent: "space-between", fontWeight: 600 }}
      >
        See all matched workers
      </Button>
    </RailCard>
  );
};

const NearbyTeaser = () => {
  const { data, isLoading } = useMapData();
  const workerCount = data?.workers.length ?? 0;
  const jobCount = data?.jobs.length ?? 0;

  return (
    <RailCard>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Map size={14} color="var(--mui-palette-text-secondary)" aria-hidden />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: "0.6875rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "text.tertiary",
          }}
        >
          On the map
        </Typography>
      </Box>
      {isLoading ? (
        <>
          <Skeleton width="70%" height={16} />
          <Skeleton width="50%" height={16} sx={{ mt: 0.5 }} />
        </>
      ) : (
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}
            >
              {workerCount}
            </Typography>
            <Typography variant="caption" color="text.tertiary" sx={{ fontSize: "0.7rem" }}>
              workers
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}
            >
              {jobCount}
            </Typography>
            <Typography variant="caption" color="text.tertiary" sx={{ fontSize: "0.7rem" }}>
              open jobs
            </Typography>
          </Box>
        </Box>
      )}
      <Button
        component={RouterLink}
        to="/map"
        fullWidth
        variant="outlined"
        size="small"
        endIcon={<ArrowRight size={14} />}
        sx={{ mt: 1.5, justifyContent: "space-between", fontWeight: 600 }}
      >
        Open the map
      </Button>
    </RailCard>
  );
};

const QuickActionCard = ({ onPostJob, isClient }: { onPostJob: () => void; isClient: boolean }) => (
  <Box
    sx={{
      borderRadius: 2,
      p: 2.25,
      color: "#ffffff",
      background: (t) =>
        t.palette.mode === "dark"
          ? `linear-gradient(135deg, #312e81 0%, #4f46e5 100%)`
          : `linear-gradient(135deg, #4338ca 0%, #6366f1 100%)`,
      boxShadow: (t) =>
        t.palette.mode === "dark"
          ? "0 10px 25px -10px rgba(67, 56, 202, 0.55)"
          : "0 10px 25px -10px rgba(67, 56, 202, 0.45)",
    }}
  >
    <Typography variant="body1" sx={{ fontWeight: 700, letterSpacing: "-0.015em" }}>
      {isClient ? "Need someone today?" : "Find work today."}
    </Typography>
    <Typography variant="caption" sx={{ display: "block", color: "rgba(255,255,255,0.85)", mt: 0.5 }}>
      {isClient
        ? "Post a job in under a minute — get applicants the same day."
        : "Browse open jobs near you, ranked by match score."}
    </Typography>
    {isClient ? (
      <Button
        onClick={onPostJob}
        fullWidth
        startIcon={<Briefcase size={15} />}
        sx={{
          mt: 1.5,
          bgcolor: "#ffffff",
          color: "primary.main",
          fontWeight: 700,
          "&:hover": { bgcolor: "#f4f4f5" },
        }}
      >
        Post a job
      </Button>
    ) : (
      <Button
        component={RouterLink}
        to="/works"
        fullWidth
        sx={{
          mt: 1.5,
          bgcolor: "#ffffff",
          color: "primary.main",
          fontWeight: 700,
          "&:hover": { bgcolor: "#f4f4f5" },
        }}
      >
        Browse open jobs
      </Button>
    )}
  </Box>
);

const TrendingServices = () => {
  const flat = SERVICE_CATALOG.flatMap((c) => c.services).slice(0, 8);
  return (
    <RailCard>
      <RailLabel>Trending services</RailLabel>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.625 }}>
        {flat.map((s) => (
          <Box
            key={s.key}
            component={RouterLink}
            to={`/works?service=${s.key}`}
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              px: 1.25,
              py: 0.5,
              borderRadius: 999,
              border: 1,
              borderColor: "divider",
              color: "text.secondary",
              textDecoration: "none",
              transition: "all 120ms ease",
              "&:hover": {
                borderColor: "primary.main",
                color: "primary.main",
                backgroundColor: "action.hover",
              },
            }}
          >
            {s.label}
          </Box>
        ))}
      </Box>
    </RailCard>
  );
};

export const HomeRightRail = ({ onPostJob }: Props) => {
  const { data: user } = useAuthUser();
  if (!user) return null;
  const isClient = user.role === "Client";

  return (
    <Box
      component="aside"
      aria-label="Suggestions"
      sx={{
        position: { lg: "sticky" },
        top: { lg: 76 },
        alignSelf: "start",
        display: "grid",
        gap: 1.5,
      }}
    >
      <TopMatch />
      <NearbyTeaser />
      <QuickActionCard onPostJob={onPostJob} isClient={isClient} />
      <TrendingServices />
    </Box>
  );
};
