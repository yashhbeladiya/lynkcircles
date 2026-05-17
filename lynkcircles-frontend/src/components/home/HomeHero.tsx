import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Briefcase, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAuthUser } from "@/hooks/useAuthUser";

interface Props {
  onPostJob: () => void;
}

const greetingKeyForHour = (hour: number): string => {
  if (hour < 5) return "home.greeting.lateNight";
  if (hour < 12) return "home.greeting.morning";
  if (hour < 17) return "home.greeting.afternoon";
  if (hour < 21) return "home.greeting.evening";
  return "home.greeting.lateNight";
};

/**
 * Greeting + role-specific call-to-action above the fold. The whole
 * point: a Client lands here and sees "Post a job", a Worker lands
 * and sees "Browse open jobs". One screen, two products, picked by
 * who's looking.
 *
 * This is the first component fully wired through i18n — every
 * user-facing string is a t(...) lookup. The rest of the app will
 * migrate incrementally; English fallbacks via fallbackLng mean
 * un-migrated strings keep working without churn.
 */
export const HomeHero = ({ onPostJob }: Props) => {
  const { t } = useTranslation();
  const { data: user } = useAuthUser();
  if (!user) return null;

  const greeting = t(greetingKeyForHour(new Date().getHours()));
  const isClient = user.role === "Client";

  return (
    <Box
      sx={() => ({
        position: "relative",
        overflow: "hidden",
        display: "flex",
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        p: { xs: 2.5, sm: 3 },
        borderRadius: 2,
        border: 1,
        borderColor: "transparent",
        // Brand gradient — sourced from the logo. This is the only
        // place the gradient leads the surface; everywhere else stays
        // flat so the gradient anchors the brand without dilution.
        background: (theme) =>
          theme.palette.mode === "dark"
            ? `linear-gradient(135deg, #312e81 0%, #4f46e5 60%, #6366f1 100%)`
            : `linear-gradient(135deg, #4338ca 0%, #6366f1 55%, #818cf8 100%)`,
        color: "#ffffff",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 10px 25px -10px rgba(67, 56, 202, 0.5)"
            : "0 10px 25px -10px rgba(67, 56, 202, 0.4)",
        mb: 3,
      })}
    >
      {/* Soft radial highlight in the top-right — adds depth so the
          flat gradient doesn't read as a single block of color. */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at top right, rgba(255,255,255,0.18), transparent 60%)",
        }}
      />
      <Box sx={{ minWidth: 0, position: "relative" }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            letterSpacing: "-0.02em",
            fontSize: { xs: "1.5rem", sm: "1.75rem" },
            color: "#ffffff",
          }}
        >
          {greeting}, {user.firstName}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mt: 0.5,
            maxWidth: 520,
            color: "rgba(255, 255, 255, 0.85)",
          }}
        >
          {isClient ? t("home.subtitle.client") : t("home.subtitle.worker")}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexShrink: 0, position: "relative" }}>
        {/* On the gradient hero, swap the primary button to a high-
            contrast white-on-brand pill so the CTA still reads as the
            highest-priority action against an already-colorful surface. */}
        {isClient ? (
          <Button
            variant="contained"
            size="medium"
            startIcon={<Briefcase size={16} />}
            onClick={onPostJob}
            sx={{
              bgcolor: "#ffffff",
              color: "primary.main",
              fontWeight: 600,
              "&:hover": { bgcolor: "#f4f4f5" },
            }}
          >
            {t("home.cta.postJob")}
          </Button>
        ) : (
          <Button
            component={Link}
            to="/works"
            variant="contained"
            size="medium"
            startIcon={<Search size={16} />}
            sx={{
              bgcolor: "#ffffff",
              color: "primary.main",
              fontWeight: 600,
              "&:hover": { bgcolor: "#f4f4f5" },
            }}
          >
            {t("home.cta.browseJobs")}
          </Button>
        )}
      </Box>
    </Box>
  );
};
