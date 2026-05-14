import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { Briefcase, MapPin, ShieldCheck } from "lucide-react";

import { UserAvatar } from "@/components/ui";
import type { UserSummary } from "@/types/user";

interface Props {
  user: UserSummary;
  actions?: ReactNode;
}

const formatLocation = (loc?: UserSummary["location"]) => {
  if (!loc) return null;
  const parts = [loc.city, loc.state].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
};

/**
 * One row in the Network page. Marketplace-flavored: shows what the
 * person does (role + headline), where they are, and a verified badge.
 * Action area is slot-provided so the same row works for Requests
 * (Accept/Decline), Connections (Message), and Discover (Connect).
 */
export const NetworkRow = ({ user, actions }: Props) => {
  const location = formatLocation(user.location);

  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.5,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        backgroundColor: theme.palette.background.paper,
        transition: "border-color 120ms ease, box-shadow 120ms ease",
        "&:hover": { borderColor: "primary.main" },
      })}
    >
      <Box
        component={Link}
        to={`/profile/${user.username}`}
        sx={{ display: "flex", textDecoration: "none" }}
      >
        <UserAvatar user={user} size="lg" verified={user.verified} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
          <Typography
            component={Link}
            to={`/profile/${user.username}`}
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {user.firstName} {user.lastName}
          </Typography>
          {user.verified ? (
            <ShieldCheck
              size={13}
              color="var(--mui-palette-success-main, #10b981)"
              aria-label="Verified"
            />
          ) : null}
          {user.role ? (
            <Chip
              label={user.role}
              size="small"
              icon={<Briefcase size={10} aria-hidden />}
              sx={{
                fontSize: "0.625rem",
                height: 18,
                "& .MuiChip-icon": { ml: 0.5 },
              }}
            />
          ) : null}
        </Box>
        {user.headline ? (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              fontSize: "0.75rem",
              mt: 0.25,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.headline}
          </Typography>
        ) : null}
        {location ? (
          <Typography
            variant="caption"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.375,
              color: "text.tertiary",
              fontSize: "0.6875rem",
              mt: 0.25,
            }}
          >
            <MapPin size={11} aria-hidden />
            {location}
          </Typography>
        ) : null}
      </Box>
      {actions ? (
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>{actions}</Box>
      ) : null}
    </Box>
  );
};
