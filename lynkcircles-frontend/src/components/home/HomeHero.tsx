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
      sx={(theme) => ({
        display: "flex",
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        p: { xs: 2.5, sm: 3 },
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(99, 102, 241, 0.08) 100%)`
            : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.main}0a 100%)`,
        mb: 3,
      })}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            letterSpacing: "-0.02em",
            fontSize: { xs: "1.5rem", sm: "1.75rem" },
          }}
        >
          {greeting}, {user.firstName}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, maxWidth: 520 }}
        >
          {isClient ? t("home.subtitle.client") : t("home.subtitle.worker")}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
        {isClient ? (
          <Button
            variant="contained"
            size="medium"
            startIcon={<Briefcase size={16} />}
            onClick={onPostJob}
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
          >
            {t("home.cta.browseJobs")}
          </Button>
        )}
      </Box>
    </Box>
  );
};
