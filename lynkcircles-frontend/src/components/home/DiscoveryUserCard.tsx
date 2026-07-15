import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { MapPin, ShieldCheck } from "lucide-react";

import { UserAvatar } from "@/components/ui";
import { formatDistance } from "@/lib/geo";
import type { UserSummary } from "@/types/user";

interface Props {
  user: UserSummary;
}

const formatLocation = (loc?: UserSummary["location"]) => {
  if (!loc) return null;
  const parts = [loc.city, loc.state].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
};

export const DiscoveryUserCard = ({ user }: Props) => {
  const location = formatLocation(user.location);

  return (
    <Box
      component={Link}
      to={`/profile/${user.username}`}
      sx={(theme) => ({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        textDecoration: "none",
        color: "inherit",
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        backgroundColor: theme.palette.background.paper,
        transition: "border-color 120ms ease, transform 120ms ease, box-shadow 120ms ease",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-1px)",
          boxShadow: 1,
        },
      })}
    >
      <UserAvatar user={user} size="xl" verified={user.verified} />
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          mt: 1.25,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
          {user.firstName} {user.lastName}
        </Typography>
        {user.verified ? (
          <ShieldCheck
            size={12}
            color="var(--mui-palette-success-main, #10b981)"
            aria-label="Verified"
          />
        ) : null}
      </Box>
      {user.headline ? (
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontSize: "0.6875rem",
            mt: 0.25,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
            display: "block",
          }}
        >
          {user.headline}
        </Typography>
      ) : null}
      {location || formatDistance(user.distanceKm) ? (
        <Box
          sx={{
            mt: 0.5,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.25,
            color: "text.tertiary",
            fontSize: "0.625rem",
          }}
        >
          <MapPin size={10} aria-hidden />
          <span>
            {formatDistance(user.distanceKm) ?? location}
          </span>
        </Box>
      ) : null}
    </Box>
  );
};
