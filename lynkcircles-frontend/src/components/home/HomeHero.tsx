import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Briefcase, Search } from "lucide-react";

import { useAuthUser } from "@/hooks/useAuthUser";

interface Props {
  onPostJob: () => void;
}

const greetingForHour = (hour: number): string => {
  if (hour < 5) return "Up late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Up late";
};

/**
 * Greeting + role-specific call-to-action above the fold. The whole
 * point: a Client lands here and sees "Post a job", a Worker lands
 * and sees "Browse open jobs". One screen, two products, picked by
 * who's looking.
 */
export const HomeHero = ({ onPostJob }: Props) => {
  const { data: user } = useAuthUser();
  if (!user) return null;

  const greeting = greetingForHour(new Date().getHours());
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
          {isClient
            ? "Pick a Worker, post a job, or follow up on applicants — your hire-ready dashboard is below."
            : "New jobs in your trade, your active applications, and your network — everything in one scroll."}
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
            Post a job
          </Button>
        ) : (
          <Button
            component={Link}
            to="/works"
            variant="contained"
            size="medium"
            startIcon={<Search size={16} />}
          >
            Browse jobs
          </Button>
        )}
      </Box>
    </Box>
  );
};
