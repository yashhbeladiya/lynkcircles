import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { Check, Circle, ShieldCheck } from "lucide-react";

import { useMyVerification } from "@/hooks/useVerification";

interface Row {
  key: string;
  label: string;
  have: number;
  need: number;
  met: boolean;
  display: string;
}

export const VerificationCard = ({ enabled = true }: { enabled?: boolean }) => {
  const { data, isLoading } = useMyVerification(enabled);

  if (!enabled || isLoading || !data || data.allMet) return null;

  const rows: Row[] = [
    {
      key: "portfolio",
      label: "Log at least one portfolio entry",
      have: data.criteria.portfolio.have,
      need: data.criteria.portfolio.need,
      met: data.criteria.portfolio.met,
      display: `${data.criteria.portfolio.have} / ${data.criteria.portfolio.need}`,
    },
    {
      key: "completedJobs",
      label: "Complete at least one job through LynkCircles",
      have: data.criteria.completedJobs.have,
      need: data.criteria.completedJobs.need,
      met: data.criteria.completedJobs.met,
      display: `${data.criteria.completedJobs.have} / ${data.criteria.completedJobs.need}`,
    },
    {
      key: "reviewCount",
      label: "Collect 3 client reviews",
      have: data.criteria.reviewCount.have,
      need: data.criteria.reviewCount.need,
      met: data.criteria.reviewCount.met,
      display: `${data.criteria.reviewCount.have} / ${data.criteria.reviewCount.need}`,
    },
    {
      key: "avgRating",
      label: "Average rating of 4.0 or higher",
      have: data.criteria.avgRating.have,
      need: data.criteria.avgRating.need,
      met: data.criteria.avgRating.met,
      display:
        data.criteria.reviewCount.have > 0
          ? `${data.criteria.avgRating.have.toFixed(2)} / ${data.criteria.avgRating.need}`
          : "Need reviews first",
    },
  ];

  const completedCount = rows.filter((r) => r.met).length;
  const progress = (completedCount / rows.length) * 100;

  return (
    <Box
      sx={(theme) => ({
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        backgroundColor: theme.palette.background.paper,
        mb: 2,
      })}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <ShieldCheck size={16} color="var(--mui-palette-success-main)" aria-hidden />
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          Get verified
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Verified workers get hired more. Hit every milestone below and the badge
        flips automatically.
      </Typography>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 3,
          mb: 2,
          backgroundColor: "action.hover",
          "& .MuiLinearProgress-bar": {
            backgroundColor: "success.main",
          },
        }}
      />

      <Box sx={{ display: "grid", gap: 1 }}>
        {rows.map((row) => (
          <Box
            key={row.key}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              p: 1,
              borderRadius: 1.5,
              border: 1,
              borderColor: row.met ? "success.main" : "divider",
              backgroundColor: row.met ? "rgba(16, 185, 129, 0.08)" : "transparent",
            }}
          >
            {row.met ? (
              <Check
                size={14}
                color="var(--mui-palette-success-main)"
                aria-hidden
              />
            ) : (
              <Circle size={14} color="var(--mui-palette-text-tertiary)" aria-hidden />
            )}
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                fontSize: "0.8125rem",
                color: row.met ? "success.main" : "text.primary",
                fontWeight: row.met ? 600 : 500,
                textDecoration: row.met ? "line-through" : "none",
              }}
            >
              {row.label}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: row.met ? "success.main" : "text.tertiary",
                fontSize: "0.6875rem",
                fontWeight: 600,
                fontFamily: "var(--mui-font-mono, monospace)",
              }}
            >
              {row.display}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
