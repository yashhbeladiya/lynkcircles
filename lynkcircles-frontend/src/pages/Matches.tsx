import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { MapPin, MessageSquare, ShieldCheck, Sparkles, Wallet } from "lucide-react";

import { UserAvatar } from "@/components/ui";
import { useMatches, type JobMatch, type WorkerMatch } from "@/hooks/useMatches";
import { useAuthUser } from "@/hooks/useAuthUser";
import { serviceLabel } from "@/data/serviceCatalog";

const scoreToBucket = (s: number) => {
  if (s >= 0.45) return "high";
  if (s >= 0.2) return "medium";
  return "low";
};

const ScoreBar = ({ value }: { value: number }) => {
  const pct = Math.min(100, Math.round(value * 100));
  const bucket = scoreToBucket(value);
  const color =
    bucket === "high" ? "#10b981" : bucket === "medium" ? "#6366f1" : "#a1a1aa";
  return (
    <Box sx={{ minWidth: 120 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 0.5,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.6875rem",
            color: "text.tertiary",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Match
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.8125rem",
            fontWeight: 800,
            color,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {pct}%
        </Typography>
      </Box>
      <Box
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: "action.hover",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: color,
            transition: "width 240ms ease",
          }}
        />
      </Box>
    </Box>
  );
};

const MatchTerms = ({ terms }: { terms: string[] }) =>
  terms.length === 0 ? null : (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
      {terms.slice(0, 5).map((t) => (
        <Box
          key={t}
          sx={{
            px: 0.875,
            py: 0.25,
            borderRadius: 999,
            backgroundColor: "rgba(99,102,241,0.1)",
            color: "primary.main",
            fontSize: "0.6875rem",
            fontWeight: 600,
          }}
        >
          {t}
        </Box>
      ))}
    </Box>
  );

const JobMatchCard = ({ m }: { m: JobMatch }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
      gap: 2,
      alignItems: "center",
      p: { xs: 2, sm: 2.5 },
      borderRadius: 2,
      border: 1,
      borderColor: "divider",
      backgroundColor: "background.paper",
      transition: "border-color 120ms ease, transform 120ms ease",
      "&:hover": { borderColor: "primary.main", transform: "translateY(-1px)" },
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.75, mb: 0.5 }}>
        <Chip
          label={m.job.jobType}
          size="small"
          sx={{
            fontSize: "0.625rem",
            height: 20,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        />
        {m.job.serviceKeys?.slice(0, 2).map((k) => (
          <Chip
            key={k}
            label={serviceLabel(k)}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.625rem", height: 20 }}
          />
        ))}
      </Box>
      <Typography
        component={RouterLink}
        to={`/works/${m.job._id}`}
        sx={{
          display: "block",
          fontWeight: 700,
          fontSize: "1rem",
          lineHeight: 1.3,
          color: "text.primary",
          textDecoration: "none",
          "&:hover": { color: "primary.main" },
        }}
      >
        {m.job.jobTitle}
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, mt: 0.75, flexWrap: "wrap", color: "text.secondary" }}>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.375, fontSize: "0.8125rem" }}>
          <Wallet size={13} aria-hidden />
          <span>{m.job.budget}</span>
        </Box>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.375, fontSize: "0.8125rem" }}>
          <MapPin size={13} aria-hidden />
          <span>{m.job.location}</span>
        </Box>
      </Box>
      <MatchTerms terms={m.matchedTerms} />
    </Box>
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "row", sm: "column" },
        gap: 1.5,
        alignItems: { xs: "center", sm: "flex-end" },
        justifyContent: "space-between",
      }}
    >
      <ScoreBar value={m.score} />
      <Button
        component={RouterLink}
        to={`/works/${m.job._id}`}
        variant="contained"
        size="small"
        sx={{ fontWeight: 600 }}
      >
        View job
      </Button>
    </Box>
  </Box>
);

const WorkerMatchCard = ({ m }: { m: WorkerMatch }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
      gap: 2,
      alignItems: "center",
      p: { xs: 2, sm: 2.5 },
      borderRadius: 2,
      border: 1,
      borderColor: "divider",
      backgroundColor: "background.paper",
      transition: "border-color 120ms ease, transform 120ms ease",
      "&:hover": { borderColor: "primary.main", transform: "translateY(-1px)" },
    }}
  >
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", minWidth: 0 }}>
      <UserAvatar user={m.worker} size="lg" verified={m.worker.verified} />
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            {m.worker.firstName} {m.worker.lastName}
          </Typography>
          {m.worker.verified ? <ShieldCheck size={14} color="#10b981" aria-label="Verified" /> : null}
        </Box>
        {m.worker.headline ? (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              fontSize: "0.8125rem",
              mt: 0.25,
            }}
          >
            {m.worker.headline}
          </Typography>
        ) : null}
        <MatchTerms terms={m.matchedTerms} />
      </Box>
    </Box>
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "row", sm: "column" },
        gap: 1.5,
        alignItems: { xs: "center", sm: "flex-end" },
        justifyContent: "space-between",
      }}
    >
      <ScoreBar value={m.score} />
      <Box sx={{ display: "flex", gap: 0.75 }}>
        <Button
          component={RouterLink}
          to={`/messages/${m.worker._id}`}
          variant="contained"
          size="small"
          startIcon={<MessageSquare size={14} />}
          sx={{ fontWeight: 600 }}
        >
          Message
        </Button>
        <Button
          component={RouterLink}
          to={`/profile/${m.worker.username}`}
          variant="outlined"
          size="small"
          sx={{ fontWeight: 600 }}
        >
          Profile
        </Button>
      </Box>
    </Box>
  </Box>
);

const EmptyState = ({ isWorker }: { isWorker: boolean }) => (
  <Box
    sx={{
      p: 6,
      borderRadius: 2,
      border: 1,
      borderColor: "divider",
      backgroundColor: "background.paper",
      textAlign: "center",
    }}
  >
    <Sparkles size={28} style={{ color: "#6366f1" }} aria-hidden />
    <Typography variant="h6" sx={{ fontWeight: 700, mt: 1.5 }}>
      No matches yet
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
      {isWorker
        ? "Add services to your profile so we can match jobs to your skills."
        : "Post a job — we'll rank workers by how well they fit it."}
    </Typography>
  </Box>
);

const Matches = () => {
  const { data: user } = useAuthUser();
  const { data, isLoading } = useMatches();

  if (isLoading || !user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  const isWorker = user.role === "Worker";

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: "auto",
        px: { xs: 1.5, sm: 2.5, md: 3 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          mb: 3,
          p: { xs: 2.5, sm: 3 },
          borderRadius: 2,
          color: "#fff",
          background: (t) =>
            t.palette.mode === "dark"
              ? "linear-gradient(135deg, #312e81 0%, #4f46e5 100%)"
              : "linear-gradient(135deg, #4338ca 0%, #6366f1 100%)",
          boxShadow: (t) =>
            t.palette.mode === "dark"
              ? "0 14px 30px -10px rgba(67,56,202,0.55)"
              : "0 14px 30px -10px rgba(67,56,202,0.4)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Sparkles size={16} aria-hidden />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              fontSize: "0.6875rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Semantic match
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em", mt: 0.75 }}>
          {isWorker ? "Jobs picked for you" : "Workers picked for your latest post"}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, color: "rgba(255,255,255,0.85)", maxWidth: 640 }}>
          Ranked by how closely the language of {isWorker ? "each job" : "each worker profile"} overlaps
          with {isWorker ? "your services, headline, and bio" : "your job description"} — TF-IDF cosine
          similarity, computed server-side.
        </Typography>
      </Box>

      {data && data.matches.length > 0 ? (
        <Box sx={{ display: "grid", gap: 1.25 }}>
          {data.matches.map((m, i) =>
            m.kind === "job" ? (
              <JobMatchCard key={`j-${i}`} m={m as JobMatch} />
            ) : (
              <WorkerMatchCard key={`w-${i}`} m={m as WorkerMatch} />
            ),
          )}
        </Box>
      ) : (
        <EmptyState isWorker={isWorker} />
      )}
    </Box>
  );
};

export default Matches;
