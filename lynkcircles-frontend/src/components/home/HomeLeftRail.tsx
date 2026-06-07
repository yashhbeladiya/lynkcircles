import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { Bookmark, Briefcase, MapPin, MessageSquare, Sparkles } from "lucide-react";

import { UserAvatar } from "@/components/ui";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useSavedWorkers } from "@/hooks/useSavedWorkers";
import { useMyApplications, useMyJobPosts } from "@/hooks/useJobPosts";

const RailRow = ({
  icon,
  label,
  value,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  to: string;
}) => (
  <Box
    component={RouterLink}
    to={to}
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 1,
      px: 1.25,
      py: 1,
      borderRadius: 1.5,
      color: "inherit",
      textDecoration: "none",
      transition: "background-color 120ms ease",
      "&:hover": { backgroundColor: "action.hover" },
    }}
  >
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      <Box sx={{ color: "text.tertiary", display: "inline-flex" }}>{icon}</Box>
      <Typography
        variant="body2"
        sx={{
          fontSize: "0.8125rem",
          color: "text.primary",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
    </Box>
    <Typography
      variant="caption"
      sx={{
        fontWeight: 700,
        fontSize: "0.75rem",
        color: "text.secondary",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {value}
    </Typography>
  </Box>
);

export const HomeLeftRail = () => {
  const { data: user } = useAuthUser();
  const { data: saved } = useSavedWorkers();
  const myApps = useMyApplications();
  const myPosts = useMyJobPosts();

  if (!user) return null;
  const isClient = user.role === "Client";
  const locationText = [user.location?.city, user.location?.state]
    .filter(Boolean)
    .join(", ");

  return (
    <Box
      component="aside"
      aria-label="Profile and quick links"
      sx={{
        position: { lg: "sticky" },
        top: { lg: 76 },
        alignSelf: "start",
      }}
    >
      <Box
        sx={{
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: 56,
            background: (t) =>
              t.palette.mode === "dark"
                ? `linear-gradient(135deg, #312e81 0%, #4f46e5 100%)`
                : `linear-gradient(135deg, #4338ca 0%, #6366f1 100%)`,
          }}
        />
        <Box sx={{ px: 2, pb: 2, mt: -3.5, textAlign: "center" }}>
          <Box
            component={RouterLink}
            to={`/profile/${user.username}`}
            sx={{
              display: "inline-block",
              borderRadius: "50%",
              outline: "3px solid",
              outlineColor: "background.paper",
              boxShadow: 1,
              textDecoration: "none",
            }}
          >
            <UserAvatar user={user} size="lg" verified={user.verified} />
          </Box>
          <Typography
            component={RouterLink}
            to={`/profile/${user.username}`}
            variant="subtitle1"
            sx={{
              display: "block",
              mt: 1,
              fontWeight: 700,
              letterSpacing: "-0.015em",
              color: "text.primary",
              textDecoration: "none",
              "&:hover": { color: "primary.main" },
            }}
          >
            {user.firstName} {user.lastName}
          </Typography>
          {user.headline ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                fontSize: "0.75rem",
                lineHeight: 1.4,
                mt: 0.25,
              }}
            >
              {user.headline}
            </Typography>
          ) : null}
          {locationText ? (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                mt: 0.75,
                color: "text.tertiary",
                fontSize: "0.6875rem",
              }}
            >
              <MapPin size={11} aria-hidden />
              <span>{locationText}</span>
            </Box>
          ) : null}
        </Box>
        <Divider />
        <Box sx={{ p: 1 }}>
          {isClient ? (
            <>
              <RailRow
                icon={<Bookmark size={15} />}
                label="Saved workers"
                value={saved?.length ?? 0}
                to="/map"
              />
              <RailRow
                icon={<Briefcase size={15} />}
                label="My job posts"
                value={myPosts.data?.length ?? 0}
                to="/works"
              />
              <RailRow
                icon={<Sparkles size={15} />}
                label="Top matches"
                value="View"
                to="/matches"
              />
              <RailRow
                icon={<MessageSquare size={15} />}
                label="Messages"
                value="Open"
                to="/messages"
              />
            </>
          ) : (
            <>
              <RailRow
                icon={<Briefcase size={15} />}
                label="My applications"
                value={myApps.data?.length ?? 0}
                to="/works"
              />
              <RailRow
                icon={<Sparkles size={15} />}
                label="Matched jobs"
                value="View"
                to="/matches"
              />
              <RailRow
                icon={<MapPin size={15} />}
                label="Jobs near me"
                value="Map"
                to="/map"
              />
              <RailRow
                icon={<MessageSquare size={15} />}
                label="Messages"
                value="Open"
                to="/messages"
              />
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};
